// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * E2E tests for adj-microsection-mute tool
 *
 * Creates an 8-bar MIDI clip with notes on multiple pitches across all bars,
 * applies a microsection mute map, and verifies the right notes get
 * velocity=0 in the right bar ranges.
 *
 * Uses: e2e-test-set — t8 "9-MIDI" empty slot.
 *
 * Run with: npm run e2e:mcp -- --run e2e/tests/clip/adj-microsection-mute.test.ts
 */
import { describe, expect, it } from "vitest";
import {
  parseToolResult,
  type ReadClipResult,
  setupMcpTestContext,
  sleep,
} from "../mcp-test-helpers";

const ctx = setupMcpTestContext();

const emptyMidiTrack = 8;

interface NoteRecord {
  pitch: string;
  start: string;
  velocity: number;
}

interface ReadClipNotes extends ReadClipResult {
  notes?: string;
}

/**
 * Parse the `notes` string emitted by adj-read-clip into structured records.
 * Format per token: `<pitch> <bar>|<beat> v<velocity> ...`. Tokens separated
 * by newlines. We only need pitch/start/velocity for assertions.
 */
function parseNotes(notesString: string | undefined): NoteRecord[] {
  if (!notesString) return [];

  const records: NoteRecord[] = [];

  for (const line of notesString.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (trimmed.length === 0) continue;

    const parts = trimmed.split(/\s+/);

    if (parts.length < 2) continue;

    let pitch: string | null = null;
    let start: string | null = null;
    let velocity = 100;

    for (const tok of parts) {
      if (/^v\d+$/.test(tok)) {
        velocity = Number.parseInt(tok.slice(1), 10);
        continue;
      }

      if (/\|/.test(tok)) {
        start = tok;
        continue;
      }

      if (pitch === null) pitch = tok;
    }

    if (pitch != null && start != null) {
      records.push({ pitch, start, velocity });
    }
  }

  return records;
}

function notesAt(
  records: NoteRecord[],
  pitch: string,
  bar: number,
): NoteRecord[] {
  return records.filter(
    (n) => n.pitch === pitch && n.start.startsWith(`${bar}|`),
  );
}

describe("adj-microsection-mute", () => {
  it("zeroes velocity for muted pitches in the right bar ranges", async () => {
    // Setup: 8-bar clip with Eb1 + F#1 hits on bar 1 of every bar (1..8).
    const noteLines: string[] = [];

    for (let bar = 1; bar <= 8; bar++) {
      noteLines.push(`v100 Eb1 ${bar}|1`);
      noteLines.push(`v100 F#1 ${bar}|1`);
    }

    const createResult = await ctx.client!.callTool({
      name: "adj-create-clip",
      arguments: {
        slot: `${emptyMidiTrack}/0`,
        notes: noteLines.join("\n"),
        length: "8:0.0",
      },
    });
    const clip = parseToolResult<{ id: string }>(createResult);

    await sleep(100);

    // Apply 4-microsection arc:
    //   1-2 intro:      mute Eb1 (clap)
    //   3-4 lift:       mute F#1 (open hat)
    //   5-6 peak:       no mute
    //   7-8 resolution: mute all
    await ctx.client!.callTool({
      name: "adj-microsection-mute",
      arguments: {
        clipIds: clip.id,
        microsections: ["1-2: Eb1", "3-4: F#1", "5-6:", "7-8: all"].join("\n"),
      },
    });

    await sleep(100);

    const readResult = await ctx.client!.callTool({
      name: "adj-read-clip",
      arguments: { clipId: clip.id, include: ["notes"] },
    });
    const readClip = parseToolResult<ReadClipNotes>(readResult);
    const records = parseNotes(readClip.notes);

    // Bars 1-2: Eb1 muted (v=0), F#1 unchanged (v=100)
    for (const bar of [1, 2]) {
      for (const eb of notesAt(records, "Eb1", bar)) {
        expect(eb.velocity, `Eb1 bar ${bar} should be muted`).toBe(0);
      }

      for (const fSharp of notesAt(records, "F#1", bar)) {
        expect(
          fSharp.velocity,
          `F#1 bar ${bar} should not be muted`,
        ).toBeGreaterThan(0);
      }
    }

    // Bars 3-4: F#1 muted, Eb1 unchanged
    for (const bar of [3, 4]) {
      for (const eb of notesAt(records, "Eb1", bar)) {
        expect(
          eb.velocity,
          `Eb1 bar ${bar} should not be muted`,
        ).toBeGreaterThan(0);
      }

      for (const fSharp of notesAt(records, "F#1", bar)) {
        expect(fSharp.velocity, `F#1 bar ${bar} should be muted`).toBe(0);
      }
    }

    // Bars 5-6 peak: nothing muted
    for (const bar of [5, 6]) {
      for (const eb of notesAt(records, "Eb1", bar)) {
        expect(eb.velocity, `Eb1 bar ${bar} should play`).toBeGreaterThan(0);
      }

      for (const fSharp of notesAt(records, "F#1", bar)) {
        expect(fSharp.velocity, `F#1 bar ${bar} should play`).toBeGreaterThan(
          0,
        );
      }
    }

    // Bars 7-8 resolution: everything muted ('all')
    for (const bar of [7, 8]) {
      for (const eb of notesAt(records, "Eb1", bar)) {
        expect(eb.velocity, `Eb1 bar ${bar} should be muted (all)`).toBe(0);
      }

      for (const fSharp of notesAt(records, "F#1", bar)) {
        expect(fSharp.velocity, `F#1 bar ${bar} should be muted (all)`).toBe(0);
      }
    }
  });

  it("returns transformsApplied count and transforms string", async () => {
    const createResult = await ctx.client!.callTool({
      name: "adj-create-clip",
      arguments: {
        slot: `${emptyMidiTrack}/1`,
        notes: "v100 Eb1 1|1\nv100 F#1 1|1",
        length: "4:0.0",
      },
    });
    const clip = parseToolResult<{ id: string }>(createResult);

    await sleep(100);

    const muteResult = await ctx.client!.callTool({
      name: "adj-microsection-mute",
      arguments: {
        clipIds: clip.id,
        microsections: "1-2: Eb1, F#1\n3-4:",
      },
    });
    const summary = parseToolResult<{
      clipsUpdated: number;
      transformsApplied: number;
      transforms: string;
    }>(muteResult);

    expect(summary.clipsUpdated).toBe(1);
    expect(summary.transformsApplied).toBe(2);
    expect(summary.transforms).toContain("Eb1 1|1-2|4.999: velocity = 0");
    expect(summary.transforms).toContain("F#1 1|1-2|4.999: velocity = 0");
  });
});
