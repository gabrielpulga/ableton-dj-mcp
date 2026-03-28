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
| Tech House | 124-132 | Driving, percussive, rolling basslines |
| Afro House | 118-128 | Organic percussion, polyrhythmic |
| Melodic Techno | 128-138 | Emotional leads, layered pads, progressive builds |
| Techno | 130-150 | Industrial, hypnotic, dark atmospheres |
| Psytrance | 138-148 | Psychedelic basslines, acid elements, complex rhythms |

### Genre-Specific Music Theory

**House Music (120-128 BPM)**
- Key scales: major, Mixolydian, minor pentatonic
- Chord progressions: I-IV-V, I-vi-IV-V, ii-V-I (jazz-influenced), I-iii-IV-V
- Piano/organ chords on beats 2 and 4; soulful vocals; 8-bar phrases
- Structure: intro (16) -> groove (32) -> breakdown (16) -> groove (32) -> outro (16)
- Characteristic sounds: piano chords, organ stabs, gospel vocals, TR-909/808 drums
- Reference artists: Larry Heard, Masters At Work, Dennis Ferrer
- Velocity: kick v100-127, bass v85-100, piano chords v70-90, pads v55-70
- Swing: 52-55% for warm, bouncy feel

**Indie Dance (120-128 BPM)**
- Key scales: Dorian mode, natural minor, minor pentatonic
- Chord progressions: i-VII-VI-VII, i-III-VII-IV, i-VI-III-VII
- Groovy basslines with disco influence; chopped vocal chops; live-instrument feel
- Structure: intro (8) -> build (16) -> drop (32) -> breakdown (16) -> drop (32) -> outro (8)
- Characteristic sounds: filtered disco basslines, chopped vocal chops, live-sounding hi-hats, warm pads
- Reference artists: Mall Grab, Gerd Janson, Horse Meat Disco
- Velocity: kick v100-127, bass v85-100, pads v55-70, leads v70-90
- Swing: 52-54% for loose, live feel; humanize timing aggressively

**Tech House (126-132 BPM)**
- Key scales: minor pentatonic, blues scale, Dorian
- Chord progressions: single-chord grooves with chromatic passing notes, i-IV vamps
- Long intros; groove-focused; minimal arrangement changes; DJ-friendly 8-bar phrases
- Structure: intro (32+) -> groove builds slowly; no dramatic breakdowns; outro (32+)
- Characteristic sounds: punchy kick, driving 16th-note basslines, vocal samples/chops, hypnotic loops
- Reference artists: Chris Lake, Fisher, Solardo
- Velocity: kick v110-127, bass v90-110, percussion v60-80, pads v45-65
- Swing: tight, 50-52%; groove comes from bassline syncopation not timing swing

**Melodic Techno (128-138 BPM)**
- Key scales: Phrygian, natural minor, Aeolian, Dorian
- Chord progressions: i-bVII-bVI, i-iv-bVII, sustained minor chords with melodic movement on top
- Long atmospheric intro; tension builds over 32+ bars; powerful drop; emotional breakdown; second drop
- Structure: intro (32) -> build (32) -> drop A (32) -> breakdown (32) -> build (16) -> drop B (32) -> outro (16)
- Characteristic sounds: evolving pads, portamento leads, deep kick, sub bass, reverb-heavy atmospherics
- Reference artists: ARTBAT, Massano, Kevin de Vries, Innellea
- Velocity: kick v100-127, bass v85-100, pads v55-65, leads v70-90
- Swing: tight, 50-52%; emotion comes from sound design and arrangement, not swing

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

### Velocity Reference (all genres)

| Element | Range | Notes |
|---------|-------|-------|
| Kick | v100-127 | Loudest element; four-on-the-floor at v99-110, accent on beat 1 at v120-127 |
| Snare/Clap | v90-110 | Backbeat on 2 and 4; ghost hits at v40-60 |
| Bass | v85-100 | Should sit just below kick; accent notes at v100-110 |
| Piano/Chords | v70-90 | House: on 2 and 4; lighter for melodic techno pads |
| Pads | v55-70 | Always behind bass; in sections without bass, can go to v75 |
| Leads | v70-90 | Portamento leads at v80-90; arps/plucks at v70-80 |
| Percussion (shakers, congas) | v60-80 | Groove elements; ghost hits at v30-50 |
| Hi-hats closed | v20-100 | Velocity curve IS the groove; see Drum Patterns section |
| Hi-hats open | v70-90 | Off-beats; lower velocity than closed hat accents |

### Energy Curve Guidance

**Tension builds**: Gradual velocity increase over 8-16 bars; add elements one at a time; filter opens slowly.

**Tension releases (breakdown)**: Strip to 2-3 elements; sustain long notes; reverb-heavy; silence creates anticipation.

**Peak energy drop**: Full arrangement hits at once; kick loudest in the mix; all elements enter within 1-2 bars.

**Outro/fade**: Remove elements in reverse order of intro; keep kick last; downfilter over 8-16 bars.

**Energy pacing by genre**:
- House: moderate peaks, emotional warmth; no extreme tension/release
- Indie Dance: peaks feel celebratory; breakdowns are brief and playful
- Tech House: sustained high energy; minimal breakdowns; tension through repetition and filter
- Melodic Techno: dramatic arc; deepest breakdowns; highest emotional peaks; longest builds

### Time Signatures and Groove

All covered genres use 4/4 time. 8-bar phrases are the fundamental unit. Sections are multiples of 8 bars.

**Swing/groove amounts by genre**:
- House: 52-55% swing for warm bouncy feel (classic MPC swing)
- Indie Dance: 52-54%, humanize timing aggressively for live-instrument feel
- Tech House: 50-52%, tight; groove comes from bassline syncopation, not timing swing
- Melodic Techno: 50-52%, tight; emotion from sound design and arrangement dynamics
`;
