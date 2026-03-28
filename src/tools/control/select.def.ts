// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";

export const toolDefSelect = defineTool("adj-select", {
  title: "Select",
  description:
    'Navigate to and select items in Live. Use for "show me", "go to", "open" requests. No args: read current state.',

  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
  },

  inputSchema: {
    id: z.coerce
      .string()
      .optional()
      .describe("select by ID (auto-detects track/scene/clip/device)"),

    trackIndex: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .describe("0-based track index"),
    trackType: z
      .enum(["return", "master"])
      .optional()
      .describe("omit for audio/midi tracks, or: return, master"),

    sceneIndex: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .describe("0-based scene index"),

    slot: z
      .string()
      .optional()
      .describe("session clip slot: trackIndex/sceneIndex (e.g., '0/3')"),

    devicePath: z
      .string()
      .optional()
      .describe("select device by path (e.g. t0/d1)"),

    view: z.enum(["session", "arrangement"]).optional().describe("main view"),
  },

  smallModelModeConfig: {
    // Intentionally empty — simple tool with few params, all useful for SLMs
  },
});
