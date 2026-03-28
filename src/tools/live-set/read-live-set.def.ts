// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";

export const toolDefReadLiveSet = defineTool("adj-read-live-set", {
  title: "Read Live Set",
  description:
    "Read Live Set global settings, track/scene overview. Returns overview by default. Use include to add detail.",

  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
  },
  inputSchema: {
    include: z
      .array(
        z.enum([
          "tracks",
          "scenes",
          "routings",
          "mixer",
          "color",
          "locators",
          "*",
        ]),
      )
      .default([])
      .describe(
        'tracks, scenes = lists. routings, mixer, color = detail (use with tracks/scenes). locators = arrangement markers. "*" = all',
      ),
  },

  smallModelModeConfig: {
    excludeEnumValues: { include: ["locators", "*"] },
    descriptionOverrides: {
      include:
        "tracks, scenes = lists. routings, mixer, color = detail (use with tracks/scenes)",
    },
  },
});
