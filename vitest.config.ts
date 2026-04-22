// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { join } from "node:path";
import { defineConfig } from "vitest/config";

const __dirname = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "#src": join(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    env: {
      ENABLE_WARP_MARKERS: "true",
    },
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/test/test-setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: [
        ["text", { file: "coverage-summary.txt" }],
        "text-summary",
        "json-summary",
        "json",
        "html",
      ],
      include: ["src/**"],
      exclude: [
        // ignore OS metadata files and git placeholders
        "**/.DS_Store",
        "**/.gitkeep",

        // ignore typedefs:
        "**/*.d.ts",

        // ignore type definition files (pure TypeScript interfaces/types):
        "**/jsconfig.json",
        "**/tsconfig.json",

        // ignore static assets:
        "**/*.html",
        "**/*.css",
        "**/*.svg",

        // peggy grammars and generated parsers
        "**/*.peggy",
        "**/*-parser.js",

        // test helper functions
        "**/*-test-helpers.ts",

        // type definition only files (no executable code)
        "src/notation/types.ts",

        // ignore the bundle entry scripts:
        "src/live-api-adapter/live-api-adapter.ts",
        "src/mcp-server/mcp-server.ts",
        "src/portal/ableton-dj-mcp-portal.ts",

        // ignore V8 protocol code (runs in Max's V8, depends on LiveAPI globals):
        "src/live-api-adapter/code-exec-v8-protocol.ts",

        // ignore disabled stubs (build-time substitutions, not runtime code):
        "src/tools/clip/code-exec/*-disabled.ts",

        // ignore loggers:
        "src/portal/file-logger.ts",

        // ignore test infrastructure:
        "src/test/mocks/**",
        "src/test/helpers/**",
      ],
      reportOnFailure: true,

      // IMPORTANT: Do NOT let test coverage drop:
      thresholds: {
        statements: 97.5,
        branches: 93,
        functions: 96.5,
        lines: 97.5,
      },
    },
  },
});
