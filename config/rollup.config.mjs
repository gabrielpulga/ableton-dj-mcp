// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "rollup-plugin-esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const licensePath = join(rootDir, "LICENSE");
const licenseText = readFileSync(licensePath, "utf-8");

const terserOptions = {
  compress: false,
  mangle: false,
  format: {
    comments: false,
    beautify: true,
    indent_level: 2,
  },
};

const envVarReplacements = {
  "process.env.ENABLE_RAW_LIVE_API": JSON.stringify(
    process.env.ENABLE_RAW_LIVE_API,
  ),
  "process.env.ENABLE_CODE_EXEC": JSON.stringify(process.env.ENABLE_CODE_EXEC),
  "process.env.ENABLE_WARP_MARKERS": JSON.stringify(
    process.env.ENABLE_WARP_MARKERS,
  ),
  "process.env.ENABLE_DEV_CORS": JSON.stringify(process.env.ENABLE_DEV_CORS),
};

// When code execution is disabled, substitute the real code-exec modules with
// lightweight stubs that export the same interface but always return errors/no-ops.
// This eliminates the node:vm import and all execution logic from production bundles.
// IMPORTANT: If the stub files in src/tools/clip/code-exec/*-disabled.ts are renamed
// or moved, update the replacement paths below to match.
const codeExecAliases =
  process.env.ENABLE_CODE_EXEC !== "true"
    ? [
        {
          find: "#src/live-api-adapter/code-exec-v8-protocol.ts",
          replacement: join(
            rootDir,
            "src/tools/clip/code-exec/code-exec-v8-protocol-disabled.ts",
          ),
        },
        {
          find: "./code-exec-v8-protocol.ts",
          replacement: join(
            rootDir,
            "src/tools/clip/code-exec/code-exec-v8-protocol-disabled.ts",
          ),
        },
        {
          find: "./code-executor.ts",
          replacement: join(
            rootDir,
            "src/tools/clip/code-exec/code-executor-disabled.ts",
          ),
        },
        {
          find: "./code-exec-protocol.ts",
          replacement: join(
            rootDir,
            "src/tools/clip/code-exec/code-exec-protocol-disabled.ts",
          ),
        },
      ]
    : [];

const addLicenseHeader = (options = {}) => ({
  name: "add-license-header",
  renderChunk(code) {
    const shebang = options.shebang ? `${options.shebang}\n` : "";

    return `${shebang}/*\n${licenseText}\n*/\n\n${code}`;
  },
});

export default [
  // Live API adapter — runs in Max's V8 inside the .amxd device
  {
    input: join(rootDir, "src/live-api-adapter/live-api-adapter.ts"),
    output: {
      file: join(rootDir, "dist/live-api-adapter.js"),
      format: "es",
    },
    plugins: [
      alias({
        entries: [
          ...codeExecAliases,
          { find: "#src", replacement: join(rootDir, "src") },
        ],
      }),
      replace({
        ...envVarReplacements,
        preventAssignment: true,
      }),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2023",
        tsconfig: join(rootDir, "src/tsconfig.json"),
      }),
      resolve({
        extensions: [".mjs", ".js", ".json", ".node", ".ts"],
        preferBuiltins: true,
        browser: false,
      }),
      { renderChunk: (code) => code.replace(/\nexport.*/, "") }, // remove top-level exports
      terser(terserOptions),
      addLicenseHeader(),
    ],
  },
  // MCP server — runs in Node.js inside the .amxd device
  {
    input: join(rootDir, "src/mcp-server/mcp-server.ts"),
    output: {
      file: join(rootDir, "dist/mcp-server.mjs"),
      format: "es",
    },
    external: ["max-api"],
    plugins: [
      // These plugins bundle up the runtime dependencies (@modelcontextprotocol/sdk, express, and zod) for distribution.
      // Note: these build warnings are expected and harmless:
      // (!) Circular dependencies in node_modules/zod-to-json-schema
      // and
      // (!) "this" has been rewritten to "undefined" in node_modules/zod
      alias({
        entries: [
          ...codeExecAliases,
          { find: "#src", replacement: join(rootDir, "src") },
        ],
      }),
      replace({
        ...envVarReplacements,
        preventAssignment: true,
      }),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2023",
        tsconfig: join(rootDir, "src/tsconfig.json"),
      }),
      resolve({
        extensions: [".mjs", ".js", ".json", ".node", ".ts"],
        preferBuiltins: true,
        browser: false,
      }),
      commonjs(),
      json(),
      terser(terserOptions),
      addLicenseHeader(),
    ],
  },
  // Portal — stdio-to-HTTP bridge used by MCP clients (Claude Desktop, etc.)
  {
    input: join(rootDir, "src/portal/ableton-dj-mcp-portal.ts"),
    output: {
      file: join(rootDir, "dist/ableton-dj-mcp-portal.js"),
      format: "es",
    },
    plugins: [
      alias({
        entries: [{ find: "#src", replacement: join(rootDir, "src") }],
      }),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2023",
        tsconfig: join(rootDir, "src/tsconfig.json"),
      }),
      resolve({
        extensions: [".mjs", ".js", ".json", ".node", ".ts"],
        preferBuiltins: true,
        browser: false,
      }),
      commonjs(),
      json(),
      terser(terserOptions),
      addLicenseHeader({
        shebang: "#!/usr/bin/env node",
      }),
      replace({
        ...envVarReplacements,
        delimiters: ["", ""],
        'import pkceChallenge from "pkce-challenge";':
          'const pkceChallenge = () => { throw new Error("Authorization not supported - Ableton DJ MCP uses local HTTP communication only"); };',
        preventAssignment: true,
      }),
    ],
  },
];
