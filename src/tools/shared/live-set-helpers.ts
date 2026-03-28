// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

import { livePath } from "#src/shared/live-api-path-builders.ts";

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

/**
 * Parse song time signature from live_set
 * @returns Time signature components
 */
export function parseSongTimeSignature(): TimeSignature {
  const liveSet = LiveAPI.from(livePath.liveSet);

  return {
    numerator: liveSet.getProperty("signature_numerator") as number,
    denominator: liveSet.getProperty("signature_denominator") as number,
  };
}
