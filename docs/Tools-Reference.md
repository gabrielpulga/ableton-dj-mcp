# Tools Reference

Canonical catalog of all 23 `adj-*` tools. Other docs link here instead of
duplicating. Read the `.def.ts` files for the full Zod schemas.

---

## Workflow

### `adj-connect`

Connect to Ableton Live. Call this first before any other tool. No parameters.

### `adj-context`

Read and write a persistent memory string visible to the AI across tool calls.
Useful for storing project state, musical decisions, or notes. Also browses the
configured sample folder.

- `read` — return current context
- `write` — overwrite context with new content
- `append` — add to existing context
- `search` — list audio samples in the configured `sampleFolder` (set in config)
  as a tree with metadata

---

## Live Set

### `adj-read-live-set`

Read the current Live Set overview: name, tempo, time signature, tracks, scenes.

- `include: ["tracks", "scenes", "locators"]` for details

### `adj-update-live-set`

Update Live Set properties: tempo, time signature, name, locators.

---

## Track

### `adj-read-track`

Read track properties: name, color, routing, mute/solo/arm state.

- `include: ["session-clips", "arrangement-clips", "devices", "routings"]`
- `trackIndex` — zero-based track index

### `adj-create-track`

Create a new MIDI, audio, or return track.

- `type`: `"midi"` | `"audio"` | `"return"`
- `trackIndex` — where to insert (defaults to end)

### `adj-update-track`

Update track properties: name, color, volume, pan, mute, solo, arm, routing.

---

## Scene

### `adj-read-scene`

Read scene properties: name, color, tempo, time signature.

- `sceneIndex` — zero-based

### `adj-create-scene`

Create a new scene at a given index.

### `adj-update-scene`

Update scene name, color, or launch it.

---

## Clip

### `adj-read-clip`

Read clip content and properties.

- Session clip: `slot: "trackIndex/sceneIndex"` (e.g., `"0/3"`)
- Arrangement clip: `trackIndex` + `arrangementStart`
- `include: ["notes", "timing", "sample", "warp"]` for details

### `adj-create-clip`

Create MIDI or audio clips.

- Session: `slot: "0/0"` or multiple `"0/0,0/2"`
- Arrangement: `trackIndex` + `arrangementStart` (bar|beat format: `"5|1"`)
- MIDI notes: barbeat notation string (see `docs/specs/BarBeat-Spec.md`)
- Audio: `sampleFile: "/absolute/path/to/sample.wav"`

### `adj-update-clip`

Update existing clip content or properties.

- Add/remove/transform notes via barbeat notation
- Update name, color, loop settings, volume, pitch
- Transform expressions: `velocity *= 0.8`, `pitch += 12`

---

## Device

### `adj-read-device`

Read device parameters and chain structure.

- `devicePath` — path like `"0/0"` (track/device) or `"0/0/chain/0/0"` for rack
  chains
- `include: ["params", "chains", "drum-map", "drum-pads"]`

### `adj-create-device`

Load a device onto a track by name, or by browser URI (via the bridge).

- `deviceName` — Ableton native device name (see `src/tools/constants.ts`)
- `path` — `"trackIndex/deviceIndex"` where to insert
- `browserUri` — load the exact item from `adj-browse` (e.g., a specific preset
  or User Library file). Pair with `deviceName: "Drum Rack"` to insert a rack
  and load a kit into it in one call. Requires the Live Browser Bridge — install
  with `npm run install:bridge`.

### `adj-browse`

Walk Ableton Live's library tree and return loadable items with their stable
browser URIs. Use the URIs with `adj-create-device --browserUri` to load.

- `category` — one of `instruments`, `audio_effects`, `midi_effects`, `drums`,
  `sounds`, `samples`, `clips`, `current_project`, `user_library`, `packs`,
  `plugins`, `max_for_live` (omit to list available categories)
- `path` — slash-separated names walked under the category root (e.g.,
  `"Synths/Operator"`)
- `search` — case-insensitive substring filter applied to children
- `depth` — child levels to expand inline (default 1, max 3)
- `limit` — top-level items to return (default 100, max 500)

Requires the Live Browser Bridge Python sidecar — install with
`npm run install:bridge`, then enable **AbletonDjMcp** under Live's Preferences
→ Link/Tempo/MIDI → Control Surface. The bridge is the only path to
`Application.Browser`; Max-for-Live JavaScript cannot reach it. See
`docs/specs/Browser-Bridge-Spec.md` and
`docs/findings/dev/m4l-no-browser-api.md`.

### `adj-update-device`

Update device parameters by name or index.

- `params: [{ name: "Cutoff", value: 0.7 }]`
- Supports chain path for rack devices

---

## Operations

### `adj-delete`

Delete a track, scene, clip, or device.

- `type`: `"track"` | `"scene"` | `"clip"` | `"device"`
- Pass the appropriate index/path

### `adj-duplicate`

Duplicate a track, scene, clip, or device.

- Same `type` options as delete
- Optional `targetIndex` for where to place the copy

---

## Control

### `adj-select`

Select tracks, scenes, or clips in Live's UI.

- Useful for directing user attention or preparing for operations

### `adj-playback`

Control transport, session clips, and Live set history.

- `action`:
  - `"play-arrangement"` — play from `startTime`
  - `"update-arrangement"` — modify loop (`loop`, `loopStart`, `loopEnd`)
  - `"play-scene"` — fire all clips in a scene (`sceneIndex`)
  - `"play-session-clips"` — fire clip(s) by `ids` or `slots`
  - `"stop-session-clips"` — stop clip(s) by `ids` or `slots`
  - `"stop-all-session-clips"` — stop every session clip
  - `"stop"` — stop transport
  - `"undo"` — undo last Live set action
  - `"redo"` — redo last undone action
  - `"save"` — save Live set to disk
  - `"back-to-arranger"` — clear session override so arrangement resumes
  - `"capture-midi"` — capture buffered MIDI into a clip retroactively
  - `"capture-scene"` — snapshot playing session clips into a new scene
  - `"record"` — toggle arrangement record mode
  - `"re-enable-automation"` — re-engage automation overridden by manual edits
- Response includes `playing`, `currentTime`, optional `arrangementLoop`.
- For `"undo"` / `"redo"` / `"save"`, response also includes `canUndo` and
  `canRedo` booleans — check these before calling undo/redo to avoid no-ops.
- For `"record"`, response includes `recording: boolean` reflecting the new
  record-mode state.

---

## Generative

### `adj-generate`

Generate algorithmic note patterns. Returns notes in bar|beat notation that plug
directly into `adj-create-clip`'s `notes` param. Pure computation, no Live API
calls.

- `algorithm`: `"euclidean"` — Bjorklund even-distribution of pulses
- `pattern` — named pattern overriding `steps` / `pulses` / `rotation`
  (tresillo, cinquillo, etc.)
- `pitch`, `steps`, `pulses`, `rotation`, `bars`, `velocity`, `duration`

---

## Dev-only

### `adj-raw-live-api` _(requires `ENABLE_RAW_LIVE_API=true`)_

Execute raw Live API calls. For debugging and exploration only.

---

## Common patterns

### Session vs Arrangement

Session clips use `slot: "trackIndex/sceneIndex"`. Arrangement clips use
`trackIndex` + `arrangementStart` (bar|beat string).

### Bar|beat positions

Format: `"bar|beat"` where beat is 1-based.

- `"1|1"` = start of bar 1
- `"5|3"` = bar 5, beat 3
- `"17|1.5"` = bar 17, beat 1.5

### Note notation (barbeat)

See `docs/specs/BarBeat-Spec.md` for the full grammar. Quick examples:

```
C4:t/8         # C4, eighth note
C4:t/4 E4 G4   # C major chord, quarter notes
@2=            # repeat previous bar 2 times
```

### Read tool include system

All read tools return minimal data by default. Pass `include` to add details.
See `docs/contributing/Read-Tool-Includes.md` for the full include options per
tool.
