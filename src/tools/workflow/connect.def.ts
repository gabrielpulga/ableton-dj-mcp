// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { defineTool } from "#src/tools/shared/tool-framework/define-tool.ts";

export const toolDefConnect = defineTool("adj-connect", {
  title: "Connect",
  description:
    "Connect to Ableton Live and initialize Ableton DJ MCP. Call before other adj-* tools when the user says use/connect to ableton.",
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
  },
  inputSchema: {
    // No parameters - everything is hardcoded for safety
  },
});
