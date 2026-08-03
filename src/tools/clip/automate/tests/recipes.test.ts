// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";

import {
  type AutomationRecipe,
  generateRecipePoints,
  RECIPE_TARGET_RULES,
} from "../recipes.ts";
import { type AutomationPoint, MAX_AUTOMATION_POINTS } from "../shapes.ts";

const ALL_RECIPES = Object.keys(RECIPE_TARGET_RULES) as AutomationRecipe[];

function firstPoint(points: AutomationPoint[]): AutomationPoint {
  return points[0] as AutomationPoint;
}

function lastPoint(points: AutomationPoint[]): AutomationPoint {
  return points.at(-1) as AutomationPoint;
}

describe("generateRecipePoints", () => {
  it.each(ALL_RECIPES)("%s spans the play region within caps", (recipe) => {
    const points = generateRecipePoints(recipe, 0, 32, 4);

    expect(points.length).toBeGreaterThanOrEqual(2);
    expect(points.length).toBeLessThanOrEqual(MAX_AUTOMATION_POINTS);
    expect(firstPoint(points)[0]).toBe(0);
    expect(lastPoint(points)[0]).toBeCloseTo(32);

    for (const [time, value] of points) {
      expect(time).toBeGreaterThanOrEqual(0);
      expect(time).toBeLessThanOrEqual(32);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("rejects an empty play region", () => {
    expect(() => generateRecipePoints("volume-fade-in", 8, 8, 4)).toThrow(
      /non-empty clip play region/,
    );
  });

  it("filter-sweep-up ramps 0 to 1", () => {
    const points = generateRecipePoints("filter-sweep-up", 0, 16, 4);

    expect(firstPoint(points)[1]).toBe(0);
    expect(lastPoint(points)[1]).toBe(1);
  });

  it("filter-sweep-down ramps 1 to 0", () => {
    const points = generateRecipePoints("filter-sweep-down", 0, 16, 4);

    expect(firstPoint(points)[1]).toBe(1);
    expect(lastPoint(points)[1]).toBe(0);
  });

  it("volume-fade-in respects a non-zero region start", () => {
    const points = generateRecipePoints("volume-fade-in", 4, 20, 4);

    expect(firstPoint(points)).toStrictEqual([4, 0]);
    expect(lastPoint(points)[0]).toBeCloseTo(20);
  });

  it("dub-throw spikes to 1 at the midpoint and returns to 0", () => {
    const points = generateRecipePoints("dub-throw", 0, 32, 4);
    const peak = points.find(([time]) => time === 16);

    expect(peak?.[1]).toBe(1);
    expect(firstPoint(points)[1]).toBe(0);
    expect(lastPoint(points)[1]).toBe(0);
  });

  it("sidechain-pump dips on every beat and recovers on the and", () => {
    const points = generateRecipePoints("sidechain-pump", 0, 4, 4);

    expect(points).toStrictEqual([
      [0, 0.3],
      [0.5, 1],
      [1, 0.3],
      [1.5, 1],
      [2, 0.3],
      [2.5, 1],
      [3, 0.3],
      [3.5, 1],
      [4, 1],
    ]);
  });

  it("sidechain-pump stays under the point cap on long regions", () => {
    const points = generateRecipePoints("sidechain-pump", 0, 1024, 4);

    expect(points.length).toBeLessThanOrEqual(MAX_AUTOMATION_POINTS);
    expect(lastPoint(points)).toStrictEqual([1024, 1]);
  });

  it("tape-stop holds 1 until the final bar then drops to 0", () => {
    const points = generateRecipePoints("tape-stop", 0, 16, 4);
    const beforeDrop = points.filter(([time]) => time < 12);

    for (const [, value] of beforeDrop) expect(value).toBe(1);
    expect(lastPoint(points)).toStrictEqual([16, 0]);
  });

  it("washout holds 0 until the final two bars then rises to 1", () => {
    const points = generateRecipePoints("washout", 0, 32, 4);
    const beforeRise = points.filter(([time]) => time < 24);

    for (const [, value] of beforeRise) expect(value).toBe(0);
    expect(lastPoint(points)).toStrictEqual([32, 1]);
  });

  it("tape-stop clamps the drop to short regions", () => {
    const points = generateRecipePoints("tape-stop", 0, 2, 4);

    expect(firstPoint(points)).toStrictEqual([0, 1]);
    expect(lastPoint(points)).toStrictEqual([2, 0]);
  });
});
