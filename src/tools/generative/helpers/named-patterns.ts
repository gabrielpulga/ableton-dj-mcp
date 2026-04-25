// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

export interface NamedPattern {
  steps: number;
  pattern: boolean[];
}

const T = true;
const F = false;

/**
 * Canonical, hardcoded patterns for musical accuracy.
 * Some (clave) don't fall out of pure Bjorklund — explicit values preserve feel.
 */
export const NAMED_PATTERNS = {
  tresillo: { steps: 8, pattern: [T, F, F, T, F, F, T, F] },
  cinquillo: { steps: 8, pattern: [T, F, T, T, F, T, T, F] },
  "bossa-nova": {
    steps: 16,
    pattern: [T, F, F, T, F, F, T, F, F, F, T, F, F, T, F, F],
  },
  "son-clave": {
    steps: 16,
    pattern: [T, F, F, T, F, F, T, F, F, F, T, F, T, F, F, F],
  },
  "rumba-clave": {
    steps: 16,
    pattern: [T, F, F, T, F, F, F, T, F, F, T, F, T, F, F, F],
  },
  "16th-4": {
    steps: 16,
    pattern: [T, F, F, F, T, F, F, F, T, F, F, F, T, F, F, F],
  },
} as const satisfies Record<string, NamedPattern>;

export type NamedPatternName = keyof typeof NAMED_PATTERNS;

export const NAMED_PATTERN_NAMES = Object.keys(
  NAMED_PATTERNS,
) as NamedPatternName[];
