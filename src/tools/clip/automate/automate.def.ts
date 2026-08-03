// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { z } from "zod";
import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";

export const toolDefAutomate = defineTool("adj-automate", {
  title: "Automate",
  description:
    "Write, read, or clear parameter automation envelopes inside a session clip " +
    "(Live's API rejects arrangement clips). " +
    "Values are normalized 0..1 across the parameter's range. " +
    "Requires the Live Browser Bridge — install with `npm run install:bridge`.",

  annotations: {
    readOnlyHint: false,
    destructiveHint: true,
  },

  inputSchema: {
    action: z
      .enum(["write", "read", "clear", "clear-all"])
      .optional()
      .describe(
        "write = insert envelope points (default). read = sample existing envelope. " +
          "clear = wipe one parameter's envelope. clear-all = wipe every envelope on the clip",
      ),
    clipId: z.coerce.string().optional().describe("provide this or slot"),
    slot: z.coerce
      .string()
      .optional()
      .describe(
        "session clip slot: trackIndex/sceneIndex (e.g., '0/3'). provide this or clipId",
      ),
    devicePath: z
      .string()
      .optional()
      .describe(
        "device to automate, e.g. 't0/d1' or 't0/d0/c1/d0' for rack chains. " +
          "Must be on the clip's track. Omit for track mixer params",
      ),
    paramName: z
      .string()
      .optional()
      .describe(
        "parameter name as shown in Live (case-insensitive). " +
          "Mixer params (no devicePath): 'Volume', 'Pan', or 'Send A'/'Send B'/...",
      ),
    points: z
      .string()
      .optional()
      .describe(
        [
          "comma- or newline-separated '<bar|beat>:<value>' pairs, value 0..1.",
          "'1|1' = clip start. Times must be ascending.",
          "Example: '1|1:0, 9|1:1, 17|1:0.25'",
        ].join("\n"),
      ),
    shape: z
      .enum(["linear", "exponential", "logarithmic", "sine", "s-curve", "step"])
      .optional()
      .describe(
        "interpolation between points (default linear). step = hold each value until the next point",
      ),
    recipe: z
      .enum([
        "filter-sweep-up",
        "filter-sweep-down",
        "volume-fade-in",
        "volume-fade-out",
        "dub-throw",
        "sidechain-pump",
        "tape-stop",
        "washout",
      ])
      .optional()
      .describe(
        "named move generating points over the clip's play region (overrides points). " +
          "filter-sweep-up/down + tape-stop require devicePath + paramName. " +
          "volume-fade-in/out + sidechain-pump default to mixer Volume. " +
          "dub-throw + washout default to Send A",
      ),
    clear: z
      .boolean()
      .optional()
      .describe(
        "on write: wipe this parameter's existing envelope first (default false)",
      ),
  },
});
