---
name: energy-curve-math
description: Energy as measurable 0-100% per bar — concrete formula (active elements × velocity × density), every-4 accent, every-8 structural shift, every-16 section change, sample 128-bar curve table
type: technique
---

# Energy curve math — measurable arc per bar

"Storytelling" in dance music is an energy curve. If you can plot it bar-by-bar and the line goes flat for 16+ bars without intent, the track has no story. This finding gives a concrete way to compute and shape that curve.

## Formula — energy per bar (0-100%)

For a single bar:

```
energy(bar) = sum over each active element of:
              ( velocity_avg / 127 ) × density_factor × weight
```

Where:

- **velocity_avg**: mean velocity of all notes in that bar for that element (0-127).
- **density_factor**: notes_in_bar / max_useful_notes. For drums use 16 (16th grid). For pad use 1 (sustained). For bass use 8.
- **weight**: per-element importance. Suggested defaults:

| Element       | Weight |
|---------------|--------|
| Kick          | 1.0    |
| Sub bass      | 0.9    |
| Bass-mid      | 0.7    |
| Snare / clap  | 0.6    |
| Lead          | 0.6    |
| Pad chord     | 0.5    |
| Hi-hat        | 0.3    |
| Riser FX      | 0.4    |
| Perc top      | 0.3    |

Normalize to 0-100% by dividing the sum by the max possible (all elements at full velocity + full density).

Use the formula as a check, not a goal. The number tells you whether bar 33 is actually higher than bar 32 — protects against "I think this builds" when the math says it's flat.

## Three timing rules — the fractal grid

Dance music repeats at 4 / 8 / 16 / 32 / 64 / 128 bars. Each scale wants a different kind of change.

### Every-4 accent (small)

Every 4 bars, change ONE small thing. Examples:

- Add a single perc hit on bar 4|4
- Open hat on bar 4 only (not bars 1-3)
- Snare ghost note that wasn't in bars 1-3
- Filter cutoff +5%

Listener does not consciously notice but feels the bar 4 lift. Without this, 4-bar phrases feel like loops, not phrases.

### Every-8 structural shift (medium)

Every 8 bars, one element changes role OR a sub-element enters/exits. Examples:

- Bass switches from off-beat stabs to walking bassline
- Pad opens from drone to triad
- New shaker layer enters
- Lead motif octave-up

This is the boundary listeners feel as "something just happened" without being able to name it.

### Every-16 section change (large)

Every 16 bars, full layer in or out. This is the visible structure: intro / build / main / breakdown. Examples:

- All percussion enters
- Bass exits (breakdown)
- Lead enters for first time
- Drop happens

These are the section boundaries the listener consciously tracks.

### Every-32 macro boundary

Every 32 bars marks a macro section transition: intro → break → drop → break → drop → outro. Cross-genre rule. Track structure decisions live at this scale.

## Section-length conventions per genre

All sections divisible by 8. DJ-friendly tracks need a 16+ bar percussive intro and outro for mixing.

| Genre | BPM | Intro | Breakdown | Build | Drop A | Drop B |
|-------|-----|-------|-----------|-------|--------|--------|
| Tech house | 124-128 | 32 | 16-32 | 8 | 32 | 32 |
| Peak-time techno | 130-138 | 32-64 | 16 | 8-16 | 32-64 | 32-64 |
| Melodic techno | 122-128 | 16-32 | 32 | 8-16 | 32 | 32 |
| Indie dance | 118-124 | 16-32 | 16-32 | 8 | 32 (16 bass + 16 melodic B-part) | 32 |
| Progressive psy | 138-142 | 32-64 | 4-8 | 8-16 | 64-128 | 64-128 |
| Full-on psy | 142-148 | 16-32 | 8-16 | 8 | 32-64 | 32-64 |

Use as a default skeleton. Diverge intentionally, not by accident.

## The 1-9 reference scoring scale

Quick way to compare your in-progress arrangement to a reference track without building a full energy table.

Method:

1. Pick a reference track and divide it into 8-bar blocks.
2. Score each 8-bar block from 1 (silence / atmospheric only) to 9 (peak — every element at full velocity).
3. Write the sequence as a number string. Example reference (Innellea-style melodic techno):
   ```
   2-3-4-5-7-9-3-8-9-5
   ```
   Reads as: quiet intro climbing, breakdown to 3, build to 8, peak at 9, outro back to 5.
4. Score your own track the same way.
5. Compare. If yours is `5-5-5-5-7-7-5-5-5-5` → flat-curve problem. If yours is `2-9-2-9-2-9-2-9` → too oscillating, no arc.

A good track has a sequence that rises, peaks once or twice, and falls. The numbers form a shape, not a line.

## How to read an existing track's energy curve

Bar-by-bar listening method (use on reference tracks):

1. Open the reference track in your DAW with bar grid aligned.
2. For each bar 1-32 (then sample every 8 bars after), write down which elements are playing.
3. Estimate velocity_avg per element (loud/medium/soft → 100/75/50).
4. Compute energy(bar). Round to nearest 5%.
5. Plot. Look for:
   - Where does the curve climb? (build sections)
   - Where does it drop suddenly? (breakdown entry, hard cuts)
   - Where does it spike? (drops)
   - Are there flat 16+ bar stretches with no every-4 or every-8 movement? (probably not — that's why it sounds good)
6. Steal the shape, not the notes.

## Sample 128-bar indie-dance energy curve

Target reference: Innellea Spectrum V2 / Adam Ten "Marrakech" hybrid. Indie-dance, 124 BPM.

```
Section      | Bar | Energy% | Element delta (what changed this bar)
-------------|-----|---------|------------------------------------------
Intro A      |   1 |    15   | pad drone enters (root only)
             |   5 |    18   | every-4: pad adds 5th
             |   9 |    25   | every-8: kick enters (4-on-floor)
             |  13 |    28   | every-4: closed hat opens
Build A      |  17 |    40   | every-16: bass enters (off-beat stabs)
             |  21 |    45   | every-4: clap enters bar 4|2 only
             |  25 |    52   | every-8: open hat layer + bass color tones
             |  29 |    58   | every-4: snare ghost ramp begins
Build B      |  33 |    65   | every-16: lead motif teases (1 hit per bar)
             |  37 |    70   | every-4: snare ramp gets denser
             |  41 |    75   | every-8: riser enters, kick still playing
             |  45 |    78   | every-4: 2nd lead hit per bar
Pre-drop     |  49 |    82   | kick drops, riser climbs, snare 32nds
             |  53 |    72   | bass drops, only riser + pad + snare blast
             |  57 |    50   | last 2 bars: only pad tail + reverse cymbal
             |  60 |     5   | bar 60|4: hard silence (1 beat anchor)
Drop / Main  |  61 |    95   | EVERYTHING returns: kick + sub + bass + lead + perc
             |  65 |    95   | every-4: lead motif variation
             |  69 |    95   | every-8: shaker enters, lead octave-up
             |  73 |    90   | every-4: pad lifts (chord substitution)
Breakdown    |  77 |    35   | every-16: drums + bass exit, only pad + lead sustain
             |  81 |    30   | every-4: lead motif fragments (half the notes)
             |  85 |    40   | every-8: sub-bass returns (foreshadow drop 2)
             |  89 |    50   | every-4: snare ramp re-enters
Build C      |  93 |    65   | every-16: kick returns (no bass yet)
             |  97 |    75   | every-4: bass off-beat back
             | 101 |    82   | every-8: full perc stack returns
             | 105 |    85   | every-4: filter open + riser
Drop 2       | 109 |   100   | EVERYTHING + new lead motif (peak moment)
             | 113 |   100   | every-4: dub stab on bar 4|4
             | 117 |    95   | every-8: lead simplifies (less notes, more sustain)
             | 121 |    85   | every-4: pad lifts away
Outro        | 125 |    50   | every-16: lead exits, drum solo
             | 128 |    20   | tail: only kick fading
```

Two complete arc shapes (rise → drop → fall) in 128 bars. Drop 2 (bar 109) is 5% higher than drop 1 (bar 61) — second drop must be bigger or equal, never lower.

## Common failures

- **Flat 16-bar stretches**: same elements at same velocity bars 33-48 → loop, not phrase. Add every-4 or every-8 movement.
- **Drop lower than build peak**: build climbs to 85% then drop is 80% → drop feels like a release, not a peak. Drop must equal or exceed the highest build energy.
- **Drop 2 = Drop 1**: identical energy at bars 61 and 109 → no second-drop payoff. Drop 2 needs +5-10% (new element, octave-up lead, fuller perc).
- **Breakdown to 0%**: full silence in breakdown → loses the listener. Keep at least pad + one melodic element at 30-40% energy.
- **Build flat then sudden drop**: 50% bars 1-48, 95% bar 49 → drop feels arbitrary because there was no curve climbing into it.

## When to use

- Plotting an arrangement before writing clips. Sketch the curve, then place elements to match the curve shape.
- Diagnosing a track that "feels boring" — compute the curve, find the flat stretches, add every-4 movement.
- Comparing your track to a reference track — plot both, see where shapes diverge.
- Confirming a drop is actually a drop. If energy(drop_bar) is not the highest point in the section → not a drop.

## Validated in

- Reference analysis: Innellea Spectrum V2 (full template — every-4/8/16 rules visible across all sections).
- Failure mode source: 2026-05-08 indie-dance jam where every layer played every bar = flat 80% line for 16 bars = "no story." Computing the curve made the flatness obvious.
- Curve table cross-checked against `pre-drop-fill-formula` (bar 49-60 of sample = same Build B → silence → drop pattern).
