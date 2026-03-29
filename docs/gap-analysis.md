# Gap Analysis — Ableton DJ MCP

Competitive analysis against 5 projects: ableton-mcp, ableton-mcp-extended,
LivePilot, remix-mcp (Rust/OSC), talkback-mcp.

Last updated: 2026-03-29

---

## What We Have That Competitors Don't

Before the gaps — our actual differentiators:

- **bar|beat MIDI notation** — `17|1 v100 t/4 C3` — more expressive and readable
  than beat-float format used by everyone else
- **Transform expressions** — velocity/pitch/timing waveforms applied across
  note sets in one call
- **Code execution** — JS function against notes array (ENABLE_CODE_EXEC); no
  competitor has this
- **Skills/context injection** — genre theory, drum patterns, production
  techniques injected as AI knowledge; nobody else does this
- **Max for Live bridge** — tighter Live API access than Python remote scripts
- **Warp markers** — add/move/remove on audio clips
- **Rack macro variations + AB compare** — nobody else exposes these
- **Drum pad mapping read** — read drum rack pitch assignments before writing
  notes
- **Locator management** — full create/delete/rename/jump (by ID or name)
- **Audio clip properties** — gain (dB), pitch shift (semitones), warp mode,
  warping on/off
- **routeToSource** — MIDI layering/polyrhythm workflow

---

## Gap 1: Ableton Browser API

**What it is:** Browse Ableton's built-in instrument, effect, sample, and drum
kit library. Navigate by category path, get loadable items with their URIs, load
by URI.

**Who has it:** ableton-mcp, ableton-mcp-extended, LivePilot (4 tools:
`get_browser_tree`, `get_browser_items`, `search_browser`, `load_browser_item`)

**What we have:** `adj-create-device` creates native Live devices by hardcoded
name. Cannot browse, cannot load third-party plugins or samples from the
browser, cannot discover what's available.

**Why add it:**

- AI can't discover available instruments/effects without knowing names in
  advance
- Can't load samples or drum kits by browsing — requires absolute file paths
- Competitors use it to let AI find and load the right tool for the job
- LivePilot pairs it with a 10,600-line "device atlas" — browse + semantic
  selection

**Pros:**

- Transforms AI from "create what I name" to "find and load the right thing"
- Enables drum kit loading workflows
- Unblocks sample-based composition

**Cons:**

- Live's browser API is slow and can block the UI thread
- Browser tree can be very large — need depth limits and pagination
- URIs are session-specific, not fully portable across machines

**Complexity:** Medium. Browser API is available in Max for Live. Need to expose
it, build tree traversal with depth limits, and add a load-by-URI path.

**Suggested tools:**

- `adj-browse` — explore browser tree by path, return items with URIs
- Extend `adj-create-device` to accept a `browserUri` param for loading

---

## Gap 2: Clip Automation Envelopes

**What it is:** Read and write automation data inside clips (session clip
envelopes and arrangement automation lanes). Create envelope points, clear
envelopes, apply curves.

**Who has it:** ableton-mcp-extended (`manage-clip-automation`), LivePilot (8
tools including `apply_automation_shape`, `apply_automation_recipe`,
`generate_automation_curve`, `analyze_for_automation`)

**What we have:** None. We can set device parameters at a point in time but
cannot write automation curves into clips or arrangement lanes.

**Why add it:**

- Automation is fundamental to electronic music — filter sweeps, volume rides,
  effect throws
- Without it, AI can describe a filter sweep but cannot write one
- LivePilot has 16 named curve shapes and 15 named production recipes (filter
  sweep, dub throw, sidechain pump, vinyl crackle, tape stop, washout, etc.)
- This is a very high-leverage feature: one call can write 32 bars of filter
  automation

**Pros:**

- Enables full production workflows — not just notes but movement
- Named recipes (filter_sweep_up, dub_throw) make AI prompting very natural
- Covers a major gap that every competitor has addressed

**Cons:**

- Live's automation API is more complex than note writing
- Need to handle both session clip envelopes and arrangement automation lanes
- Parameter path resolution (which device, which parameter) adds complexity

**Complexity:** High. Requires new Live API surface, parameter path resolution,
envelope point CRUD, and curve math for shaped automation.

**Suggested tools:**

- `adj-automate` — write automation to a clip envelope or arrangement lane
  - Params: clipId/trackId, devicePath, paramName, points (time+value pairs),
    shape (linear/exponential/sine/etc.), or recipe name

---

## Gap 3: Music Theory Analysis Engine

**What it is:** Analyze MIDI clips for key/scale/mode, detect chord progressions
with Roman numerals, suggest next chords, detect voice-leading issues, harmonize
melodies, generate countermelodies.

**Who has it:** LivePilot (11 tools across Theory + Harmony domains, including
neo-Riemannian Tonnetz navigation and voice-leading path finding between triads)

**What we have:** Skills injection teaches the AI theory but we have no tools to
analyze existing clips or generate theory-derived suggestions.

**Why add it:**

- AI currently guesses key/scale from context — this would read it from actual
  MIDI
- Chord suggestions grounded in what's in the clip (not generic advice)
- Complements our genre skills perfectly — skills teach production patterns,
  tools analyze what was produced

**Pros:**

- High value for melodic/harmonic composition assistance
- Pure computation — no Live API needed for most operations
- Differentiates from purely technical tools (play, record, place clips)

**Cons:**

- LivePilot already has a very complete implementation — hard to differentiate
- Complex to implement correctly (Krumhansl-Schmuckler key detection, voice
  leading rules)
- May overlap with what a capable LLM already does in-context

**Complexity:** Medium-High. Pure TypeScript, no Live API, but music theory
algorithms are non-trivial to implement correctly.

**Suggested tools:**

- `adj-analyze-harmony` — detect key/scale/mode from clip MIDI data
- `adj-suggest-chords` — suggest next chord given current progression and style

---

## Gap 4: Generative Composition Algorithms

**What it is:** Algorithmic note generation: Euclidean rhythms (Bjorklund
algorithm), polyrhythm layering, tintinnabuli voice generation (Arvo Pärt),
Steve Reich phase shifting, Philip Glass additive process.

**Who has it:** LivePilot (5 tools in Generative domain)

**What we have:** Notes must be written explicitly or via JS code execution. No
built-in generation algorithms.

**Why add it:**

- Euclidean rhythms are the go-to algorithm for electronic music percussion —
  tresillo, cinquillo, and most genre-defining drum patterns are Euclidean
- Phase shifting and additive processes are directly relevant to techno and
  minimal music
- These are well-understood algorithms that produce high-quality results
  instantly
- Our bar|beat notation + transform system would pair exceptionally well with
  generated patterns

**Pros:**

- Euclidean rhythms alone are very high value for our target genres
- Clean, deterministic algorithms — easy to test and reason about
- Could be integrated as transforms or as standalone generation tools

**Cons:**

- LivePilot already has these — not novel
- Tintinnabuli and phase shift are niche (Pärt-style composition, Reich
  minimalism)
- Code execution (ENABLE_CODE_EXEC) already lets advanced users do this

**Complexity:** Low-Medium. Bjorklund is a simple algorithm. Pure TypeScript, no
Live API. Could be part of transform expressions or a new `adj-generate` tool.

**Suggested tools:**

- `adj-generate` — generate a note pattern from an algorithm
  - Algorithms: `euclidean`, `phase-shift`, `additive`
  - Returns notes in our bar|beat format, ready to pass to `adj-create-clip`

---

## Gap 5: Real-Time Spectral Analysis

**What it is:** While the session is playing, capture FFT data from the master
bus or individual tracks. Returns band-level peak/RMS (sub-bass, bass, low-mids,
mids, etc.) and human-readable interpretation.

**Who has it:** talkback-mcp (`get_spectral_snapshot`), LivePilot (M4L analyzer
with full FluCoMa integration: 7 spectral descriptors, 40-band mel spectrum,
12-band chroma, onset detection, EBU R128 LUFS)

**What we have:** We read device parameters. We cannot read the audio signal.

**Why add it:**

- Creates a perception-action loop: AI can hear what it's making, not just what
  it programmed
- Catches masking, resonances, and frequency buildup that don't show up in
  device parameters
- LivePilot uses spectral data to drive `analyze_for_automation` — read what's
  playing, suggest what to automate
- Talkback uses it for mix heuristics (headroom, dynamics, frequency buildup)

**Pros:**

- Genuinely novel capability — bridges programming and listening
- Enables mixing feedback loops and dynamic suggestions
- High production value feature

**Cons:**

- Requires M4L analyzer device to do FFT analysis — not available via Remote
  Script API alone
- Adds a second required M4L device (we already have one)
- Only works while transport is playing
- FluCoMa library (LivePilot's approach) is a large dependency

**Complexity:** High. Requires building or integrating an M4L analyzer device,
OSC/WebSocket streaming pipeline, and server-side cache. Significant
infrastructure change.

---

## Gap 6: Track Freeze / Flatten

**What it is:** Freeze a track (render device chain to hidden audio, freeing
CPU), check freeze status, flatten (commit frozen audio, remove devices).

**Who has it:** LivePilot (`freeze_track`, `flatten_track`, `get_freeze_status`)

**What we have:** None.

**Why add it:**

- Common workflow in complex sessions — freeze CPU-heavy synths during
  arrangement work
- Flatten is destructive but useful for printing effects permanently
- Simple Live API calls — low effort, clear value

**Pros:**

- Common workflow, AI-assistable ("freeze all synth tracks")
- Simple implementation

**Cons:**

- Freeze is async in Live — need polling or callback to confirm completion
- Flatten is irreversible — should surface that clearly

**Complexity:** Low. Straightforward Live API calls. Async status polling adds
minor complexity.

**Suggested addition:** Extend `adj-update-track` with `freeze` (bool) and
`flatten` (bool) params.

---

## Gap 7: Mixer Metering

**What it is:** Read real-time peak/RMS meter levels for individual tracks and
the master bus.

**Who has it:** LivePilot (`get_track_meters`, `get_master_meters`,
`get_mix_snapshot`), talkback-mcp (push-based via M4L WebSocket)

**What we have:** We can read track volume/pan settings but not live meter
levels.

**Why add it:**

- AI can reason about levels without needing spectral analysis
- "Which tracks are clipping?" is an answerable question with metering
- `get_mix_snapshot` (LivePilot) returns all tracks + levels in one call —
  useful for mix overviews

**Pros:**

- Low complexity relative to spectral analysis
- Useful for mixing workflows

**Cons:**

- Meter values are instantaneous — need to be called at the right moment
- Live's metering API may not be available via our current M4L bridge

**Complexity:** Low-Medium. Depends on whether our M4L device can access
peak_meter_level.

---

## Gap 8: MIDI File Import / Export

**What it is:** Export a clip's notes as a standard .mid file. Import a .mid
file into a clip.

**Who has it:** LivePilot (`export_clip_midi`, `import_midi_to_clip`,
`analyze_midi_file`)

**What we have:** None. Notes must be written via our bar|beat notation or code
execution.

**Why add it:**

- Enables round-tripping MIDI with external tools (notation software, DAWs, MIDI
  editors)
- Import allows using existing MIDI files as starting points
- `analyze_midi_file` (LivePilot) enables AI to inspect any MIDI file without
  loading it into Live

**Pros:**

- Useful for producers who work with MIDI from other sources
- Standard format — well-understood

**Cons:**

- File I/O requires filesystem access on the Live machine
- Security consideration: arbitrary file path access
- Lower priority than core production features

**Complexity:** Medium. Needs MIDI parsing library and filesystem access
coordination.

---

## Gap 9: Technique / Pattern Memory

**What it is:** Persistent cross-session memory store for production techniques.
Save beat patterns, device chains, mix templates, browser pins. Recall by
semantic query (mood, genre, texture). Replay generates step-by-step
instructions.

**Who has it:** LivePilot (8 tools: `memory_learn`, `memory_recall`,
`memory_get`, `memory_replay`, etc. — typed categories, semantic recall, stored
in `~/.livepilot/memory/techniques.json`)

**What we have:** Our Skills system injects curated genre knowledge at session
start, but no persistent user-specific memory.

**Why add it:**

- Producers build up personal libraries of sounds and techniques over time
- "Use my standard melodic techno drum chain" is a natural prompt
- Complements our genre skills — skills are editorial, memory is personal
- Replay plans make saved techniques actionable, not just descriptive

**Pros:**

- High value for power users over time
- Differentiates from one-shot tools — compounds value across sessions
- Our existing skills architecture could serve as the foundation

**Cons:**

- Complex to implement well — semantic recall needs more than string matching
- Replay plans require knowing the current state of Live
- LivePilot already has this — less differentiation opportunity

**Complexity:** Medium. JSON store is straightforward. Semantic recall and
replay plan generation add complexity.

---

## Gap 10: Ableton Link Control

**What it is:** Enable/disable Ableton Link (tempo sync over network), force a
specific beat time, nudge tempo up/down for beat matching.

**Who has it:** remix-mcp (`get/set_link_enabled`, `force_link_beat_time`,
`nudge_up`, `nudge_down`)

**What we have:** None. We set tempo via `adj-update-live-set` but have no Link
control.

**Why add it:**

- Link is the standard protocol for syncing Ableton with other software/hardware
  over a local network
- Nudge is specifically useful for DJ-style beat matching
- Directly relevant to the DJ/live performance use case of this project

**Pros:**

- Low complexity — Live API property set
- High relevance to our project's DJ focus
- No competitor has this paired with production tools

**Cons:**

- Niche — only matters when using Link

**Complexity:** Very low.

**Suggested addition:** Add `link` (bool) and `nudge` ("up" | "down") to
`adj-playback` or `adj-update-live-set`.

---

## Gap 11: Capture MIDI

**What it is:** Trigger Live's "Capture MIDI" feature — retroactively captures
notes you just played from Live's MIDI buffer, even before you hit record. Also
`capture_and_insert_scene` — captures all currently playing clips and creates a
new scene.

**Who has it:** remix-mcp, LivePilot

**What we have:** None.

**Why add it:**

- Classic Live workflow: play something without recording, then hit capture
- `capture_and_insert_scene` is useful for freezing a live jam state
- Zero complexity on the API side — single command

**Pros:** Simple, high value for live/jam workflows. **Cons:** Requires MIDI
input to be routed to Live in the first place.

**Complexity:** Very low.

**Suggested addition:** Add `capture-midi` and `capture-scene` actions to
`adj-playback`.

---

## Gap 12: Global Groove Amount

**What it is:** Get and set the global groove amount (0-1 or percentage) — how
strongly Live applies the groove pool to all clips.

**Who has it:** remix-mcp (`get/set_groove_amount`)

**What we have:** None. Time signature and scale are settable but not groove.

**Why add it:**

- Groove is central to the feel of electronic music — directly relevant to our
  genre focus
- One knob that affects the entire session's swing feel
- Natural pairing with our genre skills that already reference swing amounts
  (e.g., House 52-55%)

**Pros:** Very low effort, high relevance to our use case. **Cons:** None
significant.

**Complexity:** Very low.

**Suggested addition:** Add `groove` param to `adj-update-live-set`.

---

## Gap 13: MIDI CC Mapping

**What it is:** Programmatically map a MIDI CC number from a specific
channel/device to a device parameter in Live. Set up hardware controller
mappings via API.

**Who has it:** remix-mcp (`map_midi_cc`)

**What we have:** None.

**Why add it:**

- Lets AI set up a hardware controller layout for a session automatically
- "Map the filter cutoff on the bass synth to CC 74 on channel 1" is a natural
  prompt
- Unique capability — no other competitor exposes this

**Pros:** Novel, useful for live performance setup. **Cons:** Complex mapping
management, MIDI learn mode interaction.

**Complexity:** Medium.

---

## Gap 14: Track I/O Routing Read/Write

**What it is:** Read a track's input and output routing type, channel, and all
available routing options. Set routing by name.

**Who has it:** remix-mcp (full routing introspection + set), LivePilot
(`get_track_routing`, `set_track_routing`)

**What we have:** `adj-read-track` with `routings` and `available-routings`
include options for reading. `adj-update-track` has `arrangementStart` but
routing set is unclear — verify before implementing.

**Why add it:** Needed for external synth routing, track-to-track routing,
resampling setups.

**Complexity:** Low if routing write is the only gap.

---

## Gap 16: Punch In/Out + Arrangement Overdub

**What it is:** Set punch in/out markers for punched recording (only records
between markers). Enable arrangement overdub mode (layer over existing clips).

**Who has it:** remix-mcp (`get/set_punch_in`, `get/set_punch_out`,
`get/set_arrangement_overdub`)

**What we have:** None.

**Why add it:** Standard recording workflows. Punch recording is common when
fixing specific sections.

**Pros:** Simple API calls. **Cons:** Niche — recording workflows are less
central to AI-assisted production.

**Complexity:** Very low.

**Suggested addition:** Add `punchIn`, `punchOut`, `overdub` params to
`adj-update-live-set` or `adj-playback`.

---

## Gap 17: Granular Clip Properties

**What it is:** Several per-clip properties that aren't currently exposed:

- `clip_legato` — legato playback mode (clip keeps playing when launched during
  playback)
- `clip_ram_mode` — load audio into RAM fully (for clips where sample seeks are
  causing glitches)
- `clip_velocity_amount` — scale all note velocities by a factor
- `clip_pitch_fine` — fine pitch in cents (we have coarse semitones; this adds
  sub-semitone control)
- `clip_playing_position` — current playhead position within the clip
  (read-only)
- `clip_file_path` — source audio file path (read-only)
- `duplicate_clip_loop` — double clip loop length in-place (standard Live
  "Duplicate Loop" operation)
- `clip_muted` — mute individual clips (distinct from track mute)

**Who has it:** remix-mcp has all of these.

**What we have:** We have coarse pitch, warp, gain, looping, loop region.
Missing: fine pitch, legato, RAM mode, velocity amount, playing position read,
duplicate loop.

**Why add it:** Fine pitch and velocity amount are genuinely useful production
tools. Duplicate loop is a common Live workflow. The rest are lower priority.

**Complexity:** Low — most are single property reads/writes.

**Suggested addition:** Extend `adj-update-clip` with `pitchFine`, `legato`,
`ramMode`, `velocityAmount`. Add `duplicate-loop` action. Add `playingPosition`
to `adj-read-clip`.

---

## Gap 18: Track Group Fold

**What it is:** Fold/unfold group tracks (collapse the group in the track list).
Query whether a track is foldable, grouped, or visible.

**Who has it:** remix-mcp (`get/set_track_fold_state`, `is_track_foldable`,
`is_track_grouped`, `is_track_visible`)

**What we have:** None.

**Why add it:** Useful for navigating complex sessions with many group tracks.
AI can fold groups it's not working on.

**Complexity:** Very low.

**Suggested addition:** Add `folded` param to `adj-update-track`.

---

## Gap 19: Bulk Device Parameter Set

**What it is:** Set all parameters of a device in a single call — equivalent to
loading a preset snapshot. Also: query the human-readable display value of a
parameter (e.g., "440 Hz" instead of 0.47).

**Who has it:** remix-mcp (`set_all_device_parameters`,
`get_parameter_value_string`), LivePilot (M4L `get_display_values`)

**What we have:** `adj-update-device` with `params: name=value per line` already
handles bulk writes. `get_parameter_value_string` (display values) may be a gap
— verify.

**Why add it:** Display values (human-readable) are useful for confirming what
was set. Verify if our read-device already returns them.

**Complexity:** Low if display values are the only gap.

---

## Gap 15: `back_to_arranger` / Record

**What it is:** `back_to_arranger` dismisses session view override (red "Back to
Arrangement" button in Live). `start_recording` / `stop_recording` arm
arrangement recording.

**Who has it:** LivePilot, ableton-mcp-extended

**What we have:** Playback control but no `back_to_arranger` and no arrangement
recording arm.

**Why add it:**

- Very common action when working with arrangement — session clips override
  arrangement until dismissed
- Recording arm is needed for capture-based workflows

**Pros:**

- Simple Live API call
- Fills a genuine workflow gap

**Cons:**

- Minor — low priority on its own

**Complexity:** Very low. Single Live API property set.

**Suggested addition:** Add `back-to-arranger` and `record` actions to
`adj-playback`.

---

## Priority Summary

| #   | Gap                                                                            | Priority | Complexity  | Notes                                                      |
| --- | ------------------------------------------------------------------------------ | -------- | ----------- | ---------------------------------------------------------- |
| 1   | Clip Automation Envelopes                                                      | HIGH     | High        | Core production workflow; every competitor has it          |
| 2   | Browser API                                                                    | HIGH     | Medium      | Enables instrument/sample discovery; blocks many workflows |
| 3   | Global Groove Amount                                                           | HIGH     | Very Low    | One param, directly relevant to our genre focus            |
| 4   | back_to_arranger + Capture MIDI + Record                                       | HIGH     | Very Low    | Multiple workflow completions, minimal effort              |
| 5   | Granular Clip Properties (fine pitch, legato, velocity amount, duplicate loop) | HIGH     | Low         | Easy wins, useful production tools                         |
| 6   | Track Freeze / Flatten                                                         | MEDIUM   | Low         | Common CPU workflow; easy win                              |
| 7   | Ableton Link + Nudge                                                           | MEDIUM   | Very Low    | DJ/live focus — on-brand for this project                  |
| 8   | Punch In/Out + Overdub                                                         | MEDIUM   | Very Low    | Standard recording modes                                   |
| 9   | Track Group Fold                                                               | MEDIUM   | Very Low    | Session navigation for complex projects                    |
| 10  | Euclidean / Generative Tools                                                   | MEDIUM   | Low-Medium  | High value for techno/house drum patterns                  |
| 11  | Music Theory Analysis                                                          | MEDIUM   | Medium-High | Complements skills; complex to do well                     |
| 12  | Mixer Metering                                                                 | LOW      | Low-Medium  | Useful but less critical than production features          |
| 13  | MIDI CC Mapping                                                                | LOW      | Medium      | Novel; useful for live setup; not urgent                   |
| 14  | Real-Time Spectral Analysis                                                    | LOW      | High        | Powerful but significant infrastructure cost               |
| 15  | MIDI File Import/Export                                                        | LOW      | Medium      | Niche; lower production priority                           |
| 16  | Technique Memory                                                               | LOW      | Medium      | High long-term value; lower immediate priority             |

---

## What We Should NOT Copy

- **Raw beat-float note format** — our bar|beat notation is better
- **Python remote script architecture** — our Max for Live bridge is tighter
- **Static system prompt injection** (talkback approach) — our Skills tool is
  more flexible
- **ElevenLabs voice integration** (ableton-mcp-extended) — out of scope
