// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

import { innelleaReferenceSkills } from "#src/skills/references/innellea.ts";

// Add new artist references here — one import + one entry in the array
const references = [innelleaReferenceSkills];

export const allReferenceSkills = references.join("\n");
