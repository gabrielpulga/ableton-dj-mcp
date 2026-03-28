// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Config management utilities for E2E tests.
 */

/** Options for the MCP server config endpoint */
export interface ConfigOptions {
  memoryEnabled?: boolean;
  memoryContent?: string;
  memoryWritable?: boolean;
  smallModelMode?: boolean;
  jsonOutput?: boolean;
  sampleFolder?: string;
  tools?: string[];
}

export const CONFIG_URL =
  process.env.CONFIG_URL ?? "http://localhost:3350/config";

/**
 * Set server config via the REST config endpoint.
 *
 * @param options - Config values to update
 */
export async function setConfig(options: ConfigOptions): Promise<void> {
  const response = await fetch(CONFIG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Failed to set config: ${response.status}`);
  }
}

/**
 * Reset server config to defaults used in E2E tests.
 * Enables JSON output and clears memory state.
 */
export async function resetConfig(): Promise<void> {
  await setConfig({
    memoryEnabled: false,
    memoryContent: "",
    memoryWritable: false,
    smallModelMode: false,
    jsonOutput: true,
    sampleFolder: "",
  });
}
