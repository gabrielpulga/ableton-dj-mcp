// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  type MemoryResult,
  type SamplesResult,
  handleReadMemory,
  handleSearchSamples,
  handleWriteMemory,
} from "./context-helpers.ts";

interface ContextArgs {
  action?: string;
  content?: string;
  search?: string;
}

type ContextResult = MemoryResult | SamplesResult;

/**
 * Project context tool for Ableton DJ MCP (memory + samples)
 * @param args - The parameters
 * @param args.action - Action to perform (read, write, search)
 * @param args.content - Memory content (required for write)
 * @param args.search - Search filter (for search)
 * @param toolContext - The context object
 * @returns Result varies by action
 */
export function context(
  { action, content, search }: ContextArgs = {},
  toolContext: Partial<ToolContext> = {},
): ContextResult {
  switch (action) {
    case "read":
      return handleReadMemory(toolContext);
    case "write":
      return handleWriteMemory(content, toolContext);
    case "search":
      return handleSearchSamples(search, toolContext);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
