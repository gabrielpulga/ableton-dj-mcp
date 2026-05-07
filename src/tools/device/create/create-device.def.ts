// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";

export const toolDefCreateDevice = defineTool("adj-create-device", {
  title: "Create Device",
  description:
    "Create a native Live device (instrument, MIDI effect, or audio effect) on a track or inside a chain.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
  },
  inputSchema: {
    deviceName: z
      .string()
      .optional()
      .describe("device name, omit to list available devices"),
    path: z
      .string()
      .optional()
      .describe(
        "insertion path(s), required with deviceName, comma-separated for multiple (e.g., 't0' or 't0,t1,t0/d0/c0')",
      ),
    name: z
      .string()
      .optional()
      .describe("name for all, or comma-separated for each"),
    browserUri: z
      .string()
      .optional()
      .describe(
        "browser URI from adj-browse to load the exact item; pass with deviceName='Drum Rack' to load a kit into a freshly-inserted rack. Requires the Live Browser Bridge.",
      ),
  },

  smallModelModeConfig: {
    excludeParams: [],
    descriptionOverrides: {
      path: "insertion path, required with deviceName (e.g., 't0', 't0/d1', 't0/d0/c0')",
      name: "display name",
      browserUri: "URI from adj-browse to load by browser",
    },
  },
});
