// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Easing curves and anchor densification for automation envelopes. Live's
// insert_step writes step breakpoints, so shaped (and even linear) ramps are
// emitted as dense point runs rather than relying on Live to interpolate.

export type AutomationShape =
  "linear" | "exponential" | "logarithmic" | "sine" | "s-curve" | "step";

export type AutomationPoint = [timeBeats: number, value01: number];

// One datagram carries every point (the bridge drains 8 requests per 100ms
// main-thread tick, so multi-call writes are unusable). 512 points is ~10KB
// of JSON, far under the 64KB UDP ceiling.
export const MAX_AUTOMATION_POINTS = 512;

const STEPS_PER_SEGMENT = 16;

/**
 * Apply an easing curve to a normalized progress value.
 * @param shape - Easing curve name
 * @param t - Progress through the segment (0..1)
 * @returns Eased progress (0..1)
 */
export function ease(shape: AutomationShape, t: number): number {
  switch (shape) {
    case "linear": {
      return t;
    }

    case "exponential": {
      return t * t;
    }

    case "logarithmic": {
      return 1 - (1 - t) * (1 - t);
    }

    case "sine": {
      return (1 - Math.cos(Math.PI * t)) / 2;
    }

    case "s-curve": {
      return t * t * (3 - 2 * t);
    }

    case "step": {
      return t < 1 ? 0 : 1;
    }
  }
}

/**
 * Expand anchor points into a dense point run following the easing curve.
 * "step" emits the anchors verbatim (each value holds until the next anchor,
 * which is exactly what insert_step already does).
 * @param anchors - Anchor points as [timeBeats, value01] pairs, time-ascending
 * @param shape - Easing curve applied between consecutive anchors
 * @returns Densified points, capped at MAX_AUTOMATION_POINTS
 */
export function densify(
  anchors: AutomationPoint[],
  shape: AutomationShape,
): AutomationPoint[] {
  if (anchors.length < 2 || shape === "step") return [...anchors];

  const points: AutomationPoint[] = [];

  for (let i = 0; i < anchors.length - 1; i++) {
    const [t0, v0] = anchors[i] as AutomationPoint;
    const [t1, v1] = anchors[i + 1] as AutomationPoint;

    for (let step = 0; step < STEPS_PER_SEGMENT; step++) {
      const progress = step / STEPS_PER_SEGMENT;

      points.push([
        t0 + (t1 - t0) * progress,
        v0 + (v1 - v0) * ease(shape, progress),
      ]);
    }
  }

  const last = anchors.at(-1) as AutomationPoint;

  points.push([...last]);

  if (points.length <= MAX_AUTOMATION_POINTS) return points;

  return downsample(points, MAX_AUTOMATION_POINTS);
}

/**
 * Reduce a point run to at most maxPoints, always keeping the last point.
 * @param points - Dense point run
 * @param maxPoints - Maximum points to keep
 * @returns Evenly-strided subset ending on the original last point
 */
function downsample(
  points: AutomationPoint[],
  maxPoints: number,
): AutomationPoint[] {
  const stride = (points.length - 1) / (maxPoints - 1);
  const out: AutomationPoint[] = [];

  for (let i = 0; i < maxPoints; i++) {
    out.push(points[Math.round(i * stride)] as AutomationPoint);
  }

  return out;
}
