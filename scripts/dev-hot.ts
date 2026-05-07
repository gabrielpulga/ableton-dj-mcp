// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Hot dev loop: rollup watch -> dist/ -> auto-deploy to max-for-live-device/
// -> kill node.script child so Max respawns it with fresh code.
//
// Removes the manual cp + eject/redrag cycle. Save .ts -> seconds later the
// device is running new code.
//
// V8 caveat: Live caches V8 bytecode per session. node.script respawn re-runs
// the v8 engine adapter via Max's auto-restart, but if you only changed
// live-api-adapter.js (not mcp-server.mjs), Max may not respawn V8 alone.
// Reload manually via the device's reload button if you don't see the new
// version line in the console.

import { spawn, type ChildProcess } from "node:child_process";
import { copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const distDir = join(repoRoot, "dist");
const deviceDir = join(repoRoot, "max-for-live-device");

const BUNDLES = ["live-api-adapter.js", "mcp-server.mjs"] as const;
// Rollup writes the two bundles ~1s apart. Long enough debounce to coalesce
// both into one deploy + respawn cycle.
const DEBOUNCE_MS = 1500;

let rollup: ChildProcess | null = null;
let pendingTimer: NodeJS.Timeout | null = null;

start();

/**
 * Boot rollup watch as a child + start the chokidar watcher on dist/.
 * Wires SIGINT/SIGTERM to tear down rollup so it doesn't outlive this script.
 */
function start(): void {
  rollup = spawn("npx", ["rollup", "-c", "config/rollup.config.mjs", "-w"], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  rollup.on("exit", (code) => {
    console.log(`[dev:hot] rollup exited (${String(code)}); shutting down`);
    process.exit(code ?? 0);
  });

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  const watcher = chokidar.watch(
    BUNDLES.map((bundle) => join(distDir, bundle)),
    { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 100 } },
  );

  watcher.on("change", schedule);
  watcher.on("add", schedule);

  console.log(
    `[dev:hot] watching ${distDir} -> mirror to ${deviceDir} + restart node.script`,
  );
}

/**
 * Coalesce rapid file events into one deploy pass. Rollup writes both bundles
 * within the same build, so without debounce we'd kill the process twice.
 */
function schedule(): void {
  if (pendingTimer !== null) {
    clearTimeout(pendingTimer);
  }

  pendingTimer = setTimeout(deploy, DEBOUNCE_MS);
}

/**
 * Copy fresh bundles into the device dir, then kill the running mcp-server
 * child so Max for Live respawns it.
 */
function deploy(): void {
  pendingTimer = null;

  for (const bundle of BUNDLES) {
    try {
      copyFileSync(join(distDir, bundle), join(deviceDir, bundle));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error(`[dev:hot] copy ${bundle} failed: ${message}`);

      return;
    }
  }

  console.log(`[dev:hot] bundles deployed to ${deviceDir}`);

  const killer = spawn("pkill", ["-f", "mcp-server.mjs"], { stdio: "ignore" });

  killer.on("exit", (code) => {
    if (code === 0) {
      console.log(
        "[dev:hot] killed mcp-server.mjs; Max will respawn from new bundle",
      );
    } else if (code === 1) {
      // pkill exit 1 = no matching process. Common when Live isn't running.
      console.log("[dev:hot] no mcp-server.mjs running (Live not open?)");
    } else {
      console.error(`[dev:hot] pkill exited with code ${String(code)}`);
    }
  });
}

/**
 * Kill rollup child, then exit. Triggered by SIGINT (Ctrl+C) or SIGTERM.
 */
function shutdown(): void {
  if (rollup?.pid !== undefined) {
    rollup.kill("SIGTERM");
  }

  process.exit(0);
}
