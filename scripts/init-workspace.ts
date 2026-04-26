// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Scaffolds workspace/ from workspace.template/. Idempotent: refuses to overwrite
// an existing workspace/ to protect user data.

import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const templateDir = join(repoRoot, "workspace.template");
const targetDir = join(repoRoot, "workspace");

if (!existsSync(templateDir)) {
  console.error(`init-workspace failed: template not found at ${templateDir}`);
  process.exit(1);
}

if (existsSync(targetDir)) {
  console.error(
    `init-workspace skipped: ${targetDir} already exists.\n` +
      `If you want to start over, move or delete it first:\n` +
      `  mv workspace workspace.bak`,
  );
  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });
cpSync(templateDir, targetDir, { recursive: true });

console.log(`workspace created at ${targetDir}`);
console.log("");
console.log("Next steps:");
console.log("  1. Edit workspace/AI.md to add your own production preferences");
console.log("  2. Add your projects under workspace/projects/<project-name>/");
console.log(
  "  3. cd workspace && start your AI client there for music sessions",
);
