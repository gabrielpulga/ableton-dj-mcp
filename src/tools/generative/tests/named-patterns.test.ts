// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import {
  NAMED_PATTERN_NAMES,
  NAMED_PATTERNS,
} from "../helpers/named-patterns.ts";

describe("NAMED_PATTERNS", () => {
  it("exposes the documented preset names", () => {
    expect(NAMED_PATTERN_NAMES).toStrictEqual([
      "tresillo",
      "cinquillo",
      "bossa-nova",
      "son-clave",
      "rumba-clave",
      "16th-4",
    ]);
  });

  it("each pattern's array length matches its declared steps", () => {
    for (const name of NAMED_PATTERN_NAMES) {
      const spec = NAMED_PATTERNS[name];

      expect(spec.pattern).toHaveLength(spec.steps);
    }
  });

  it("tresillo has 3 hits in 8 steps", () => {
    const spec = NAMED_PATTERNS.tresillo;

    expect(spec.pattern.filter(Boolean)).toHaveLength(3);
    expect(spec.steps).toBe(8);
  });

  it("son-clave and rumba-clave both have 5 hits in 16 steps", () => {
    const son = NAMED_PATTERNS["son-clave"];
    const rumba = NAMED_PATTERNS["rumba-clave"];

    expect(son.pattern.filter(Boolean)).toHaveLength(5);
    expect(rumba.pattern.filter(Boolean)).toHaveLength(5);
    expect(son.steps).toBe(16);
    expect(rumba.steps).toBe(16);
  });

  it("son-clave and rumba-clave differ", () => {
    expect(NAMED_PATTERNS["son-clave"].pattern).not.toStrictEqual(
      NAMED_PATTERNS["rumba-clave"].pattern,
    );
  });

  it("16th-4 places hits on every quarter", () => {
    const spec = NAMED_PATTERNS["16th-4"];
    const hitIndices = spec.pattern
      .map((hit, i) => (hit ? i : -1))
      .filter((i) => i >= 0);

    expect(hitIndices).toStrictEqual([0, 4, 8, 12]);
  });
});
