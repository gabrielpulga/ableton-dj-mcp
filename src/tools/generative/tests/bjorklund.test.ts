// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import { euclidean, rotate } from "../helpers/bjorklund.ts";

describe("euclidean", () => {
  it("produces tresillo for (3, 8)", () => {
    expect(euclidean(3, 8)).toStrictEqual([
      true,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
    ]);
  });

  it("produces four-on-the-floor for (4, 16)", () => {
    expect(euclidean(4, 16)).toStrictEqual([
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
    ]);
  });

  it("returns all-false when pulses is 0", () => {
    expect(euclidean(0, 4)).toStrictEqual([false, false, false, false]);
  });

  it("returns all-true when pulses equals steps", () => {
    expect(euclidean(4, 4)).toStrictEqual([true, true, true, true]);
  });

  it("places exactly `pulses` hits", () => {
    const result = euclidean(5, 13);

    expect(result.filter(Boolean)).toHaveLength(5);
    expect(result).toHaveLength(13);
  });

  it("throws when steps is non-positive", () => {
    expect(() => euclidean(1, 0)).toThrow("steps must be positive");
    expect(() => euclidean(1, -1)).toThrow("steps must be positive");
  });

  it("throws when pulses is negative", () => {
    expect(() => euclidean(-1, 8)).toThrow("pulses must be non-negative");
  });

  it("throws when pulses exceeds steps", () => {
    expect(() => euclidean(9, 8)).toThrow("pulses cannot exceed steps");
  });
});

describe("rotate", () => {
  it("rotates left by positive offset", () => {
    expect(rotate([1, 2, 3, 4], 1)).toStrictEqual([2, 3, 4, 1]);
    expect(rotate([1, 2, 3, 4], 2)).toStrictEqual([3, 4, 1, 2]);
  });

  it("handles negative offset", () => {
    expect(rotate([1, 2, 3, 4], -1)).toStrictEqual([4, 1, 2, 3]);
  });

  it("normalises offset larger than length", () => {
    expect(rotate([1, 2, 3], 4)).toStrictEqual([2, 3, 1]);
  });

  it("returns identity for offset 0", () => {
    expect(rotate([1, 2, 3], 0)).toStrictEqual([1, 2, 3]);
  });

  it("handles empty array", () => {
    expect(rotate([], 3)).toStrictEqual([]);
  });
});
