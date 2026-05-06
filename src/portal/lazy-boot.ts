// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Opt-in self-bootstrap: when ADJ_AUTO_BOOT=true and the portal can't reach
// :3350, attempt to launch Ableton Live (macOS only for now) and poll until
// the device's HTTP server comes up. Bounded by timeout. Single attempt per
// portal lifetime to avoid loops if Live fails to load the device.

import { spawn } from "node:child_process";
import { errorMessage } from "#src/shared/error-utils.ts";
import { logger } from "./file-logger.ts";

const ABLETON_BUNDLE_ID = "com.ableton.live";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_POLL_INTERVAL_MS = 500;

export interface LazyBootOptions {
  serverOrigin: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
}

export interface LazyBootResult {
  attempted: boolean;
  succeeded: boolean;
  reason?: string;
}

export class LazyBoot {
  private hasAttempted = false;

  constructor(private readonly options: LazyBootOptions) {}

  /**
   * True when ADJ_AUTO_BOOT=true. Read at call time so tests can flip it.
   * @returns Whether opt-in flag is set
   */
  isEnabled(): boolean {
    return process.env.ADJ_AUTO_BOOT === "true";
  }

  /**
   * Single-attempt self-bootstrap. Returns immediately if disabled, already
   * attempted, or Live is already running (state 3 — can't inject device).
   * Otherwise launches Live and polls the server origin until it responds
   * or the timeout elapses.
   * @returns Outcome with reason for skips/failures
   */
  async tryBoot(): Promise<LazyBootResult> {
    if (!this.isEnabled()) {
      return { attempted: false, succeeded: false, reason: "disabled" };
    }

    if (this.hasAttempted) {
      return {
        attempted: false,
        succeeded: false,
        reason: "already-attempted",
      };
    }

    this.hasAttempted = true;

    if (await this.isLiveRunning()) {
      logger.info(
        "[LazyBoot] Live is running but :3350 is unreachable — device not loaded. Skipping auto-boot to preserve user state.",
      );

      return {
        attempted: true,
        succeeded: false,
        reason: "live-running-without-device",
      };
    }

    if (!this.canLaunch()) {
      return {
        attempted: true,
        succeeded: false,
        reason: `unsupported-platform-${process.platform}`,
      };
    }

    logger.info("[LazyBoot] Launching Ableton Live");
    this.launchLive();

    const reachable = await this.waitForServer();

    return reachable
      ? { attempted: true, succeeded: true }
      : { attempted: true, succeeded: false, reason: "timeout" };
  }

  /**
   * Detect a running Ableton Live process via OS-native process listing.
   * @returns True when Live is currently running
   */
  private async isLiveRunning(): Promise<boolean> {
    if (process.platform === "darwin") {
      return await new Promise<boolean>((resolve) => {
        const child = spawn("pgrep", ["-if", "Ableton Live"], {
          stdio: "ignore",
        });

        child.on("close", (code) => {
          resolve(code === 0);
        });
        child.on("error", () => {
          resolve(false);
        });
      });
    }

    if (process.platform === "win32") {
      return await new Promise<boolean>((resolve) => {
        const child = spawn("tasklist", ["/FI", "IMAGENAME eq Ableton Live*"], {
          stdio: ["ignore", "pipe", "ignore"],
        });

        let output = "";

        child.stdout.on("data", (chunk: Buffer) => {
          output += chunk.toString();
        });
        child.on("close", () => {
          resolve(output.toLowerCase().includes("ableton live"));
        });
        child.on("error", () => {
          resolve(false);
        });
      });
    }

    return false;
  }

  /**
   * Whether we know how to spawn Live on this platform.
   * @returns True for macOS (Windows boot deferred to a follow-up)
   */
  private canLaunch(): boolean {
    return process.platform === "darwin";
  }

  /**
   * Spawn a detached `open -b com.ableton.live` and immediately unref so the
   * portal doesn't keep Live's lifetime tied to its own.
   */
  private launchLive(): void {
    try {
      const child = spawn("open", ["-b", ABLETON_BUNDLE_ID], {
        detached: true,
        stdio: "ignore",
      });

      child.on("error", (error) => {
        logger.error(`[LazyBoot] Failed to spawn Live: ${errorMessage(error)}`);
      });

      child.unref();
    } catch (error) {
      logger.error(`[LazyBoot] Spawn threw: ${errorMessage(error)}`);
    }
  }

  /**
   * Poll the server origin until it responds with any HTTP status, or the
   * timeout elapses. Network errors and connection refusals continue polling.
   * @returns True when the server became reachable, false on timeout
   */
  private async waitForServer(): Promise<boolean> {
    const timeoutMs = this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const intervalMs = this.options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      try {
        const response = await fetch(this.options.serverOrigin, {
          method: "GET",
        });

        if (response.status < 500) {
          logger.info(
            `[LazyBoot] Server reachable at ${this.options.serverOrigin}`,
          );

          return true;
        }
      } catch {
        // Connection refused / DNS failure — keep polling.
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    logger.error(
      `[LazyBoot] Server did not become reachable within ${String(timeoutMs)}ms`,
    );

    return false;
  }
}
