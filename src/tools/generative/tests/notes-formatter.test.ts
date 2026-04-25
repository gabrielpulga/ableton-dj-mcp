// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import { formatPatternToBarbeat } from "../helpers/notes-formatter.ts";

describe("formatPatternToBarbeat", () => {
  it("emits one line per active step in 8-step grid", () => {
    const notes = formatPatternToBarbeat({
      pattern: [true, false, false, true, false, false, true, false],
      steps: 8,
      pitch: "C1",
      velocity: 100,
      duration: "/8",
      bars: 1,
    });

    expect(notes).toBe("1|1 v100 t/8 C1\n1|2.5 v100 t/8 C1\n1|4 v100 t/8 C1");
  });

  it("converts step positions to fractional beats in 16-step grid", () => {
    const notes = formatPatternToBarbeat({
      pattern: [true, false, true, false, false, false, false, false].concat(
        new Array<boolean>(8).fill(false),
      ),
      steps: 16,
      pitch: "D2",
      velocity: 90,
      duration: "/16",
      bars: 1,
    });

    expect(notes).toBe("1|1 v90 t/16 D2\n1|1.5 v90 t/16 D2");
  });

  it("tiles pattern across multiple bars", () => {
    const notes = formatPatternToBarbeat({
      pattern: [true, false, false, false],
      steps: 4,
      pitch: "C1",
      velocity: 100,
      duration: "/4",
      bars: 3,
    });

    expect(notes.split("\n")).toStrictEqual([
      "1|1 v100 t/4 C1",
      "2|1 v100 t/4 C1",
      "3|1 v100 t/4 C1",
    ]);
  });

  it("returns empty string when pattern has no hits", () => {
    const notes = formatPatternToBarbeat({
      pattern: [false, false, false, false],
      steps: 4,
      pitch: "C1",
      velocity: 100,
      duration: "/4",
      bars: 2,
    });

    expect(notes).toBe("");
  });
});
