// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNonExistentObjects } from "#src/test/mocks/mock-registry.ts";
import { applyCodeToSingleClip } from "../apply-code-to-clip.ts";

vi.mock(import("#src/live-api-adapter/code-exec-v8-protocol.ts"), () => ({
  executeNoteCode: vi.fn(),
}));

describe("applyCodeToSingleClip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when clip does not exist", async () => {
    mockNonExistentObjects();

    const result = await applyCodeToSingleClip("nonexistent-clip", "return []");

    expect(result).toBeNull();
  });
});
