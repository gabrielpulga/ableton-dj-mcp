---
title: euclidean-density-sweep
domain: music
validated: 2026-04-25
evidence: live demo in Ableton 12.3.7, conversation 2026-04-25
---

## Fact

Sweeping `pulses` across (3, 5, 7, 11) at fixed `steps=16` produces a
section-by-section arrangement arc using a single algorithm. Density evolution
alone drives perceived energy without changing tempo, pitch, or timbre.

## Evidence

4-bar test clip via `adj-generate(steps=16, pulses=N, pitch=C3)`:

- Bar 1, pulses=3 → `1|1, 2.5, 3.75` (sparse stabs)
- Bar 2, pulses=5 → `1|1, 2, 2.75, 3.5, 4.25` (cinquillo density)
- Bar 3, pulses=7 → `1|1, 1.75, 2.25, 2.75, 3.5, 4, 4.5` (full groove)
- Bar 4, pulses=11 → 11 hits across 16 (dense psy stutter)

Same root, same instrument, only `pulses` parameter changes. Audible energy
ramp.

## Apply when

Generating section transitions where a rising or falling energy arc is wanted.
Lower `pulses` values (relative to `steps`) read as sparse/low-energy, higher
values read as dense/high-energy. Stays inside the bar grid — no rhythmic chaos,
just density curve. Pick the exact range for your genre/section in your own
workspace notes.
