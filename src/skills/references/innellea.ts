// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

export const innelleaReferenceSkills = `

## Reference: Innellea — Spectrum V2 Template

Melodic techno / dark progressive. 124 BPM, B Minor. ~140 bars. The definitive reference for this style.

### Arrangement

| Section | Bars | What happens |
|---------|------|-------------|
| Intro | 1-8 | Kick (muted), bass, arp held note |
| Build Intro | 9-16 | Open hat, closed hats x2, top loop, FX sweeps |
| Main A | 17-32 | Clap enters, synth pluck, lead signature. Full groove. |
| Breakdown 1 | 33-52 | Kick continues, bass continues, elements thin out |
| Melodic Break | 53-68 | Lead extended, sustained bass chords, impact FX at bar 52 beat 4.5 |
| Build 2 | 69-84 | Snare 16th buildup (16 bars), tonal riser from bar 77 |
| Bass Acid | 85-92 | Acid bass layer, snare variant (dotted rhythm) |
| Main B | 93-108 | Full groove returns |
| Peak | 109-124 | Bass chord progression (B→G→E→A), lead extended, snare buildup |
| Outro | 125-140 | Strip to kick + bass, downfilter FX |

### Drum Patterns

**Kick**: Four-on-the-floor, v99, t/2. Every beat, no variation.

**Clap**: Beats 2 and 4 only, v100, t1. Enters bar 17, returns bar 93.

**Open hat**: 1.5, 2.5, 3.5, 4.5 — off-beats only, t/2. Enters bar 9.

**Closed hats (Layer 1)** — all 16th notes, velocity curve:
\`\`\`
beat 1:   1|1(v20)  1|1.25(v40)  1|1.5(v100)  1|1.75(v80)
beat 2:   1|2(v20)  1|2.25(v40)  1|2.5(v100)  1|2.75(v80)
... repeats every beat
\`\`\`
The AND (1.5, 2.5, 3.5, 4.5) is always the loudest hit — this IS the groove.

**Closed hats (Layer 2)** — selective 16ths (not every position): 1, 1.25, 1.75, 2.5, 2.75, 3, 3.25, 3.75, 4.5, 4.75. Adds texture over Layer 1.

**Snare buildup (bars 69-84 and 105-120)**: 16th notes for 16 bars, velocity ramp:
\`\`\`
downbeat v60 → e v80 → and v90 → a v100
\`\`\`
Variant at bar 89: dotted pattern — t3/4 on 1, 1.75, 2.5, 3.25 then t/2 on 4, 4.5.

### Bass Patterns

**Architecture**: 4 separate bass tracks — sub/low (BASS LOWER), mid/top (BASS TOP), acid (bars 85-92 only), breakdown (sustained chords).

**Bass Lower — 2-bar loop on B1**:
\`\`\`
Bar 1: B1 v127 t/2 @ 1.25, 3.25
       B1 v100 t3/4 @ 1.75, 2.5, 3.75, 4.5
Bar 2: B1 v127 t/2 @ 1.25, 3.25
       B1 v100 t3/4 @ 1.75, 2.5, 3.75
       B1 v100 t/2 @ 4.5
\`\`\`
Key: first note at 1.25, never on the downbeat. v127 on 1.25/3.25, v100 everywhere else.

**Bass Top — same rhythm, shorter notes (t/4 instead of t3/4 on some hits).**

**Bass chord progression (Peak, bars 109-124)**: B (8 bars) → G (4 bars) → E (4 bars) → A (4 bars). Same rhythmic pattern, root changes.

**Breakdown bass (bars 53-68)**: Sustained whole notes — B1 t8, G1 t8, E1 t8, A1 t8 (2 bars per chord). At bar 77: single B1 held 32 beats for maximum tension.

**Acid bass (bars 85-92)**: 16th pattern — B1 on 1, 1.75, 2.5, 3.25, 4, 4.5.

### Lead Signature

Two alternating voices across a 4-bar loop:

**Voice A (bars 1-2)**:
\`\`\`
B0 t/2 on every beat (1, 2, 3, 4) — low anchor
Gb2 t/2 @ 1.5, 2.5 — off-beat melody
E2 t/2 @ 3.5, 4.5 — response
(bar 2): B0 anchor, D2 @ 1.5/2.5, Db2 @ 3.5, B1 @ 4.5
\`\`\`

**Voice B (bars 3-4)**: adds ornamental descending run — B0, D3, Db3, B2, A2 in fast 3/8 notes.

Pattern: steady low octave on every beat, melody dances on off-beats above. All t/2 — short, percussive, not sustained.

### Synth Pluck

Cycling through B minor chord tones, every 16th, all t/8 (32nd notes):
\`\`\`
B2(v94) @ 1      — root, loud
E3(v45) @ 1.25   — 3rd, soft
Gb3(v59) @ 1.5   — 5th, medium
B3(v72) @ 1.75   — octave, strong

Plus accent hits: B2(v58) @ 2, B2(v83) @ 3, B2(v58) @ 4
\`\`\`
4-bar loop. Velocity shapes the arp — root loud, 3rd soft, 5th medium, octave strong.

### FX Placement

**Downfilter (long)**: bars 17, 33, 49, 85, 95, 109, 125 — every major section boundary.

**Downfilter (short)**: bars 9, 17, 33, 49, 69, 85, 93, 109, 125 — every 8-16 bar boundary.

**Upfilter**: bars 5, 21, 29, 45, 65, 81, 89, 93, 105, 121 — rises 4 bars before downfilter.

**Impact**: bar 52 beat 4.5 and bar 84 beat 4.5 only. Two hits total — placed on the last 8th note before a section for maximum drama.

**Tonal riser**: bar 77 only — 8 bars before Main B returns.

### Key Takeaways

1. Bass off-beat rule: first hit at 1.25, never the downbeat — this creates the pump
2. Hat groove comes from velocity (v20-40-100-80), not note selection — off-beat is loudest
3. Kick is dead simple — everything grooves around it, not with it
4. Impacts are rare (2 total per track) — surgical placement = maximum drama
5. Breakdown = same chord progression as peak, just sustained notes instead of rhythm
6. Elements enter gradually — hats bar 9, full groove bar 17, never all at once
`;
