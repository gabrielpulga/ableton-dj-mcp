// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

// Scaffolds workspace/ from workspace.template/. Merge semantics: copies any
// template entry missing from workspace/, never overwrites existing user files.
// Safe to re-run after pulling template updates.
//
// Why merge (not all-or-nothing): workspace/findings/ is tracked in git, so on
// a fresh clone workspace/ already exists with findings/ in it. An "abort if
// target exists" check would leave the user without AI.md / genres/ /
// techniques/ / projects/.

import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
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

mkdirSync(targetDir, { recursive: true });

const copied: string[] = [];
const skipped: string[] = [];

for (const entry of readdirSync(templateDir)) {
  const src = join(templateDir, entry);
  const dst = join(targetDir, entry);
  if (existsSync(dst)) {
    skipped.push(entry);
    continue;
  }
  cpSync(src, dst, { recursive: true });
  copied.push(entry);
}

if (copied.length === 0) {
  console.log(`workspace already populated at ${targetDir} — nothing to copy`);
  if (skipped.length > 0) {
    console.log(`  existing entries left untouched: ${skipped.join(", ")}`);
  }
  process.exit(0);
}

console.log(`workspace populated at ${targetDir}`);
console.log(`  copied: ${copied.join(", ")}`);
if (skipped.length > 0) {
  console.log(`  preserved (existing): ${skipped.join(", ")}`);
}
console.log("");
console.log("Next steps:");
console.log("  1. Edit workspace/AI.md to add your own production preferences");
console.log("  2. Add your projects under workspace/projects/<project-name>/");
console.log(
  "  3. cd workspace && start your AI client there for music sessions",
);
