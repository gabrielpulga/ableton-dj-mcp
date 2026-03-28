// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Utility to open a Live Set for E2E tests via the REST API.
 */

const OPEN_LIVE_SET_URL =
  process.env.OPEN_LIVE_SET_URL ??
  "http://localhost:3350/api/tools/adj-connect";

/**
 * Open a Live Set in Ableton Live via the MCP server REST API.
 *
 * @param liveSetPath - Path to the .als file to open
 */
export async function openLiveSet(liveSetPath: string): Promise<void> {
  const response = await fetch(OPEN_LIVE_SET_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ liveSetPath }),
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Failed to open live set "${liveSetPath}": ${response.status} ${text}`,
    );
  }
}
