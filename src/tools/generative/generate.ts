// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { euclidean, rotate } from "./helpers/bjorklund.ts";
import { NAMED_PATTERNS, type NamedPattern } from "./helpers/named-patterns.ts";
import { formatPatternToBarbeat } from "./helpers/notes-formatter.ts";

const DEFAULT_VELOCITY = 100;

interface GenerateArgs {
  algorithm?: string;
  pattern?: string;
  pitch?: string;
  steps?: number;
  pulses?: number;
  rotation?: number;
  bars?: number;
  velocity?: number;
  duration?: string;
}

interface GenerateResult {
  notes: string;
  steps: number;
  pulses: number;
  rotation: number;
  bars: number;
}

/**
 * Generate algorithmic note patterns. Returns barbeat-notation notes ready to
 * pass to adj-create-clip.
 *
 * @param args - Generation parameters
 * @param _context - Unused, kept for tool interface consistency
 * @returns Generated notes string + pattern metadata
 */
export function generate(
  args: GenerateArgs = {},
  _context: Partial<ToolContext> = {},
): GenerateResult {
  const { algorithm, pattern: namedPattern, pitch } = args;

  if (!algorithm) {
    throw new Error("generate failed: algorithm is required");
  }

  if (algorithm !== "euclidean") {
    throw new Error(`generate failed: unknown algorithm "${algorithm}"`);
  }

  if (!pitch) {
    throw new Error("generate failed: pitch is required");
  }

  const bars = args.bars ?? 1;
  const velocity = args.velocity ?? DEFAULT_VELOCITY;
  const rotation = args.rotation ?? 0;

  const { steps, basePattern } = resolvePattern(namedPattern, args);
  const rotated = rotate(basePattern, rotation);
  const pulses = rotated.filter(Boolean).length;
  const duration = args.duration ?? `/${steps}`;

  const notes = formatPatternToBarbeat({
    pattern: rotated,
    steps,
    pitch,
    velocity,
    duration,
    bars,
  });

  return { notes, steps, pulses, rotation, bars };
}

interface ResolvedPattern {
  steps: number;
  basePattern: boolean[];
}

/**
 * Resolve the base pattern from either a named preset or steps/pulses params.
 *
 * @param namedPattern - Optional preset name
 * @param args - Generate args (used for steps/pulses fallback)
 * @returns Steps count + boolean pattern array
 */
function resolvePattern(
  namedPattern: string | undefined,
  args: GenerateArgs,
): ResolvedPattern {
  if (namedPattern != null) {
    const spec = (NAMED_PATTERNS as Record<string, NamedPattern | undefined>)[
      namedPattern
    ];

    if (!spec) {
      throw new Error(`generate failed: unknown pattern "${namedPattern}"`);
    }

    return { steps: spec.steps, basePattern: [...spec.pattern] };
  }

  if (args.steps == null) {
    throw new Error(
      "generate failed: steps is required when pattern is not set",
    );
  }

  if (args.pulses == null) {
    throw new Error(
      "generate failed: pulses is required when pattern is not set",
    );
  }

  return {
    steps: args.steps,
    basePattern: euclidean(args.pulses, args.steps),
  };
}
