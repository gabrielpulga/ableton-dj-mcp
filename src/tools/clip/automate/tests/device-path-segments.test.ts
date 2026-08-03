// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";

import { parseDevicePathSegments } from "../device-path-segments.ts";

describe("parseDevicePathSegments", () => {
  it("parses a simple track/device path", () => {
    expect(parseDevicePathSegments("t0/d1")).toStrictEqual({
      trackIndex: 0,
      chain: [{ type: "d", index: 1 }],
    });
  });

  it("parses a nested rack chain path", () => {
    expect(parseDevicePathSegments("t2/d0/c1/d3")).toStrictEqual({
      trackIndex: 2,
      chain: [
        { type: "d", index: 0 },
        { type: "c", index: 1 },
        { type: "d", index: 3 },
      ],
    });
  });

  it("parses return-chain segments", () => {
    expect(parseDevicePathSegments("t0/d0/rc0/d0").chain[1]).toStrictEqual({
      type: "rc",
      index: 0,
    });
  });

  it("rejects empty paths", () => {
    expect(() => parseDevicePathSegments("")).toThrow(/non-empty/);
  });

  it("rejects return tracks", () => {
    expect(() => parseDevicePathSegments("rt0/d0")).toThrow(/regular track/);
  });

  it("rejects the master track", () => {
    expect(() => parseDevicePathSegments("mt/d0")).toThrow(/regular track/);
  });

  it("rejects track-only paths", () => {
    expect(() => parseDevicePathSegments("t0")).toThrow(/device index/);
  });

  it("rejects paths ending on a chain", () => {
    expect(() => parseDevicePathSegments("t0/d0/c1")).toThrow(
      /end on a device/,
    );
  });

  it("rejects drum-pad segments", () => {
    expect(() => parseDevicePathSegments("t0/d0/pC1/d0")).toThrow(/drum-pad/);
  });

  it("rejects unknown segments", () => {
    expect(() => parseDevicePathSegments("t0/x1")).toThrow(/invalid segment/);
  });

  it("rejects malformed track heads", () => {
    expect(() => parseDevicePathSegments("track0/d0")).toThrow(
      /invalid track segment/,
    );
  });
});
