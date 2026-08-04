---
title: arrangement-clip-is-snapshot
domain: dev
validated: 2026-08-04
evidence:
  "session clip 147 rewritten; arrangement tiles duplicated from it still read
  the old notes"
---

## Fact

`adj-duplicate` copies clip content by value. Arrangement tiles are snapshots —
later edits to the session source do not propagate, and there is no re-sync
operation. Editing a source after tiling means deleting and re-duplicating every
tile.

## Evidence

```
adj-update-clip 147 noteUpdateMode=replace  (rewrote the session clip)
adj-read-track trackIndex 2 → tiles still named/holding the previous version
adj-delete clip 2745,2746,...  → adj-duplicate 147 → correct content
```

Same trap applies to the clip-envelope workaround: write envelope on session
clip → duplicate → clear source. Reordering those steps produces tiles with no
envelope.

## Apply when

Any workflow that edits a session clip and tiles it. Finalise the source before
the first duplicate, and re-place tiles after any source change — including
transform-only edits, which also do not propagate. </content>
