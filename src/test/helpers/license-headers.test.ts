// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { throwOnFileViolations } from "./meta-test-helpers.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..", "..", "..");

const SOURCE_DIRS = ["src", "e2e", "scripts", "config"];

const EXCLUDED_FILES = [
  "src/notation/barbeat/parser/generated-barbeat-parser.js",
  "src/notation/modulation/parser/generated-modulation-parser.js",
];

const EXPECTED_HEADER_START = "// Ableton DJ MCP";
const EXPECTED_SPDX = "// SPDX-License-Identifier: GPL-3.0-or-later";

function getAllSourceFiles(dir: string, files: string[] = []): string[] {
  let entries: string[];

  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);

    if (statSync(fullPath).isDirectory()) {
      if (entry !== "node_modules" && entry !== "coverage") {
        getAllSourceFiles(fullPath, files);
      }
    } else {
      const ext = extname(entry);

      if ([".ts", ".tsx", ".mjs"].includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function hasValidLicenseHeader(filePath: string): {
  valid: boolean;
  reason?: string;
} {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Handle shebang - header should come after it
  let startLine = 0;

  if (lines[0]?.startsWith("#!")) {
    startLine = 1;
  }

  // Check for "// Ableton DJ MCP" at the expected position
  if (!lines[startLine]?.startsWith(EXPECTED_HEADER_START)) {
    return {
      valid: false,
      reason: `Missing "${EXPECTED_HEADER_START}" at line ${startLine + 1}`,
    };
  }

  // Check for SPDX identifier within first few lines
  const headerLines = lines.slice(startLine, startLine + 5);
  const hasSpdx = headerLines.some((line) => line.includes(EXPECTED_SPDX));

  if (!hasSpdx) {
    return {
      valid: false,
      reason: `Missing SPDX license identifier`,
    };
  }

  return { valid: true };
}

describe("License headers", () => {
  const allFiles: string[] = [];

  for (const dir of SOURCE_DIRS) {
    getAllSourceFiles(dir, allFiles);
  }

  // Filter out excluded files
  const sourceFiles = allFiles.filter(
    (f) => !EXCLUDED_FILES.some((excluded) => f.endsWith(excluded)),
  );

  it("should have source files to check", () => {
    expect(sourceFiles.length).toBeGreaterThan(200);
  });

  it("all source files should have SPDX license headers", () => {
    const violations: Array<{ file: string; reason: string }> = [];

    for (const file of sourceFiles) {
      const result = hasValidLicenseHeader(file);

      if (!result.valid) {
        violations.push({
          file: relative(rootDir, file),
          reason: result.reason ?? "Unknown",
        });
      }
    }

    throwOnFileViolations(
      violations,
      `License header violations found (${violations.length} files)`,
      `Expected format:\n` +
        `  // Ableton DJ MCP - Electronic music production MCP server for Ableton Live\n` +
        `  // Copyright (C) 2026 Gabriel Pulga\n` +
        `  // Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)\n` +
        `  // SPDX-License-Identifier: GPL-3.0-or-later`,
    );
    expect(violations).toHaveLength(0);
  });
});

describe("License embedding", () => {
  it.todo(
    "should have the current LICENSE embedded in the Max for Live device (requires Max for Live rebuild)",
  );
});
