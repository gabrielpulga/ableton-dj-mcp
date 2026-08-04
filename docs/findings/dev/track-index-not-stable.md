---
title: track-index-not-stable
domain: dev
validated: 2026-08-04
evidence:
  "readTrack: trackIndex 13 does not exist — every track shifted down by 3
  mid-session"
---

## Fact

`trackIndex` is a positional address, not an identity. Removing tracks in the
Live UI renumbers every track after them, so indices cached earlier in a session
silently point at the wrong track or fail. Track `id` is stable; `trackIndex` is
not.

## Evidence

Reads at indices 4-12 returned Drums/Bass/Sub. After three empty stock tracks
were deleted in Live:

```
adj-read-track trackIndex 13 → Error: readTrack: trackIndex 13 does not exist
adj-read-track trackIndex 4  → {id:"349", name:"Lead"}   # was "Drums"
```

Same `id` values throughout — only the indices moved.

## Apply when

Any multi-call sequence addressing tracks by index, especially batch
duplicate/delete across several tracks. Re-read `adj-read-live-set` first, and
prefer `trackId` over `trackIndex` when the tool accepts both. </content>
