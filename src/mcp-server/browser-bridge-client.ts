// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// UDP client for the Live Browser Bridge Python remote script.
// Lives on the Node-for-Max side (browser API is unreachable from Max v8 JS,
// so all browser tool calls forward through here over localhost UDP).

import { randomUUID } from "node:crypto";
import { type RemoteInfo, type Socket, createSocket } from "node:dgram";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 11_077;
const DEFAULT_BROWSE_TIMEOUT_MS = 10_000;
const DEFAULT_LOAD_TIMEOUT_MS = 30_000;
const DEFAULT_PING_TIMEOUT_MS = 1_500;
// How long a successful ping is treated as "bridge up". Avoids round-tripping
// a ping before every browse.
const PING_FRESHNESS_MS = 30_000;
const CLIENT_CLOSED_MESSAGE = "client closed";

export type BridgeErrorCode =
  | "BRIDGE_NOT_FOUND"
  | "MAIN_THREAD_ERROR"
  | "BROWSER_API_FAILED"
  | "INVALID_ARGS"
  | "TIMEOUT_INTERNAL";

export interface BridgeError {
  code: BridgeErrorCode;
  message: string;
}

interface BridgeReplyOk<T> {
  id: string;
  ok: true;
  result: T;
}

interface BridgeReplyErr {
  id: string;
  ok: false;
  error: BridgeError;
}

type BridgeReply<T> = BridgeReplyOk<T> | BridgeReplyErr;

interface BridgeRequest {
  id: string;
  op: "ping" | "browse" | "load_item" | "shutdown";
  args: Record<string, unknown>;
}

interface PendingCall<T> {
  resolve: (reply: BridgeReply<T>) => void;
  timer: ReturnType<typeof setTimeout>;
}

export interface BrowserBridgeClientOptions {
  host?: string;
  port?: number;
  /** Inject a socket factory for tests; defaults to node:dgram createSocket. */
  socketFactory?: () => Socket;
}

export interface PingResult {
  version: string;
  liveVersion: string;
}

export interface BrowseArgs {
  category?: string;
  path?: string;
  search?: string;
  depth?: number;
  limit?: number;
}

export interface BrowseItem {
  name: string;
  uri: string;
  isFolder: boolean;
  isDevice: boolean;
  isLoadable: boolean;
  children?: BrowseItem[];
}

export interface BrowseResult {
  category?: string;
  categories?: string[];
  path?: string;
  items: BrowseItem[];
  truncated?: boolean;
}

export interface LoadItemArgs {
  uri: string;
  category?: string;
}

export interface LoadItemResult {
  loaded: boolean;
  deviceId: string | null;
  deviceCountBefore: number;
  deviceCountAfter: number;
}

/**
 * Client for the Python browser bridge. One instance per process; methods are
 * safe to call concurrently (each request gets its own UUID).
 */
export class BrowserBridgeClient {
  private readonly host: string;
  private readonly port: number;
  private readonly socketFactory: () => Socket;
  private socket: Socket | null = null;
  private socketReady: Promise<void> | null = null;
  private readonly pending = new Map<string, PendingCall<unknown>>();
  private lastPingOkAt = 0;
  private closed = false;

  constructor(options: BrowserBridgeClientOptions = {}) {
    this.host = options.host ?? DEFAULT_HOST;
    const envPort = Number.parseInt(process.env.ADJ_BRIDGE_PORT ?? "", 10);

    this.port =
      options.port ?? (Number.isFinite(envPort) ? envPort : DEFAULT_PORT);
    this.socketFactory = options.socketFactory ?? (() => createSocket("udp4"));
  }

  /**
   * Verify the bridge responds. Result cached for 30 s on success.
   * @param timeoutMs - Milliseconds to wait before treating the bridge as down
   * @returns Bridge version + Live version reported by the sidecar
   */
  async ping(timeoutMs: number = DEFAULT_PING_TIMEOUT_MS): Promise<PingResult> {
    const reply = await this.send<PingResult>("ping", {}, timeoutMs);

    this.lastPingOkAt = Date.now();

    return reply;
  }

  /**
   * Returns true if a recent ping succeeded; otherwise sends a fresh one.
   * @returns Whether the bridge is currently reachable
   */
  async ensureAlive(): Promise<boolean> {
    if (Date.now() - this.lastPingOkAt < PING_FRESHNESS_MS) return true;

    try {
      await this.ping();

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Send a browse request to the bridge.
   * @param args - Browse arguments forwarded verbatim to the bridge
   * @param timeoutMs - Operation timeout in milliseconds
   * @returns Serialized browser tree slice
   */
  async browse(
    args: BrowseArgs,
    timeoutMs: number = DEFAULT_BROWSE_TIMEOUT_MS,
  ): Promise<BrowseResult> {
    return await this.send<BrowseResult>("browse", { ...args }, timeoutMs);
  }

  /**
   * Load an item by browser URI into the currently focused track/device.
   * @param args - URI plus optional category to scope the lookup
   * @param timeoutMs - Operation timeout in milliseconds
   * @returns Loader result reporting the new device id (when available)
   */
  async loadItem(
    args: LoadItemArgs,
    timeoutMs: number = DEFAULT_LOAD_TIMEOUT_MS,
  ): Promise<LoadItemResult> {
    return await this.send<LoadItemResult>("load_item", { ...args }, timeoutMs);
  }

  /** Tear down the client. Outstanding requests reject with TIMEOUT_INTERNAL. */
  close(): void {
    this.closed = true;

    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.resolve({
        id,
        ok: false,
        error: {
          code: "TIMEOUT_INTERNAL",
          message: CLIENT_CLOSED_MESSAGE,
        },
      });
    }

    this.pending.clear();

    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        /* noop */
      }

      this.socket = null;
      this.socketReady = null;
    }
  }

  private async send<T>(
    op: BridgeRequest["op"],
    args: Record<string, unknown>,
    timeoutMs: number,
  ): Promise<T> {
    if (this.closed) {
      throw new BridgeCallError({
        code: "TIMEOUT_INTERNAL",
        message: CLIENT_CLOSED_MESSAGE,
      });
    }

    await this.ensureSocket();
    // ensureSocket awaits, so re-check the closed flag without TS narrowing.
    const closedNow = (this as unknown as { closed: boolean }).closed;
    const socket = this.socket;

    if (closedNow || !socket) {
      throw new BridgeCallError({
        code: closedNow ? "TIMEOUT_INTERNAL" : "BRIDGE_NOT_FOUND",
        message: closedNow
          ? CLIENT_CLOSED_MESSAGE
          : "bridge socket unavailable",
      });
    }

    const id = `req_${randomUUID()}`;
    const request: BridgeRequest = { id, op, args };
    const payload = Buffer.from(JSON.stringify(request), "utf8");

    const replyPromise = new Promise<BridgeReply<T>>((resolve) => {
      const timer = setTimeout(() => {
        if (this.pending.delete(id)) {
          resolve({
            id,
            ok: false,
            error: {
              code: "TIMEOUT_INTERNAL",
              message: `bridge ${op} timed out after ${timeoutMs}ms`,
            },
          });
        }
      }, timeoutMs);

      this.pending.set(id, {
        resolve: resolve as (reply: BridgeReply<unknown>) => void,
        timer,
      });
    });

    await new Promise<void>((resolve, reject) => {
      socket.send(payload, this.port, this.host, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }).catch((err: Error) => {
      const pending = this.pending.get(id);

      if (pending) {
        clearTimeout(pending.timer);
        this.pending.delete(id);
      }

      throw new BridgeCallError({
        code: "BRIDGE_NOT_FOUND",
        message: `udp send failed: ${err.message}`,
      });
    });

    const reply = await replyPromise;

    if (!reply.ok) {
      // Mark bridge stale on first failure so the next call re-pings.
      this.lastPingOkAt = 0;
      throw new BridgeCallError(reply.error);
    }

    return reply.result;
  }

  private ensureSocket(): Promise<void> {
    if (this.socketReady) return this.socketReady;

    this.socketReady = new Promise<void>((resolve, reject) => {
      const socket = this.socketFactory();

      socket.on("message", (msg: Buffer, _rinfo: RemoteInfo) =>
        this.onMessage(msg),
      );
      socket.on("error", (err: Error) => {
        for (const [id, pending] of this.pending) {
          clearTimeout(pending.timer);
          pending.resolve({
            id,
            ok: false,
            error: {
              code: "BRIDGE_NOT_FOUND",
              message: `socket error: ${err.message}`,
            },
          });
        }

        this.pending.clear();
      });
      socket.bind(0, () => {
        this.socket = socket;
        resolve();
      });
      socket.once("error", (err: Error) => {
        if (!this.socket) reject(err);
      });
    });

    return this.socketReady;
  }

  private onMessage(buf: Buffer): void {
    let parsed: BridgeReply<unknown>;

    try {
      parsed = JSON.parse(buf.toString("utf8")) as BridgeReply<unknown>;
    } catch {
      return; // ignore malformed datagrams
    }

    const pending = this.pending.get(parsed.id);

    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(parsed.id);
    pending.resolve(parsed);
  }
}

/** Thrown by client methods on a non-OK reply or transport failure. */
export class BridgeCallError extends Error {
  readonly code: BridgeErrorCode;

  constructor(error: BridgeError) {
    super(error.message);
    this.name = "BridgeCallError";
    this.code = error.code;
  }
}
