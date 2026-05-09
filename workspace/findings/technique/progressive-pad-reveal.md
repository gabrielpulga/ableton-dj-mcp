---
name: progressive-pad-reveal
description: 16-bar intro pad that builds Cm chord one note at a time over 4-bar phases — drone → fifth → triad → octave
type: technique
---

# Progressive pad reveal (16-bar intro)

For dreamy melodic intros (Adam Ten / indie dance), build pad chord progressively across 16 bars instead of dropping full chord at bar 1. Each 4-bar phase adds one chord tone, so the harmonic content thickens organically.

## Pattern (C minor, 4-bar phases)

```
v55 t16 C3 1|1                          // bars 1-4: root drone
v60 t16 C3 5|1 G3 5|1                   // bars 5-8: + fifth
v65 t16 C3 9|1 Eb3 9|1 G3 9|1           // bars 9-12: full triad
v70 t16 C3 13|1 Eb3 13|1 G3 13|1 C4 13|1 // bars 13-16: + octave on top
```

## Settings

- Note duration `t16` = 4 bars per sustain. One retrigger per phase.
- Velocity ramps v55 → v70 across phases (subtle dynamic build).
- Send to A-Reverb at -12 dB for dreamy wash.
- Works with Drift on a pad preset (default pluck preset = wrong sound).

## Why it works

- No melodic decisions needed — pure mood/texture.
- Listener feels harmony fill in over time without conscious tracking.
- Pairs with kick from bar 1 — pad provides atmosphere, kick provides pulse.
- 4-bar phase length aligns with phrasing — listener subconsciously expects change.

## When to use

- Dreamy intro section (16 bars).
- Any "atmospheric build" without melody.
- When you want chord progression complexity without writing one — single Cm sustained the whole time, complexity comes from voicing reveal.

## Validated in

- Project: chill-sunday-with-my-adj-pal (2026-04-26). User reaction: "I dig this one, has a nice progressive feel."
