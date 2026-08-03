// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Named production moves that generate automation point runs over a clip's
// play region. Times are Ableton beats relative to clip time 0.

import {
  type AutomationPoint,
  densify,
  MAX_AUTOMATION_POINTS,
} from "./shapes.ts";

export type AutomationRecipe =
  | "filter-sweep-up"
  | "filter-sweep-down"
  | "volume-fade-in"
  | "volume-fade-out"
  | "dub-throw"
  | "sidechain-pump"
  | "tape-stop"
  | "washout";

const EXPLICIT = "explicit";
const MIXER_VOLUME = "mixer-volume";
const SEND_A = "send-a";

export type RecipeTargetRule =
  typeof EXPLICIT | typeof MIXER_VOLUME | typeof SEND_A;

// Where each recipe lands when the caller omits devicePath/paramName.
// "explicit" recipes refuse to guess (there is no reliable way to find "the
// cutoff" on an arbitrary device chain).
export const RECIPE_TARGET_RULES: Record<AutomationRecipe, RecipeTargetRule> = {
  "filter-sweep-up": EXPLICIT,
  "filter-sweep-down": EXPLICIT,
  "volume-fade-in": MIXER_VOLUME,
  "volume-fade-out": MIXER_VOLUME,
  "dub-throw": SEND_A,
  "sidechain-pump": MIXER_VOLUME,
  "tape-stop": EXPLICIT,
  washout: SEND_A,
};

const PUMP_DIP_VALUE = 0.3;
const PUMP_RECOVER_BEATS = 0.5;

/**
 * Generate the point run for a named recipe.
 * @param recipe - Recipe name
 * @param regionStartBeats - Play region start (Ableton beats from clip time 0)
 * @param regionEndBeats - Play region end
 * @param abletonBeatsPerBar - Ableton beats per bar (from the clip time sig)
 * @returns Dense automation points, capped at MAX_AUTOMATION_POINTS
 * @throws When the play region is empty
 */
export function generateRecipePoints(
  recipe: AutomationRecipe,
  regionStartBeats: number,
  regionEndBeats: number,
  abletonBeatsPerBar: number,
): AutomationPoint[] {
  const length = regionEndBeats - regionStartBeats;

  if (length <= 0) {
    throw new Error(
      `recipe "${recipe}" needs a non-empty clip play region (got ${length} beats)`,
    );
  }

  switch (recipe) {
    case "filter-sweep-up": {
      return ramp(regionStartBeats, regionEndBeats, 0, 1);
    }

    case "volume-fade-in": {
      return ramp(regionStartBeats, regionEndBeats, 0, 1);
    }

    case "filter-sweep-down": {
      return ramp(regionStartBeats, regionEndBeats, 1, 0);
    }

    case "volume-fade-out": {
      return ramp(regionStartBeats, regionEndBeats, 1, 0);
    }

    case "dub-throw": {
      return dubThrow(regionStartBeats, regionEndBeats, abletonBeatsPerBar);
    }

    case "sidechain-pump": {
      return sidechainPump(regionStartBeats, regionEndBeats);
    }

    case "tape-stop": {
      return tapeStop(regionStartBeats, regionEndBeats, abletonBeatsPerBar);
    }

    case "washout": {
      return washout(regionStartBeats, regionEndBeats, abletonBeatsPerBar);
    }
  }
}

/**
 * Straight densified ramp across the whole region.
 * @param start - Region start beats
 * @param end - Region end beats
 * @param from - Starting value
 * @param to - Ending value
 * @returns Dense linear ramp
 */
function ramp(
  start: number,
  end: number,
  from: number,
  to: number,
): AutomationPoint[] {
  return densify(
    [
      [start, from],
      [end, to],
    ],
    "linear",
  );
}

/**
 * Single send spike at the region midpoint: silent, 1-beat attack to full,
 * ~2-bar decay back to zero (clamped to the region end).
 * @param start - Region start beats
 * @param end - Region end beats
 * @param beatsPerBar - Ableton beats per bar
 * @returns Spike envelope points
 */
function dubThrow(
  start: number,
  end: number,
  beatsPerBar: number,
): AutomationPoint[] {
  const mid = start + (end - start) / 2;
  const attackStart = Math.max(start, mid - 1);
  const decayEnd = Math.min(end, mid + beatsPerBar * 2);
  const anchors: AutomationPoint[] = [[start, 0]];

  if (attackStart > start) anchors.push([attackStart, 0]);
  anchors.push([mid, 1]);

  const decay = densify(
    [
      [mid, 1],
      [decayEnd, 0],
    ],
    "logarithmic",
  );

  anchors.push(...decay.slice(1));

  if (decayEnd < end) anchors.push([end, 0]);

  return anchors;
}

/**
 * Four-on-the-floor volume dip: drop on every beat, recover by the "and".
 * @param start - Region start beats
 * @param end - Region end beats
 * @returns Pump pattern points (two per beat), capped
 */
function sidechainPump(start: number, end: number): AutomationPoint[] {
  const points: AutomationPoint[] = [];

  for (
    let beat = start;
    beat < end && points.length < MAX_AUTOMATION_POINTS - 2;
    beat += 1
  ) {
    points.push([beat, PUMP_DIP_VALUE]);

    const recover = beat + PUMP_RECOVER_BEATS;

    if (recover < end) points.push([recover, 1]);
  }

  points.push([end, 1]);

  return points;
}

/**
 * Accelerating ramp to zero over the final bar (pitch-style tape stop).
 * @param start - Region start beats
 * @param end - Region end beats
 * @param beatsPerBar - Ableton beats per bar
 * @returns Hold-then-drop points
 */
function tapeStop(
  start: number,
  end: number,
  beatsPerBar: number,
): AutomationPoint[] {
  const dropStart = Math.max(start, end - beatsPerBar);
  const anchors: AutomationPoint[] = [];

  if (dropStart > start) anchors.push([start, 1]);

  return [
    ...anchors,
    ...densify(
      [
        [dropStart, 1],
        [end, 0],
      ],
      "exponential",
    ),
  ];
}

/**
 * Send ramp from zero to full over the final two bars for a smooth exit.
 * @param start - Region start beats
 * @param end - Region end beats
 * @param beatsPerBar - Ableton beats per bar
 * @returns Hold-then-rise points
 */
function washout(
  start: number,
  end: number,
  beatsPerBar: number,
): AutomationPoint[] {
  const riseStart = Math.max(start, end - beatsPerBar * 2);
  const anchors: AutomationPoint[] = [];

  if (riseStart > start) anchors.push([start, 0]);

  return [
    ...anchors,
    ...densify(
      [
        [riseStart, 0],
        [end, 1],
      ],
      "s-curve",
    ),
  ];
}
