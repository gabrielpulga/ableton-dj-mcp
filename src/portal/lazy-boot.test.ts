// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { EventEmitter } from "node:events";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

const spawnMock = vi.fn();

vi.mock(import("node:child_process"), () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

const { LazyBoot } = await import("./lazy-boot.ts");

interface FakeChild extends EventEmitter {
  unref: Mock;
  stdout?: EventEmitter;
}

function makeChild({
  exitCode = 0,
  stdout,
}: { exitCode?: number; stdout?: string } = {}): FakeChild {
  const emitter = new EventEmitter() as FakeChild;

  emitter.unref = vi.fn();

  if (stdout !== undefined) {
    const stdoutEmitter = new EventEmitter();

    emitter.stdout = stdoutEmitter;
    queueMicrotask(() => {
      stdoutEmitter.emit("data", Buffer.from(stdout));
      emitter.emit("close", exitCode);
    });
  } else {
    queueMicrotask(() => {
      emitter.emit("close", exitCode);
    });
  }

  return emitter;
}

describe("LazyBoot", () => {
  const originalAutoBoot = process.env.ADJ_AUTO_BOOT;
  const originalPlatform = process.platform;

  beforeEach(() => {
    spawnMock.mockReset();
    fetchMock.mockReset();
  });

  afterEach(() => {
    if (originalAutoBoot === undefined) {
      delete process.env.ADJ_AUTO_BOOT;
    } else {
      process.env.ADJ_AUTO_BOOT = originalAutoBoot;
    }

    Object.defineProperty(process, "platform", { value: originalPlatform });
  });

  it("does nothing when ADJ_AUTO_BOOT is not set", async () => {
    delete process.env.ADJ_AUTO_BOOT;
    const boot = new LazyBoot({ serverOrigin: "http://localhost:3350" });

    const result = await boot.tryBoot();

    expect(result).toStrictEqual({
      attempted: false,
      succeeded: false,
      reason: "disabled",
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  it("does nothing on second call within the same instance", async () => {
    process.env.ADJ_AUTO_BOOT = "true";
    Object.defineProperty(process, "platform", { value: "darwin" });

    spawnMock.mockImplementation((cmd: string) => {
      if (cmd === "pgrep") {
        return makeChild({ exitCode: 1 });
      }

      return makeChild();
    });
    fetchMock.mockResolvedValue({ status: 200 });

    const boot = new LazyBoot({
      serverOrigin: "http://localhost:3350",
      timeoutMs: 1000,
      pollIntervalMs: 10,
    });

    await boot.tryBoot();
    const result = await boot.tryBoot();

    expect(result.reason).toBe("already-attempted");
  });

  it("skips boot when Live is already running (state 3)", async () => {
    process.env.ADJ_AUTO_BOOT = "true";
    Object.defineProperty(process, "platform", { value: "darwin" });

    spawnMock.mockImplementationOnce(() => makeChild({ exitCode: 0 }));

    const boot = new LazyBoot({ serverOrigin: "http://localhost:3350" });
    const result = await boot.tryBoot();

    expect(result).toStrictEqual({
      attempted: true,
      succeeded: false,
      reason: "live-running-without-device",
    });
    // pgrep was called, but `open` was not.
    expect(spawnMock).toHaveBeenCalledTimes(1);
    expect(spawnMock.mock.calls[0]?.[0]).toBe("pgrep");
  });

  it("launches Live and returns succeeded when server becomes reachable", async () => {
    process.env.ADJ_AUTO_BOOT = "true";
    Object.defineProperty(process, "platform", { value: "darwin" });

    let pgrepCalled = false;
    let openCalled = false;

    spawnMock.mockImplementation((cmd: string) => {
      if (cmd === "pgrep") {
        pgrepCalled = true;

        return makeChild({ exitCode: 1 });
      }

      if (cmd === "open") {
        openCalled = true;

        return makeChild();
      }

      return makeChild();
    });

    fetchMock
      .mockRejectedValueOnce(new Error("ECONNREFUSED"))
      .mockResolvedValue({ status: 200 });

    const boot = new LazyBoot({
      serverOrigin: "http://localhost:3350",
      timeoutMs: 5000,
      pollIntervalMs: 10,
    });

    const result = await boot.tryBoot();

    expect(pgrepCalled).toBe(true);
    expect(openCalled).toBe(true);
    expect(result).toStrictEqual({ attempted: true, succeeded: true });
  });

  it("times out when the server never comes up", async () => {
    process.env.ADJ_AUTO_BOOT = "true";
    Object.defineProperty(process, "platform", { value: "darwin" });

    spawnMock.mockImplementation((cmd: string) => {
      if (cmd === "pgrep") {
        return makeChild({ exitCode: 1 });
      }

      return makeChild();
    });

    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const boot = new LazyBoot({
      serverOrigin: "http://localhost:3350",
      timeoutMs: 30,
      pollIntervalMs: 10,
    });

    const result = await boot.tryBoot();

    expect(result).toStrictEqual({
      attempted: true,
      succeeded: false,
      reason: "timeout",
    });
  });

  it("rejects unsupported platforms", async () => {
    process.env.ADJ_AUTO_BOOT = "true";
    Object.defineProperty(process, "platform", { value: "linux" });

    const boot = new LazyBoot({ serverOrigin: "http://localhost:3350" });
    const result = await boot.tryBoot();

    expect(result).toStrictEqual({
      attempted: true,
      succeeded: false,
      reason: "unsupported-platform-linux",
    });
    expect(spawnMock).not.toHaveBeenCalled();
  });
});
