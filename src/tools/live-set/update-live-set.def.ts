// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";

export const toolDefUpdateLiveSet = defineTool("adj-update-live-set", {
  title: "Update Live Set",
  description: "Update Live Set global settings or manage locators.",
  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
  },
  inputSchema: {
    tempo: z.coerce.number().min(20).max(999).optional().describe("BPM"),
    timeSignature: z.string().optional().describe("N/D (4/4)"),
    groove: z.coerce
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Global groove pool amount (0.0-1.0)"),
    scale: z
      .string()
      .optional()
      .describe(
        '"Root ScaleName" ("C Major", "F# Minor", "Bb Dorian"). Empty string disables scale',
      ),

    punchIn: z
      .boolean()
      .optional()
      .describe("Enable/disable punch-in recording"),
    punchOut: z
      .boolean()
      .optional()
      .describe("Enable/disable punch-out recording"),
    overdub: z
      .boolean()
      .optional()
      .describe("Enable/disable arrangement overdub mode"),

    locatorOperation: z
      .enum(["create", "delete", "rename"])
      .optional()
      .describe("Locator operation"),
    locatorId: z
      .string()
      .optional()
      .describe("Locator ID for delete/rename (e.g., locator-0)"),
    locatorTime: z
      .string()
      .optional()
      .describe(
        "Bar|beat position (required for create, alt ID for delete/rename)",
      ),
    locatorName: z
      .string()
      .optional()
      .describe("Name for create/rename, or name-match filter for delete"),
    // arrangementFollower removed from interface - play-arrangement always auto-follows
  },

  smallModelModeConfig: {
    toolDescription: "Update Live Set global settings",
    excludeParams: [
      "locatorOperation",
      "locatorId",
      "locatorTime",
      "locatorName",
    ],
  },
});
