// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// Based on Producer Pal by Adam Murray (https://github.com/adamjmurray/producer-pal)
// SPDX-License-Identifier: GPL-3.0-or-later

export const electronicMusicSkills = `

## Electronic Music Production

### Genre Conventions
| Genre | BPM | Character |
|-------|-----|-----------|
| House | 120-130 | Groovy, warm, vocal-driven |
| Indie Dance | 120-128 | Melodic hooks, live-instrument feel |
| Tech House | 124-130 | Driving, percussive, rolling basslines |
| Afro House | 118-128 | Organic percussion, polyrhythmic |
| Melodic Techno | 128-138 | Emotional leads, layered pads, progressive builds |
| Techno | 130-150 | Industrial, hypnotic, dark atmospheres |
| Psytrance | 138-148 | Psychedelic basslines, acid elements, complex rhythms |

### Drum Patterns

**Kick**: Four-on-the-floor on every beat. No ghost kicks, no syncopation in driving sections. v99, t/2. Dead simple.

**Clap/Snare**: Beats 2 and 4. Classic backbeat. v100. No off-beats, no ghost hits.

**Open Hat**: Off-beats only (1.5, 2.5, 3.5, 4.5). t/2. Creates push/swing.

**Closed Hat Groove**: All 16th notes with velocity curve that IS the groove:
\`\`\`
v20 on downbeats (1, 2, 3, 4)
v40 on e's (1.25, 2.25, 3.25, 4.25)
v100 on ands (1.5, 2.5, 3.5, 4.5)  <- LOUDEST
v80 on a's (1.75, 2.75, 3.75, 4.75)
\`\`\`
The off-beat (and) is the loudest hit. Groove comes from velocity dynamics, not note placement.

**Snare Buildup**: 16th notes for 16 bars. Velocity ramp: v60 downbeats, v80 e's, v90 ands, v100 a's.

**Always read drum-map before writing** -- never assume mappings. Different tracks have different drum racks.

### Bass Patterns

**Driving bass**: Avoid the downbeat. First hit at 1.25 (the "e" of beat 1). This creates off-beat pump against kick on 1.
\`\`\`
Accent hits (v127, t/2) on 1.25, 3.25
Fill hits (v100, t3/4) on 1.75, 2.5, 3.75, 4.5
\`\`\`
Mix t/2 and t3/4 note lengths -- rhythmic interest through duration, not just timing.

**Bass layering**: Separate tracks for sub/low content and mid/top content. Same rhythm, different voicing.

**Breakdown bass**: Same progression as main but as long sustained notes (t8 per chord, 2 bars each).

**Progressive complexity**: Start with pure root notes -> add one passing tone -> build to walking bass across clips.

### Lead Patterns (Melodic Techno)

**2-4 note motifs with portamento**: Mono mode, glide 100-150ms. Intervals of 4ths/5ths glide best.

**Innellea-style**: Low anchor note on every beat (B0), melody dances on off-beats above (intervals of 4ths, 5ths). Short notes (t/2). The contrast between steady low and dancing upper creates tension.

**ARTBAT-style**: Mix long sustains (t3-t4) with short staccato (t/4). LFO on filter cutoff. Auto-pan for width. Don't write complex melodies -- sound design and glide create the emotion.

**Plucks/arps**: Use 2-note chords (dyads), not single notes. Root+fifth dyads for width. Repeat same anchor chord multiple times per bar for hypnotic feel, one contrast chord for movement.

### Arrangement Structure

Typical electronic track arrangement (128-140 bars):
| Section | Bars | Energy | Elements |
|---------|------|--------|----------|
| Intro | 1-8 | Low | Kick (muted), bass, atmospheric |
| Build Intro | 9-16 | Rising | +hats, +percussion, +FX |
| Main A | 17-32 | Medium | Full groove: kick, clap, hats, bass, pluck |
| Breakdown 1 | 33-52 | Dip | Strip to kick + bass, sustained chords |
| Melodic Break | 53-68 | Emotional | Lead enters, long bass chords, impacts |
| Build 2 | 69-84 | Rising | Snare buildup (16 bars), tonal riser |
| Main B / Peak | 85-108 | High/Peak | Full groove + bass progression + lead |
| Outro | 109-140 | Fade | Strip down to kick + bass, downfilter |

**Elements enter gradually** -- hats before main groove, clap/pluck at main groove start.

**Tease before new elements** -- introduce bass, pluck, kick 2-4 bars before they fully arrive. Progressive reveal: 1 hit -> 2 -> 3 -> full pattern.

**Breathing room after breakdowns** -- leave 2-4 bars of silence between breakdown and peak. The pause IS the transition.

### FX & Transitions

**Downfilter FX**: Place so it STARTS at the target bar. Mark every 8-16 bar boundary.
**Upfilter/Riser**: Place so it ENDS at the target bar. Often 4 bars before a downfilter.
**Impacts**: Rare (only 1-2 per track). Place on last 8th note before section (e.g., bar 52 beat 4.5).
**Tonal riser**: Single long riser 8 bars before a major drop.

Add Simple Delay (~30% dry/wet) on FX tracks for echo tail. Use clip fade-out for smooth ending.

### Sound Design Rules

- **Pads**: Always chords (3+ notes), never single notes. Progressive reveal: drone -> fifth -> full chord. Velocity behind bass (v55-60 pad vs v90+ bass).
- **Each element is a person** -- percussion should have personality, a recognizable phrase, and respond to other elements. Not just fill grid positions.
- **Strong sounds need restraint** -- aggressive stabs, psychedelic claps work in fills/transitions, overpower when looped.
- **Probability notes for organic feel** -- p0.3-0.4 ghost hits on percussion, very quiet (v40-50), sparse.
- **One sonic world per drum kit** -- don't mix sample packs across drum racks.

### Production Workflow

- **Build section by section** -- one section solid before moving to next.
- **Stay scoped** -- only touch the section being discussed.
- **Fills as dedicated clips** -- separate from groove clips for easier editing.
- **Humanize everything**: \`timing += 0.02 * rand()\` and \`velocity += rand(-5, 5)\` on all parts.
- **v0 won't delete humanized notes** -- use transform \`PITCH: velocity = 0\` to delete all notes of a pitch regardless of timing.
`;
