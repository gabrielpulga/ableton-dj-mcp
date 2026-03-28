// Ableton DJ MCP - Electronic music production MCP server for Ableton Live
// Copyright (C) 2026 Gabriel Pulga
// SPDX-License-Identifier: GPL-3.0-or-later

export const productionTechniquesSkills = `

## Production Techniques

### Drums

- **Kick**: Four-on-the-floor on every beat, v99, t/2. No ghost kicks, no syncopation in driving sections. Dead simple — let everything else groove around it.
- **Snare**: Beats 2 and 4, v100-105, t1. Straight backbeat anchor. No tricks.
- **Hi-hats (velocity groove)**: Full 16th notes. Velocity curve per 16th group: v20 (downbeat) → v40 (e) → v100 (and) → v80 (a). The AND of every beat is the loudest — this IS the groove, not which notes are present or absent.
- **Open hat**: Off-beats only (1.5, 2.5, 3.5, 4.5), t/2. Classic push.
- **Two hat layers**: Layer 1 does all 16ths with the velocity curve. Layer 2 fills selectively (not every position) for added texture.
- **Snare buildup**: 16th notes for 16 bars with velocity ramp — v60 (downbeat) → v80 (e) → v90 (and) → v100 (a). Simple but effective pre-drop tension.
- **Tumbao conga (tribal/indie dance)**: 7 hits/bar, skip beat 1, start at 1.5. Ghost taps v45-65 t/8, accents v85-100 t/4. Ghost/accent alternation creates the organic feel.
- **Bongos**: Beats 1.5 and 3.5. Sparse, complements conga.
- **Each percussion element is a person** — it should have a recognizable phrase, enter with intention, and respond to other elements. Don't just fill grid positions.
- **Never guess percussion from theory** — analyze real reference tracks, learn rhythms note-by-note, then reproduce. AI-generated percussion without reference sounds mechanical.
- **One sonic world per drum kit** — don't mix sample packs across a drum rack.
- **Probability notes for organic feel** — p0.3-0.4 ghost hits, v40-50, sparse (6-10 per 16 bars).
- **Fills as dedicated clips** — separate Fill clips are easier to see and edit than notes buried in groove clips.

### Bass

- **Driving bass**: Continuous 8th notes, no gaps. Mix t/8 stabs, t/4 punches, t/2 sustains. Root notes get long sustains; passing tones get short stabs.
- **Off-beat rule (Innellea)**: Bass does NOT hit on the downbeat. First note at 1.25 (the "e" of beat 1) creates the pump against the kick. This is the #1 groove trick.
- **Two velocity levels**: Accent hits v127 (on 1.25 and 3.25), fill hits v100. Mix note lengths (t/2 and t3/4) for rhythmic interest through duration, not just timing.
- **Build complexity progressively across clips**: pure roots → one passing tone → walking bass.
- **Four-layer bass architecture (melodic techno)**: Sub/low layer (long notes), top/mid layer (same rhythm, shorter notes), acid layer (16ths, sections only), breakdown layer (sustained chords).
- **Breakdown bass**: Same chord progression as peak, but long sustained notes (t8, t16) instead of rhythm. Maximum tension from a single held note.

### Pads & Chords

- **Always chords (3+ notes)** — never single notes for pads.
- **Legato overlap**: Use long note lengths (t9 for 2-bar chords) so notes overlap slightly. Prevents rhythmic gaps.
- **Progressive reveal**: drone → fifth added → full chord. Build harmonic content over bars — don't drop full chords immediately.
- **Velocity behind bass**: When bass is playing, pads sit at v55-60. In sections without bass, pads can be louder.

### Leads

- **ARTBAT style**: 2-4 note motifs, mono mode, portamento/glide 100-150ms. Intervals of 4ths and 5ths glide best.
- **Mix long and short**: t3-t4 sustained notes + t/4 staccato. Let notes ring and breathe.
- **Sound design creates emotion** — don't write complex melodies. LFO on filter cutoff for evolving tone. Auto-pan for width.
- **Innellea lead pattern**: Low octave anchor on every beat (e.g., B0), melody notes on off-beats above (e.g., Gb2, E2, D2 on 1.5/2.5/3.5). Short t/2 notes — percussive, not washy. Ornamental runs (fast 3/8 descending fragments) for variation.
- **Tease before entering** — hint at the lead 2-4 bars before it fully arrives. Enter late. One lead is enough; two layers overcomplicates.

### Plucks & Arps

- **Use 2-note dyads (root+fifth)**, not single notes — single-note arps sound robotic.
- **Repeat anchor chord** multiple times per bar for hypnotic feel. One contrast chord for movement.
- **Pluck arp (Innellea)**: Chord tones cycling every 16th note (e.g., B2→E3→Gb3→B3 on 1, 1.25, 1.5, 1.75). Velocity-shaped: root v94 (loud), 3rd v45 (soft), 5th v59 (medium), octave v72 (strong). All t/8 (32nd notes) — very short and percussive.
- **Blend into the groove** — pluck should not stand out as a separate melody.

### Arrangement & Energy

- **Build section by section** — finish one section before moving to the next.
- **Tease new elements** 2-4 bars before they fully arrive: 1 hit → 2 hits → 3 hits → full pattern. Same sound/chord as the full version, just sparse and quiet.
- **Breathing room after breakdowns** — leave 2-4 bars of silence before the drop. The silence IS the transition. A pause after an atmospheric breakdown makes the peak hit harder than any fill.
- **Absence creates power** — remove a distinctive element for a long stretch, then bring it back for maximum impact.
- **Dedicated clips per section** — don't edit the entire arrangement at once. One section at a time.
- **Arrangement template (melodic techno)**:
  - Intro (8-16 bars): percussion + atmosphere, no kick, filtered textures
  - Build A (16 bars): kick enters, bass sneaks in, groove establishes gradually
  - Main A (32 bars): full groove, hypnotic loop
  - Breakdown (16 bars): strip to pads + sustained bass, no drums
  - Build B (16 bars): snare 16th buildup, riser
  - Main B / Peak (32 bars): everything returns, lead pushes harder
  - Outro (16 bars): gradual strip-down

### FX & Transitions

- **Risers**: end at the target bar (so the peak lands on the downbeat).
- **Downfilters**: start at the target bar (sweep begins on the section boundary).
- **Impacts**: placed on the exact beat — surgical, rare (2 per track max).
- **Upfilter before, downfilter after**: upfilter 4 bars before boundary, downfilter on boundary.
- **Tonal riser**: single placement 8 bars before the main drop.
- **Smooth FX trails**: Simple Delay on FX track (~30% wet) + clip fade-out. Both together = professional transition sound.
- **Resample FX tails**: Solo FX track, record output (Input: Resampling), crop interesting section, drag into drum rack pad. Use as rhythmic call-and-response: 2-bar long notes (t1) on strong beats → short stabs (t/4) response → 2 bars silence. This turns one-shot FX into a signature groove element unique to the track.

### Humanization

- Apply to everything: \`timing += 0.02 * rand()\`, \`velocity += rand(-5, 5)\`.
- To delete humanized notes by pitch: use transform \`PITCH: velocity = 0\` — do not use v0 at exact positions (misses randomized-timing notes).

### Workflow Rules

- **Stay scoped** — only touch the section being discussed. No side-effect changes to other sections.
- **Use update-clip merge mode** to add elements to existing clips. Creating new clips at the same position replaces them.
- **Don't iterate on a broken foundation** — if a rhythm isn't working, stop adding complexity. Step back, understand the problem, or find a reference.
- **Check track ownership before writing** — drum racks on different tracks have different mappings. C1 on Track 0 might be kick; C1 on Track 1 might be closed hat. Always verify.
- **Update knowledge on every breakthrough** — capture lessons immediately, don't let them accumulate.
`;
