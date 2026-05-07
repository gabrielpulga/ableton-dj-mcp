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
import { copyFileSync, existsSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const distDir = join(repoRoot, "dist");
const deviceDir = join(repoRoot, "max-for-live-device");
const userLibraryDir = resolveUserLibraryDir();

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
 * Copy fresh bundles into both deploy targets, then kill the running
 * mcp-server child so Max for Live respawns it.
 *
 * Two targets matter:
 *   - max-for-live-device/ — what `npm run install:device` reads from + what
 *     manual drag from the repo loads. Always present.
 *   - User Library — what Live actually reads at runtime once the device is
 *     installed via `npm run install:device`. Only present if the user has
 *     run install:device at least once. We only copy here when the .amxd is
 *     installed there.
 */
function deploy(): void {
  pendingTimer = null;

  const targets: string[] = [deviceDir];

  if (userLibraryDir !== null && existsSync(join(userLibraryDir, "Ableton_DJ_MCP.amxd"))) {
    targets.push(userLibraryDir);
  }

  for (const target of targets) {
    for (const bundle of BUNDLES) {
      try {
        copyFileSync(join(distDir, bundle), join(target, bundle));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        console.error(
          `[dev:hot] copy ${bundle} -> ${target} failed: ${message}`,
        );

        return;
      }
    }
  }

  console.log(`[dev:hot] bundles deployed to ${targets.join(" + ")}`);

  // Max for Live wraps mcp-server.mjs in nsRunner.js, so the running process
  // command line never contains "mcp-server.mjs". Kill by port instead — the
  // server's only LISTEN socket is :3350, so this is unambiguous.
  killProcessOn3350();
}

/**
 * Kill whatever process is listening on TCP :3350. macOS-only (uses lsof).
 * Max for Live respawns the node.script child with the new bundle.
 */
function killProcessOn3350(): void {
  const lsof = spawn("lsof", ["-ti", "TCP:3350", "-sTCP:LISTEN"], {
    stdio: ["ignore", "pipe", "ignore"],
  });

  let stdout = "";

  lsof.stdout.on("data", (chunk: Buffer) => {
    stdout += chunk.toString();
  });

  lsof.on("exit", (code) => {
    const pids = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (code !== 0 || pids.length === 0) {
      console.log("[dev:hot] no process on :3350 (Live not open?)");

      return;
    }

    const killer = spawn("kill", pids, { stdio: "ignore" });

    killer.on("exit", (killCode) => {
      if (killCode === 0) {
        console.log(
          `[dev:hot] killed PID ${pids.join(",")} on :3350; Max will respawn`,
        );

        return;
      }

      // Exit 1 is common: rollup writes the two bundles a couple seconds apart
      // on a cold rebuild, so the second deploy fires after Max has already
      // respawned the child. The PID we read is dead by then. Harmless.
      console.log(
        `[dev:hot] kill no-op (PID ${pids.join(",")} already gone — Max likely restarted between deploys)`,
      );
    });
  });
}

/**
 * Resolve Live's User Library Max MIDI Effect dir. Mirrors the logic in
 * scripts/install-device.ts. Returns null on unsupported platforms.
 * @returns Absolute path or null
 */
function resolveUserLibraryDir(): string | null {
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

/**
 * Kill rollup child, then exit. Triggered by SIGINT (Ctrl+C) or SIGTERM.
 */
function shutdown(): void {
  if (rollup?.pid !== undefined) {
    rollup.kill("SIGTERM");
  }

  process.exit(0);
}
