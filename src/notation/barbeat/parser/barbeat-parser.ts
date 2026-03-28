// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * TypeScript wrapper for the Peggy-generated barbeat parser.
 * This is the ONLY file that should import the generated .js parser.
 * All other code should import from this wrapper.
 */
export * from "./generated-barbeat-parser.js";
