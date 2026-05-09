---
name: pre-drop-fill-formula
description:
  16-bar Build B → Drop transition formula — snare 16ths velocity ramp + kick
  drops last 2 bars + 32nd snare blast in final bar
type: technique
---

# Pre-drop fill formula (Build B → Peak transition)

The transition from Build B (16 bars) to Peak/Main B is where energy peaks
before release. Three layered moves create the classic indie dance / Maccabi
House drop tension.

## The formula

### 1. Snare 16th velocity ramp (full 16 bars)

```
v60 t/16 E1 1|1
v80 t/16 E1 1|1.25
v90 t/16 E1 1|1.5
v100 t/16 E1 1|1.75
... (16 16ths per bar, tile @2-16=1)
// Then transform: E1: velocity = ramp(30, 115)
```

Ramp velocity from v30 (almost inaudible) to v115 across all 16 bars. Listener
feels tension build without consciously tracking individual hits.

### 2. Kick drops bars 15-16

Use a transform to delete kick in last 2 bars:

```
15|1-16|4.75 C1: velocity = 0
```

Sudden absence of kick = anticipation. The groove has been hammered for 14 bars;
removing it creates a vacuum the drop fills.

### 3. 32nd snare blast in bar 16 only

Replace bar 16 snare with 32nd notes (twice the density), velocity ramping per
beat:

```
v60 t/16 E1 16|1,1.125,1.25,1.375,1.5,1.625,1.75,1.875
v75 t/16 E1 16|2,2.125,2.25,2.375,2.5,2.625,2.75,2.875
v95 t/16 E1 16|3,3.125,3.25,3.375,3.5,3.625,3.75,3.875
v120 t/16 E1 16|4,4.125,4.25,4.375,4.5,4.625,4.75,4.875
```

32 hits in 1 bar at climbing velocity = climax pressure right before drop.

## Why this works

- **16-bar ramp** = subconscious tension, listener doesn't notice the snare
  individually
- **Kick drop** = silence creates the "where's the kick?" anxiety that makes the
  drop hit harder
- **32nd blast** = surface-level tension peaks right before resolution
- All three layered = the body knows the drop is coming before the brain does

## Production notes

- Snare on E1 pad in Drum Rack
- Pad continues throughout (sustained Cm chord with velocity ramp v75→v110
  across 16 bars)
- Bass continues full pattern — only kick drops, not bass

## When to use

- Any 16-bar Build B before a Peak/Main B drop
- Before a return from Breakdown (combine: breakdown ring-out + this fill =
  strong transition)
- Anywhere the energy needs to climax + release

## Validated in

- Project: chill-sunday-with-my-adj-pal (2026-04-26). User reaction: "way
  better." Earlier Build B without these fills lacked transition tension.
