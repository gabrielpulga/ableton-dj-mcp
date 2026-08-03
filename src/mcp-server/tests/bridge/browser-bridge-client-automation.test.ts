// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { EventEmitter } from "node:events";
import { describe, expect, it } from "vitest";
import {
  BridgeCallError,
  BrowserBridgeClient,
} from "../../browser-bridge-client.ts";

interface SentMessage {
  id: string;
  op: string;
  args: Record<string, unknown>;
}

class FakeSocket extends EventEmitter {
  readonly sent: SentMessage[] = [];
  onSend?: (msg: SentMessage) => void;

  bind(_port: number, cb: () => void): void {
    setImmediate(cb);
  }

  send(
    payload: Buffer,
    _port: number,
    _host: string,
    cb: (err: Error | null) => void,
  ): void {
    const parsed = JSON.parse(payload.toString("utf8")) as SentMessage;

    this.sent.push(parsed);
    cb(null);
    this.onSend?.(parsed);
  }

  close(): void {
    /* noop */
  }

  reply(payload: object): void {
    this.emit("message", Buffer.from(JSON.stringify(payload), "utf8"), {});
  }
}

function makeClient(): { client: BrowserBridgeClient; socket: FakeSocket } {
  const socket = new FakeSocket();
  const client = new BrowserBridgeClient({
    socketFactory: () => socket as unknown as ReturnType<typeof Object>,
  });

  return { client, socket };
}

const CLIP = { trackIndex: 0, sceneIndex: 3 };
const TARGET = {
  kind: "device" as const,
  chain: [{ type: "d" as const, index: 1 }],
  paramName: "Frequency",
};

describe("BrowserBridgeClient automation ops", () => {
  it("automationWrite sends one datagram with all points", async () => {
    const { client, socket } = makeClient();

    socket.onSend = (msg) => {
      expect(msg.op).toBe("automation_write");
      expect(msg.args.clip).toStrictEqual(CLIP);
      expect(msg.args.points).toStrictEqual([
        [0, 0],
        [16, 1],
      ]);
      expect(msg.args.clearFirst).toBe(true);
      socket.reply({
        id: msg.id,
        ok: true,
        result: {
          pointCount: 2,
          paramName: "Frequency",
          paramMin: 20,
          paramMax: 20000,
          envelopeCreated: true,
          clipLengthBeats: 16,
        },
      });
    };

    const result = await client.automationWrite({
      clip: CLIP,
      target: TARGET,
      points: [
        [0, 0],
        [16, 1],
      ],
      clearFirst: true,
    });

    expect(result.envelopeCreated).toBe(true);
    expect(socket.sent).toHaveLength(1);
  });

  it("automationRead forwards sampling controls", async () => {
    const { client, socket } = makeClient();

    socket.onSend = (msg) => {
      expect(msg.op).toBe("automation_read");
      expect(msg.args.stepBeats).toBe(0.5);
      socket.reply({
        id: msg.id,
        ok: true,
        result: {
          hasEnvelope: true,
          sampled: true,
          stepBeats: 0.5,
          points: [[0, 0.25]],
          paramMin: 0,
          paramMax: 1,
          clipLengthBeats: 4,
        },
      });
    };

    const result = await client.automationRead({
      clip: CLIP,
      target: TARGET,
      stepBeats: 0.5,
    });

    expect(result.points).toStrictEqual([[0, 0.25]]);
  });

  it("automationClear omits target for clear-all", async () => {
    const { client, socket } = makeClient();

    socket.onSend = (msg) => {
      expect(msg.op).toBe("automation_clear");
      expect(msg.args.target).toBeUndefined();
      socket.reply({ id: msg.id, ok: true, result: { cleared: "all" } });
    };

    const result = await client.automationClear({ clip: CLIP });

    expect(result.cleared).toBe("all");
  });

  it("surfaces AUTOMATION_FAILED errors as BridgeCallError", async () => {
    const { client, socket } = makeClient();

    socket.onSend = (msg) =>
      socket.reply({
        id: msg.id,
        ok: false,
        error: { code: "AUTOMATION_FAILED", message: "parameter not found" },
      });

    const promise = client.automationClear({ clip: CLIP, target: TARGET });

    await expect(promise).rejects.toThrow(BridgeCallError);
    await expect(promise).rejects.toMatchObject({ code: "AUTOMATION_FAILED" });
  });
});
