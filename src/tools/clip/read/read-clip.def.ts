// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";

export const toolDefReadClip = defineTool("adj-read-clip", {
  title: "Read Clip",
  description:
    "Read clip settings, MIDI notes, and audio properties. Returns overview by default. Use include to add detail.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
  },
  inputSchema: {
    clipId: z.coerce.string().optional().describe("provide this or slot"),
    slot: z.coerce
      .string()
      .optional()
      .describe(
        "session clip slot: trackIndex/sceneIndex (e.g., '0/3'). provide this or clipId",
      ),
    include: z
      .array(z.enum(["sample", "notes", "color", "timing", "warp", "*"]))
      .default([])
      .describe(
        'notes = MIDI data. timing = loop/start/end markers. sample = audio file info. warp = warp settings. color. "*" = all',
      ),
  },

  smallModelModeConfig: {
    excludeEnumValues: { include: ["warp", "*"] },
    descriptionOverrides: {
      include:
        "notes = MIDI data. timing = loop/start/end markers. sample = audio file info. color",
    },
  },
});
