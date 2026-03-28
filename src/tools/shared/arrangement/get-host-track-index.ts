// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Get the track index of the host device
 * @returns Track index or null if not found
 */
export function getHostTrackIndex(): number | null {
  try {
    const device = LiveAPI.from("this_device");

    return device.trackIndex;
  } catch {
    return null;
  }
}
