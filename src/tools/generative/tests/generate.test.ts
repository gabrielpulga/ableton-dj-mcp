// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import { generate } from "../generate.ts";

describe("generate", () => {
  describe("validation", () => {
    it("requires algorithm", () => {
      expect(() => generate({})).toThrow("algorithm is required");
    });

    it("rejects unknown algorithm", () => {
      expect(() =>
        generate({ algorithm: "bogus", pitch: "C1", steps: 8, pulses: 3 }),
      ).toThrow('unknown algorithm "bogus"');
    });

    it("requires pitch", () => {
      expect(() =>
        generate({ algorithm: "euclidean", steps: 8, pulses: 3 }),
      ).toThrow("pitch is required");
    });

    it("requires steps when pattern is not set", () => {
      expect(() =>
        generate({ algorithm: "euclidean", pitch: "C1", pulses: 3 }),
      ).toThrow("steps is required");
    });

    it("requires pulses when pattern is not set", () => {
      expect(() =>
        generate({ algorithm: "euclidean", pitch: "C1", steps: 8 }),
      ).toThrow("pulses is required");
    });

    it("rejects unknown named pattern", () => {
      expect(() =>
        generate({ algorithm: "euclidean", pitch: "C1", pattern: "bogus" }),
      ).toThrow('unknown pattern "bogus"');
    });
  });

  describe("euclidean", () => {
    it("generates tresillo from (3, 8)", () => {
      const result = generate({
        algorithm: "euclidean",
        pitch: "C1",
        steps: 8,
        pulses: 3,
      });

      expect(result.notes).toBe("v100 t/8 C1 1|1,2.5,4");
      expect(result.steps).toBe(8);
      expect(result.pulses).toBe(3);
      expect(result.rotation).toBe(0);
      expect(result.bars).toBe(1);
    });

    it("applies rotation", () => {
      const noRot = generate({
        algorithm: "euclidean",
        pitch: "C1",
        steps: 8,
        pulses: 3,
      });
      const rotated = generate({
        algorithm: "euclidean",
        pitch: "C1",
        steps: 8,
        pulses: 3,
        rotation: 1,
      });

      expect(rotated.notes).not.toBe(noRot.notes);
      expect(rotated.rotation).toBe(1);
    });

    it("respects custom velocity and duration", () => {
      const result = generate({
        algorithm: "euclidean",
        pitch: "D2",
        steps: 4,
        pulses: 2,
        velocity: 64,
        duration: "1/4",
      });

      expect(result.notes).toContain("v64 t1/4 D2");
    });

    it("tiles across multiple bars", () => {
      const result = generate({
        algorithm: "euclidean",
        pitch: "C1",
        steps: 4,
        pulses: 1,
        bars: 3,
      });

      expect(result.notes).toBe("v100 t/4 C1 1|1 2|1 3|1");
    });
  });

  describe("named patterns", () => {
    it("generates tresillo by name", () => {
      const named = generate({
        algorithm: "euclidean",
        pitch: "C1",
        pattern: "tresillo",
      });
      const algo = generate({
        algorithm: "euclidean",
        pitch: "C1",
        steps: 8,
        pulses: 3,
      });

      expect(named.notes).toBe(algo.notes);
    });

    it("generates son-clave with 5 hits in 16 steps", () => {
      const result = generate({
        algorithm: "euclidean",
        pitch: "C1",
        pattern: "son-clave",
      });

      expect(result.notes.split(",")).toHaveLength(5);
      expect(result.steps).toBe(16);
      expect(result.pulses).toBe(5);
    });

    it("named pattern overrides explicit steps/pulses", () => {
      const result = generate({
        algorithm: "euclidean",
        pitch: "C1",
        pattern: "tresillo",
        steps: 16,
        pulses: 8,
      });

      expect(result.steps).toBe(8);
      expect(result.pulses).toBe(3);
    });
  });
});
