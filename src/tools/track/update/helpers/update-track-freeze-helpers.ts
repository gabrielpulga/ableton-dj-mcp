// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import * as console from "#src/shared/v8-max-console.ts";
import { waitUntil } from "#src/shared/v8-sleep.ts";
import { isDeadlineExceeded } from "#src/tools/clip/helpers/loop-deadline.ts";
import { type UpdateTrackResult } from "../update-track.ts";

/** Polling cadence while waiting for Live to finish an async freeze/unfreeze. */
const FREEZE_POLL_INTERVAL_MS = 200;

/** Upper bound on poll attempts per track (200ms * 50 = 10s ceiling). */
const FREEZE_POLL_MAX_RETRIES = 50;

/**
 * Read the track's current frozen state.
 * @param track - Track object
 * @returns True if the track is currently frozen
 */
function isTrackFrozen(track: LiveAPI): boolean {
  return (track.getProperty("is_frozen") as number) > 0;
}

/**
 * Set freeze/unfreeze and flatten on a track, mutating the result object.
 *
 * Freezing is asynchronous in Live: setting `freeze` starts the operation and
 * `is_frozen` only flips once rendering completes. This polls for completion
 * with a bounded timeout (mirrors waitForPlayheadPosition's poll-then-warn
 * shape in update-live-set-locator-helpers.ts). If the overall request
 * deadline is close - likely when freezing many tracks in one call - the poll
 * is skipped for this track and `freezeStatus: "in_progress"` is reported
 * instead of blocking; the AI can confirm completion with adj-read-track.
 *
 * @param track - Track object
 * @param freeze - Desired freeze state (true = freeze, false = unfreeze), or undefined to skip
 * @param flatten - Whether to flatten (commit frozen audio, remove devices)
 * @param deadline - Absolute deadline from computeLoopDeadline, or null
 * @param result - Per-track result object to mutate with outcome fields
 */
export async function applyFreezeAndFlatten(
  track: LiveAPI,
  freeze: boolean | undefined,
  flatten: boolean | undefined,
  deadline: number | null,
  result: UpdateTrackResult,
): Promise<void> {
  if (freeze != null) {
    await applyFreeze(track, freeze, deadline, result);
  }

  if (flatten) {
    applyFlatten(track, result);
  }
}

/**
 * Set the freeze property and poll for Live to confirm completion.
 * @param track - Track object
 * @param freeze - Desired freeze state
 * @param deadline - Absolute deadline from computeLoopDeadline, or null
 * @param result - Per-track result object to mutate with outcome fields
 */
async function applyFreeze(
  track: LiveAPI,
  freeze: boolean,
  deadline: number | null,
  result: UpdateTrackResult,
): Promise<void> {
  track.set("freeze", freeze);

  const confirmed =
    !isDeadlineExceeded(deadline) &&
    (await waitUntil(() => isTrackFrozen(track) === freeze, {
      pollingInterval: FREEZE_POLL_INTERVAL_MS,
      maxRetries: FREEZE_POLL_MAX_RETRIES,
    }));

  if (confirmed) {
    result.isFrozen = freeze;

    return;
  }

  console.warn(
    `updateTrack: track ${track.id} did not confirm ${freeze ? "freeze" : "unfreeze"} within the polling window`,
  );
  result.freezeStatus = "in_progress";
}

/**
 * Flatten a frozen track: commits frozen audio permanently and removes
 * devices. Skips with a warning if the track isn't frozen.
 * @param track - Track object
 * @param result - Per-track result object to mutate with outcome fields
 */
function applyFlatten(track: LiveAPI, result: UpdateTrackResult): void {
  if (!isTrackFrozen(track)) {
    console.warn(
      `updateTrack: track ${track.id} must be frozen before flatten, skipping`,
    );

    return;
  }

  track.call("flatten");
  result.flattened = true;

  result.$meta ??= [];
  result.$meta.push(
    "Flatten is irreversible: devices were removed and frozen audio was committed as clips.",
  );
}
