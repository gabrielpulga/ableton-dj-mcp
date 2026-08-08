---
title: write-tools-already-batch
domain: dev
validated: 2026-08-08
evidence:
  "update-clip.def.ts:20, update-track.def.ts:19, update-scene.def.ts:16,
  delete.def.ts:18, create-track.def.ts:22, create-clip.def.ts:24,
  duplicate.def.ts:34"
---

## Fact

The write tools already support batching multiple targets in one call, so "one
object per call" round-trip chattiness is not a gap to fix. Only `adj-automate`
is single-target, and that's inherent to the operation (one clip/param envelope
at a time).

## Evidence

`update-clip`, `update-track`, `update-scene`, `delete` all take a
comma-separated `ids` field. `create-track` takes `count`. `create-clip` takes
comma-separated `slot`/`arrangementStart`. `duplicate` takes `count` plus
comma-separated destination params (`arrangementStart`, `toSlot`, `toPath`).

## Apply when

Considering "add batch support to write tools" as a performance fix — check the
tool's `.def.ts` first, it likely already accepts comma-separated ids or a count
param.
