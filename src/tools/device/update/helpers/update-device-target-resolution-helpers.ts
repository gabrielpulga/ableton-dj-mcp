// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { errorMessage } from "#src/shared/error-utils.ts";
import * as console from "#src/shared/v8-max-console.ts";
import {
  resolveDrumPadFromPath,
  resolvePathToLiveApi,
} from "#src/tools/shared/device/helpers/path/device-path-helpers.ts";

export interface ResolvedTarget {
  target: LiveAPI;
  isDrumPadPath?: boolean;
}

/**
 * Resolve an ID to a LiveAPI target
 * @param id - Object ID
 * @returns Resolved target or null if not found
 */
export function resolveIdToTarget(id: string): ResolvedTarget | null {
  const target = LiveAPI.from(id);

  return target.exists() ? { target } : null;
}

/**
 * Safely resolve a path to a Live API target, catching errors
 * @param path - Device/chain/drum-pad path
 * @returns Resolved target or null if not found or invalid
 */
export function resolvePathToTargetSafe(path: string): ResolvedTarget | null {
  try {
    return resolvePathToTarget(path);
  } catch (e) {
    console.warn(`updateDevice: ${errorMessage(e)}`);

    return null;
  }
}

/**
 * Resolve a path to a Live API target (device, chain, or drum pad)
 * @param path - Device/chain/drum-pad path
 * @returns Resolved target or null if not found
 */
function resolvePathToTarget(path: string): ResolvedTarget | null {
  const resolved = resolvePathToLiveApi(path);

  switch (resolved.targetType) {
    case "device": // fallthrough
    case "chain": // fallthrough

    case "return-chain": {
      const target = resolveTargetFromPath(resolved.liveApiPath);

      return target ? { target } : null;
    }

    case "drum-pad": {
      // drumPadNote is guaranteed for drum-pad targetType
      const drumPadNote = resolved.drumPadNote as string;
      const { remainingSegments } = resolved;
      const drumPadResult = resolveDrumPadFromPath(
        resolved.liveApiPath,
        drumPadNote,
        remainingSegments,
      );

      if (!drumPadResult.target) {
        return null;
      }

      // Detect if this is a drum pad path (no explicit chain index) vs chain path
      // pC1 = pad path, pC1/c0 = chain path
      const hasExplicitChainIndex =
        remainingSegments.length > 0 &&
        (remainingSegments[0] as string).startsWith("c");

      return {
        target: drumPadResult.target,
        isDrumPadPath: !hasExplicitChainIndex,
      };
    }
  }
}

/**
 * Resolve device or chain target from Live API path
 * @param liveApiPath - Live API canonical path
 * @returns LiveAPI object or null if not found
 */
function resolveTargetFromPath(liveApiPath: string): LiveAPI | null {
  const target = LiveAPI.from(liveApiPath);

  return target.exists() ? target : null;
}
