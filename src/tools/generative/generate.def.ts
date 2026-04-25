// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";
import { NAMED_PATTERN_NAMES } from "./helpers/named-patterns.ts";

export const toolDefGenerate = defineTool("adj-generate", {
  title: "Generate",
  description:
    "Generate algorithmic note patterns. Returns notes in bar|beat notation " +
    "that plug directly into adj-create-clip's `notes` param. Pure computation, " +
    "no Live API calls.",

  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
  },

  inputSchema: {
    algorithm: z
      .enum(["euclidean"])
      .describe("euclidean: Bjorklund-style even distribution of pulses"),

    pattern: z
      .enum(NAMED_PATTERN_NAMES as [string, ...string[]])
      .optional()
      .describe(
        `named pattern (overrides steps/pulses/rotation): ${NAMED_PATTERN_NAMES.join(", ")}`,
      ),

    pitch: z.string().describe("MIDI note name for hits (e.g., C1, F#2)"),

    steps: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .describe("total steps per bar (e.g., 16 for sixteenths)"),

    pulses: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .describe("active hits to distribute across steps"),

    rotation: z.coerce
      .number()
      .int()
      .optional()
      .describe("rotate pattern left by N steps (default 0)"),

    bars: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .describe("how many bars to tile the pattern across (default 1)"),

    velocity: z.coerce
      .number()
      .int()
      .min(0)
      .max(127)
      .optional()
      .describe("hit velocity 0-127 (default 100)"),

    duration: z
      .string()
      .optional()
      .describe(
        "note duration in barbeat syntax without `t` prefix (e.g., /16, 1/8). default: one step length",
      ),
  },
});
