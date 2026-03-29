# Tools Reference

Quick reference for all 21 `adj-*` tools. Read the `.def.ts` files for the full
Zod schemas.

---

## Workflow

### `adj-connect`

Connect to Ableton Live. Call this first before any other tool. No parameters.

### `adj-context`

Read and write a persistent memory string visible to the AI across tool calls.
Useful for storing project state, musical decisions, or notes.

- `read` — return current context
- `write` — overwrite context with new content
- `append` — add to existing context

### `adj-read-samples`

List audio samples available in the configured sample folder. Returns a tree of
files with metadata. Set `sampleFolder` in config first.

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

Load a device onto a track by name.

- `deviceName` — Ableton native device name (see `src/tools/constants.ts`)
- `path` — `"trackIndex/deviceIndex"` where to insert

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

Control transport and clip playback.

- `action`: `"play"` | `"stop"` | `"continue"` | `"tap-tempo"` |
  `"launch-scene"` | `"fire-clip"` | `"stop-clip"`

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
