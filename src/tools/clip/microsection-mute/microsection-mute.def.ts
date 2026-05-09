// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";

export const toolDefMicrosectionMute = defineTool("adj-microsection-mute", {
  title: "Microsection Mute",
  description:
    "Silence pitches in bar ranges via velocity=0 transforms. Encodes the 4-microsection arc (intro/lift/peak/resolution) without per-element transform calls. See finding indie-dance-microsection-arc.",

  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
  },

  inputSchema: {
    clipIds: z.coerce
      .string()
      .describe("comma-separated clip ID(s) to apply the mute map to"),
    microsections: z
      .string()
      .describe(
        [
          "multi-line mute map. One line per microsection.",
          "Format: '<barStart>-<barEnd>: <pitch1>, <pitch2>, ...'",
          "  - pitches: MIDI note names (Eb1, F#3, C-1) or numbers (39, 54)",
          "  - 'all' mutes whole clip across the bar range",
          "  - empty list = no mute (peak microsection, declaratively present)",
          "Lines starting with # are comments. Empty lines ignored.",
          "Example:",
          "  1-2: Eb1, F#1   # intro: mute clap + open hat",
          "  3-4: F#1        # lift: mute open hat only",
          "  5-6:            # peak: everything plays",
          "  7-8: all        # resolution: silence the whole clip",
        ].join("\n"),
      ),
  },
});
