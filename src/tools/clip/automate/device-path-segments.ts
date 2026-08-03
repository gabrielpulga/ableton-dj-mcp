// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Parser for adj-automate devicePath strings. Same grammar as
// resolvePathToLiveApi (src/tools/shared/device/helpers/path/) but emits
// structured segments for the Python bridge instead of a v8 LiveAPI path,
// and restricts to regular tracks (clips only exist on those).

export interface DevicePathSegments {
  trackIndex: number;
  chain: Array<{ type: "d" | "c" | "rc"; index: number }>;
}

/**
 * Parse a devicePath like "t0/d1" or "t0/d0/c1/d0" into bridge segments.
 * @param path - Device path; must start with t<N> and end on a device
 * @returns Track index plus the device/chain walk
 * @throws On invalid segments, rt/mt/drum-pad targets, or non-device tails
 */
export function parseDevicePathSegments(path: string): DevicePathSegments {
  const segments = path.split("/").filter((segment) => segment.length > 0);
  const [head, ...rest] = segments;

  if (head == null) {
    throw new Error("devicePath must be a non-empty string");
  }

  const trackIndex = parseTrackHead(head, path);

  if (rest.length === 0) {
    throw new Error(`devicePath must include a device index: "${path}"`);
  }

  const chain = rest.map((segment) => parseChainSegment(segment, path));
  const tail = chain.at(-1);

  if (tail?.type !== "d") {
    throw new Error(
      `devicePath must end on a device segment (d<N>): "${path}"`,
    );
  }

  return { trackIndex, chain };
}

/**
 * Parse the leading track segment, rejecting return/master tracks.
 * @param head - First path segment
 * @param path - Full path for error messages
 * @returns Track index
 * @throws On rt/mt heads or malformed track segments
 */
function parseTrackHead(head: string, path: string): number {
  if (head === "mt" || head.startsWith("rt")) {
    throw new Error(
      `devicePath must target a regular track (t<N>) — clips don't exist on return/master tracks: "${path}"`,
    );
  }

  const match = /^t(\d+)$/.exec(head);

  if (!match) {
    throw new Error(`invalid track segment in devicePath: "${path}"`);
  }

  return Number.parseInt(match[1] as string);
}

/**
 * Parse a device/chain/return-chain segment.
 * @param segment - Path segment after the track head
 * @param path - Full path for error messages
 * @returns Typed segment for the bridge walk
 * @throws On drum-pad segments or unknown prefixes
 */
function parseChainSegment(
  segment: string,
  path: string,
): { type: "d" | "c" | "rc"; index: number } {
  const match = /^(rc|c|d)(\d+)$/.exec(segment);

  if (!match) {
    if (segment.startsWith("p")) {
      throw new Error(
        `drum-pad segments are not supported in adj-automate devicePath: "${path}"`,
      );
    }

    throw new Error(`invalid segment "${segment}" in devicePath: "${path}"`);
  }

  return {
    type: match[1] as "d" | "c" | "rc",
    index: Number.parseInt(match[2] as string),
  };
}
