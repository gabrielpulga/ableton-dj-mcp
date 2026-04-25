// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

const BEATS_PER_BAR = 4;
const FLOAT_PRECISION = 10000;

export interface FormatPatternOptions {
  pattern: boolean[];
  steps: number;
  pitch: string;
  velocity: number;
  duration: string;
  bars: number;
}

/**
 * Convert a boolean step pattern into bar|beat notation that plugs directly
 * into adj-create-clip's `notes` parameter.
 *
 * Assumes 4/4: `steps` subdivisions per bar, evenly spaced.
 *
 * Output groups beats per bar and emits properties + pitch once at the start,
 * relying on the parser's stateful v/t/pitch behaviour. The barbeat grammar
 * requires pitch BEFORE time positions; reversing the order silently drops
 * the first note and shifts the rest.
 *
 * @param opts - Pattern + format options
 * @returns Single-line notation string (empty if no hits)
 */
export function formatPatternToBarbeat(opts: FormatPatternOptions): string {
  const { pattern, steps, pitch, velocity, duration, bars } = opts;
  const beatsPerStep = BEATS_PER_BAR / steps;
  const barChunks: string[] = [];

  for (let bar = 1; bar <= bars; bar++) {
    const beats: string[] = [];

    for (let step = 0; step < steps; step++) {
      if (!pattern[step]) continue;

      beats.push(formatBeat(step * beatsPerStep + 1));
    }

    if (beats.length > 0) {
      barChunks.push(`${bar}|${beats.join(",")}`);
    }
  }

  if (barChunks.length === 0) return "";

  return `v${velocity} t${duration} ${pitch} ${barChunks.join(" ")}`;
}

/**
 * Format a beat number with float-artefact protection.
 * @param beat - Beat position (1-based, may be fractional)
 * @returns String form, trailing zeros stripped
 */
function formatBeat(beat: number): string {
  const rounded = Math.round(beat * FLOAT_PRECISION) / FLOAT_PRECISION;

  return String(rounded);
}
