---
name: indie-dance-microsection-arc
description: 4-microsection arc within an 8-bar loop (intro/lift/peak/resolution every 2 bars). Fixes "every layer plays every bar" failure with adj-update-clip transform snippets to silence elements per bar range.
type: genre
---

# Indie-dance microsection arc — story inside an 8-bar loop

A correct 8-bar loop in indie-dance is not a 1-bar groove tiled 8 times. It is a 4-part arc: **intro (bars 1-2) → lift (bars 3-4) → peak (bars 5-6) → resolution (bars 7-8)**. Each microsection has different element activity. Without this arc, the loop sounds flat regardless of how good the patterns are.

## The failure mode this fixes

2026-05-08 indie-dance session targeting Adam Ten / Mita Gami groove. Patterns were correct (right scale, right rhythm, right velocity curves), but result felt soulless. Diagnosed cause: **every layer played every bar at the same density**. Drums, bass, pads, both leads, e-piano stabs all running flat across 8 bars = no breathing room, no narrative.

Fix is not to make patterns more complex. Fix is to make patterns sparser per bar and stagger which elements play in which microsection.

## The 4-microsection arc (8-bar loop)

```
Bars  | Microsection | Energy | What plays
------|--------------|--------|----------------------------------------
1-2   | Intro        |  60%   | kick + bass + pad. No lead. No clap. No top perc.
3-4   | Lift         |  75%   | + clap on bar 4|2. + lead stab (one hit per bar).
5-6   | Peak         |  90%   | + sustain lead. + open hat. + shaker. Full stack.
7-8   | Resolution   |  70%   | drop sustain lead. drop shaker. clap only on 7|2,8|2. Last beat: pad tail only.
```

Bars 1-2 set the pulse. Bars 3-4 introduce melodic motion. Bars 5-6 are the loop's peak. Bars 7-8 strip back so bar 1 of the next loop feels like a re-entry. The listener feels the loop breathing.

## Element activity table

```
Element             | B1 | B2 | B3 | B4 | B5 | B6 | B7 | B8
--------------------|----|----|----|----|----|----|----|----
Kick C1             |  X |  X |  X |  X |  X |  X |  X |  X
Closed hat F#1      |  X |  X |  X |  X |  X |  X |  X |  X
Bass               |  X |  X |  X |  X |  X |  X |  X |  -
Pad sustain         |  X |  X |  X |  X |  X |  X |  X |  X
Clap Eb1            |  - |  - |  - |  X |  X |  X |  X |  X (sparse: 7|2, 8|2)
Stab lead           |  - |  - |  X |  X |  X |  X |  - |  -
Sustain lead        |  - |  - |  - |  - |  X |  X |  - |  -
Open hat A#1        |  - |  - |  - |  - |  X |  X |  X |  -
Shaker              |  - |  - |  - |  - |  X |  X |  - |  -
E-piano stabs       |  - |  - |  X |  - |  X |  - |  X |  -
```

Only kick + closed hat + pad play every bar. Everything else sits out at least 2 bars per loop. The breathing room is the groove.

## adj-update-clip transform snippets

Workflow: write the full pattern across 8 bars first (loop the 1-bar / 2-bar core), then use `adj-update-clip` transforms to silence specific bar ranges per element. Merge mode.

### Mute clap during intro (bars 1-2)

```
clipId: <drum-clip-id>
mode: merge
transforms:
  - "Eb1 1|1-2|4: velocity = 0"
```

Sets every clap note in bars 1-2 to v=0. Use a velocity transform rather than a delete because it survives humanization (notes that were nudged off-grid still get hit by the velocity-by-pitch filter).

### Mute sustain lead outside peak (bars 1-4 + bars 7-8)

```
clipId: <lead-clip-id>
mode: merge
transforms:
  - "1|1-4|4: velocity = 0"
  - "7|1-8|4: velocity = 0"
```

Sustain lead only audible bars 5-6.

### Drop bass for bar 8 only (resolution breath)

```
clipId: <bass-clip-id>
mode: merge
transforms:
  - "8|1-8|4: velocity = 0"
```

Bar 8 has no bass = listener feels the gap, ready for bar 1 re-entry.

### Sparse clap (only beats 2 of bars 7-8)

```
clipId: <drum-clip-id>
mode: merge
transforms:
  - "Eb1 7|1-7|1.99: velocity = 0"
  - "Eb1 7|2.01-7|4: velocity = 0"
  - "Eb1 8|1-8|1.99: velocity = 0"
  - "Eb1 8|2.01-8|4: velocity = 0"
```

Keeps only the 7|2 and 8|2 hits.

## Why velocity = 0 (not delete)

If your patterns are humanized (timing nudged ± 0.02), a delete-by-exact-position misses notes that drifted off-grid. A velocity-by-bar-range transform catches every note in the range regardless of timing jitter. CLAUDE.md root rule: "v0 won't delete humanized notes" → use velocity transforms via `adj-update-clip`.

## Common failures the arc fixes

- **All layers play all bars** → no breathing. Fix: pick 3-4 elements that drop out at least 2 bars per 8-bar loop.
- **Sustain lead plays whole loop** → no peak moment. Fix: sustain lead = bars 5-6 ONLY.
- **Clap on every bar** → loses impact. Fix: clap = bars 4-8, with sparse hits in 7-8.
- **Bass plays bar 8** → no resolution breath. Fix: bass mutes bar 8, returns bar 1.
- **Lead motif plays continuously** → no contrast between stab and sustain. Fix: stab lead = bars 3-6, sustain lead = bars 5-6, both off bars 7-8.

## When to use

- Indie-dance, Maccabi House, melodic-house at 120-128 BPM.
- 8-bar loops in any Main / Drop section that feel "busy but flat."
- Any section where multiple melodic layers overlap and lack distinct roles.
- Adam Ten, Mita Gami, Innellea, Argy-style productions.

## When NOT to use

- Techno main grooves (130+ BPM) where relentless repetition IS the point — Kraftwerk minimalism rules instead.
- 2-bar loops — too short for 4 microsections, use 1 + 1 question/response instead.
- Breakdowns — different rules (see `breakdown-lead-chord-aligned`).

## Validated in

- 2026-05-08 indie-dance Session-view jam (Adam Ten / Mita Gami target + Pink Floyd "Shine On" lead). Failure mode: every layer every bar = soulless. Arc derived from analyzing what was missing, not from a single working session — pending live A/B in next indie-dance project.
- Cross-references: `lead-stab-plus-sustain-roles` (the two-lead conversation pattern this arc deploys), `maccabi-house-foundational-bass` (the bass pattern that mutes on bar 8), `pre-drop-fill-formula` (used at the macro 16-bar level, this arc operates inside it).
