// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

import { type PathLike } from "#src/shared/live-api-path-builders.ts";

/**
 * Parse an ID or path value to a path string for LiveAPI constructor
 * @param idOrPath - ID number/string, path string, PathLike object, or ["id", "123"] array
 * @returns Path string for LiveAPI constructor
 * @throws Error if array format is invalid
 */
export function parseIdOrPath(
  idOrPath: string | number | readonly (string | number)[] | PathLike,
): string {
  // Handle PathLike objects (with toString method, not string/number/array)
  if (typeof idOrPath === "object" && !Array.isArray(idOrPath)) {
    return String(idOrPath);
  }

  // Handle array format ["id", "123"] from Live API calls
  if (Array.isArray(idOrPath)) {
    if (idOrPath.length === 2 && idOrPath[0] === "id") {
      return `id ${String(idOrPath[1])}`;
    }

    throw new Error(
      `Invalid array format for LiveAPI.from(): expected ["id", value], got [${String(idOrPath)}]`,
    );
  }

  if (typeof idOrPath === "number") {
    return `id ${idOrPath}`;
  }

  if (/^\d+$/.test(idOrPath)) {
    return `id ${idOrPath}`;
  }

  return idOrPath;
}
