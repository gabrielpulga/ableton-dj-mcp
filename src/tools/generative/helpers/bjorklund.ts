// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Generate a Euclidean rhythm: distribute `pulses` evenly across `steps`.
 * Uses the Bresenham line algorithm, which produces the same maximally-even
 * distribution as Bjorklund for the cases that matter musically.
 *
 * @param pulses - Number of active hits to distribute
 * @param steps - Total step count
 * @returns Boolean array of length `steps`, true = hit
 */
export function euclidean(pulses: number, steps: number): boolean[] {
  if (steps <= 0) {
    throw new Error("euclidean failed: steps must be positive");
  }

  if (pulses < 0) {
    throw new Error("euclidean failed: pulses must be non-negative");
  }

  if (pulses > steps) {
    throw new Error("euclidean failed: pulses cannot exceed steps");
  }

  if (pulses === 0) {
    return new Array<boolean>(steps).fill(false);
  }

  const result: boolean[] = [];
  let prev = -1;

  for (let i = 0; i < steps; i++) {
    const curr = Math.floor((i * pulses) / steps);

    result.push(curr !== prev);
    prev = curr;
  }

  return result;
}

/**
 * Rotate an array left by `offset` positions.
 * Positive offset shifts later steps to the front (pattern starts later in time).
 *
 * @param arr - Source array
 * @param offset - Steps to rotate (any integer, normalised to array length)
 * @returns New rotated array
 */
export function rotate<T>(arr: T[], offset: number): T[] {
  if (arr.length === 0) return arr;

  const o = ((offset % arr.length) + arr.length) % arr.length;

  return [...arr.slice(o), ...arr.slice(0, o)];
}
