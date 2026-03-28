// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * MCP connection utilities for E2E tests.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

/** Active MCP connection with client and cleanup method */
export interface McpConnection {
  client: Client;
  close: () => Promise<void>;
}

/**
 * Connect to the MCP server at the given URL.
 *
 * @param url - MCP server URL (e.g. "http://localhost:3350/mcp")
 * @returns Connected MCP connection
 */
export async function connectMcp(url: string): Promise<McpConnection> {
  const client = new Client({ name: "e2e-test-client", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(url));

  await client.connect(transport);

  return {
    client,
    close: async () => client.close(),
  };
}

/**
 * Extract text from a tool result content array.
 *
 * @param result - Tool call result
 * @returns Concatenated text from all text content items
 */
export function extractToolResultText(result: unknown): string {
  const typed = result as {
    content?: Array<{ type?: string; text?: string }>;
  } | null;

  if (!typed?.content) return "";

  return typed.content
    .filter((item) => item.type === "text")
    .map((item) => item.text ?? "")
    .join("");
}
