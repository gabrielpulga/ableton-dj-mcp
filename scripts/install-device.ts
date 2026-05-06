// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Installs the Max for Live device into Ableton's User Library so it shows up
// in the browser permanently. Eliminates the per-session Finder drag.
//
// Source:  max-for-live-device/Ableton_DJ_MCP.amxd (+ sibling JS bundles)
// Dest:    <Live User Library>/Presets/MIDI Effects/Max MIDI Effect/
//
// Idempotent: overwrites existing files of the same name.

import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const sourceDir = join(repoRoot, "max-for-live-device");
const distDir = join(repoRoot, "dist");

const DEVICE_FILES = [
  "Ableton_DJ_MCP.amxd",
  "live-api-adapter.js",
  "mcp-server.mjs",
] as const;

/**
 * Resolve the path to Live's per-user Max MIDI Effect preset directory.
 * @returns Absolute path on the current platform
 */
function resolveUserLibraryDir(): string {
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
      console.error(
        `install-device: unsupported platform '${platform()}'. ` +
          `Ableton Live runs on macOS or Windows only.`,
      );
      process.exit(1);
  }
}

/**
 * Verify the source files exist and warn if dist/ has drifted from
 * max-for-live-device/ (which would mean we're about to install stale code).
 */
function assertSourceFresh(): void {
  for (const file of DEVICE_FILES) {
    const sourcePath = join(sourceDir, file);

    if (!existsSync(sourcePath)) {
      console.error(`install-device failed: missing ${sourcePath}`);
      console.error("Run `npm run build` first.");
      process.exit(1);
    }
  }

  for (const file of ["live-api-adapter.js", "mcp-server.mjs"]) {
    const distPath = join(distDir, file);
    const sourcePath = join(sourceDir, file);

    if (!existsSync(distPath)) {
      continue;
    }

    if (hashFile(distPath) !== hashFile(sourcePath)) {
      console.warn(
        `install-device: WARNING — dist/${file} differs from ` +
          `max-for-live-device/${file}. The device will install with stale code.`,
      );
      console.warn(
        "  Run: cp dist/live-api-adapter.js dist/mcp-server.mjs " +
          "max-for-live-device/",
      );
      console.warn("  Then re-run this script.");
    }
  }
}

/**
 * Hash a file's contents (sha256) for cheap drift detection.
 * @param path - Absolute path to the file
 * @returns Hex-encoded sha256 digest
 */
function hashFile(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

assertSourceFresh();

const targetDir = resolveUserLibraryDir();

if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
  console.log(`install-device: created ${targetDir}`);
}

for (const file of DEVICE_FILES) {
  const sourcePath = join(sourceDir, file);
  const targetPath = join(targetDir, file);

  copyFileSync(sourcePath, targetPath);
  console.log(`  copied ${file}`);
}

console.log("");
console.log(`Installed to: ${targetDir}`);
console.log("");
console.log("Next steps:");
console.log("  1. Restart Ableton Live (or refresh User Library in Browser)");
console.log("  2. In Live's browser: Categories → Max for Live → Max MIDI");
console.log("     Effect → 'Ableton DJ MCP' should appear");
console.log("  3. Drag onto any MIDI track to load");
console.log("");
console.log(
  "Optional: open a Live set with the device on a return track, then",
);
console.log(
  "File → Save Live Set as Default Set. Every new Live set will then",
);
console.log("auto-load the device.");
