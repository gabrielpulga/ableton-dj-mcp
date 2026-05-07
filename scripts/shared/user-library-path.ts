// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Shared resolver for the Live User Library Max MIDI Effect dir. Used by
// scripts/install-device.ts and scripts/dev-hot.ts so both target the same
// path on every platform.

import { homedir, platform } from "node:os";
import { join } from "node:path";

/**
 * Resolve Live's per-user Max MIDI Effect preset directory for the current
 * platform.
 * @returns Absolute path on macOS/Windows, null on unsupported platforms
 */
export function resolveUserLibraryDir(): string | null {
  const home = homedir();

  switch (platform()) {
    case "darwin":
      return join(
        home,
        "Music",
        "Ableton",
        "User Library",
        "Presets",
        "MIDI Effects",
        "Max MIDI Effect",
      );
    case "win32":
      return join(
        home,
        "Documents",
        "Ableton",
        "User Library",
        "Presets",
        "MIDI Effects",
        "Max MIDI Effect",
      );
    default:
      return null;
  }
}
