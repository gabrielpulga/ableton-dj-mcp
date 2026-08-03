// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";

import {
  type AutomationPoint,
  type AutomationShape,
  densify,
  ease,
  MAX_AUTOMATION_POINTS,
} from "../shapes.ts";

const CURVED_SHAPES: AutomationShape[] = [
  "linear",
  "exponential",
  "logarithmic",
  "sine",
  "s-curve",
];

describe("ease", () => {
  it.each(CURVED_SHAPES)("%s hits both endpoints", (shape) => {
    expect(ease(shape, 0)).toBeCloseTo(0);
    expect(ease(shape, 1)).toBeCloseTo(1);
  });

  it.each(CURVED_SHAPES)("%s is monotonic non-decreasing", (shape) => {
    let previous = ease(shape, 0);

    for (let i = 1; i <= 20; i++) {
      const current = ease(shape, i / 20);

      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it("exponential accelerates (below linear at midpoint)", () => {
    expect(ease("exponential", 0.5)).toBeLessThan(0.5);
  });

  it("logarithmic decelerates (above linear at midpoint)", () => {
    expect(ease("logarithmic", 0.5)).toBeGreaterThan(0.5);
  });

  it("sine and s-curve cross the midpoint at 0.5", () => {
    expect(ease("sine", 0.5)).toBeCloseTo(0.5);
    expect(ease("s-curve", 0.5)).toBeCloseTo(0.5);
  });

  it("step holds zero until the end", () => {
    expect(ease("step", 0)).toBe(0);
    expect(ease("step", 0.99)).toBe(0);
    expect(ease("step", 1)).toBe(1);
  });
});

describe("densify", () => {
  const anchors: AutomationPoint[] = [
    [0, 0],
    [16, 1],
  ];

  it("expands a segment into 17 points including both endpoints", () => {
    const points = densify(anchors, "linear");

    expect(points).toHaveLength(17);
    expect(points[0]).toStrictEqual([0, 0]);
    expect(points.at(-1)).toStrictEqual([16, 1]);
  });

  it("interpolates linearly between anchors", () => {
    const points = densify(anchors, "linear");
    const midpoint = points[8] as AutomationPoint;

    expect(midpoint[0]).toBeCloseTo(8);
    expect(midpoint[1]).toBeCloseTo(0.5);
  });

  it("keeps times monotonic across multiple segments", () => {
    const points = densify(
      [
        [0, 0],
        [4, 1],
        [8, 0.5],
      ],
      "sine",
    );

    for (let i = 1; i < points.length; i++) {
      const current = points[i] as AutomationPoint;
      const previous = points[i - 1] as AutomationPoint;

      expect(current[0]).toBeGreaterThan(previous[0]);
    }
  });

  it("passes anchors through verbatim for step shape", () => {
    const stepAnchors: AutomationPoint[] = [
      [0, 0.2],
      [4, 0.8],
    ];

    expect(densify(stepAnchors, "step")).toStrictEqual(stepAnchors);
  });

  it("passes a single anchor through unchanged", () => {
    expect(densify([[2, 0.5]], "linear")).toStrictEqual([[2, 0.5]]);
  });

  it("caps output at MAX_AUTOMATION_POINTS and keeps the last point", () => {
    const many: AutomationPoint[] = Array.from({ length: 64 }, (_, i) => [
      i,
      i % 2,
    ]);
    const points = densify(many, "linear");

    expect(points.length).toBeLessThanOrEqual(MAX_AUTOMATION_POINTS);
    expect(points.at(-1)).toStrictEqual([63, 1]);
  });
});
