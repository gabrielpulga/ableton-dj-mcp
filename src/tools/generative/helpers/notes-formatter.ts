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
 * Convert a boolean step pattern into bar|beat notation lines that plug
 * directly into adj-create-clip's `notes` parameter.
 *
 * Assumes 4/4: `steps` subdivisions per bar, evenly spaced.
 *
 * @param opts - Pattern + format options
 * @returns Multiline string (one note per line)
 */
export function formatPatternToBarbeat(opts: FormatPatternOptions): string {
  const { pattern, steps, pitch, velocity, duration, bars } = opts;
  const beatsPerStep = BEATS_PER_BAR / steps;
  const lines: string[] = [];

  for (let bar = 1; bar <= bars; bar++) {
    for (let step = 0; step < steps; step++) {
      if (!pattern[step]) continue;

      const beat = formatBeat(step * beatsPerStep + 1);

      lines.push(`${bar}|${beat} v${velocity} t${duration} ${pitch}`);
    }
  }

  return lines.join("\n");
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
