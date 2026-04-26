# AI Instructions — Music Workspace

This file is loaded by your AI assistant when you start a session inside this
`workspace/` directory. Its purpose is to ground the assistant in your music
production context and tools.

This file is **AI-agnostic** — works with Claude (Code or Desktop), ChatGPT,
Cursor, or any MCP-compatible client.

## What this workspace is

Your personal music context, gitignored, alongside the Ableton DJ MCP tooling.
Holds:

- `projects/` — active songs you're working on
- `genres/` — genre-specific production patterns you've distilled
- `techniques/` — cross-genre techniques and reference notes

Edit freely. Nothing here is pushed to the public repo.

## How to use during a music session

When starting a session for music work, point your AI client at this directory
(`workspace/`), not the repo root. Reasons:

- Loads music-first context, not dev/code context
- Project trackers in `projects/<name>/<name>.md` tell the AI where you left off
- `genres/` and `techniques/` give the AI lookup paths for production knowledge

The MCP server (`adj-*` tools) is registered globally with your AI client, so
all tools are available regardless of where you cd from.

## MCP tools available

The Ableton DJ MCP server exposes 22 tools, all prefixed `adj-`. Quick reference
(full reference: `../docs/Tools-Reference.md`):

| Domain     | Tools                                                       |
| ---------- | ----------------------------------------------------------- |
| Workflow   | `adj-connect`, `adj-context`, `adj-read-samples`            |
| Live Set   | `adj-read-live-set`, `adj-update-live-set`                  |
| Track      | `adj-read-track`, `adj-create-track`, `adj-update-track`    |
| Scene      | `adj-read-scene`, `adj-create-scene`, `adj-update-scene`    |
| Clip       | `adj-read-clip`, `adj-create-clip`, `adj-update-clip`       |
| Device     | `adj-read-device`, `adj-create-device`, `adj-update-device` |
| Operations | `adj-delete`, `adj-duplicate`                               |
| Control    | `adj-select`, `adj-playback`                                |
| Generative | `adj-generate` (Euclidean rhythms, no Live API)             |

Always start a music session with `adj-connect` to verify the device is running
and check the current Live Set state.

## Working conventions

### Notation

- Bar|beat positions: `17|1` = bar 17, beat 1 (1-indexed)
- Durations: `t/4` = quarter note, `t1/8` = eighth, `t2:0` = 2 bars
- Notes: pitch BEFORE time position. `v100 t/8 C3 1|1,2.5,4` is correct.
  `1|1 v100 t/8 C3` silently drops the first note.

### Production guidance

When generating clips:

- Read existing tracks first (`adj-read-track include=devices,drum-map`) before
  assuming what's there
- Drum kits differ across tracks — never assume General MIDI mapping
- For audible test sounds, use a synth instrument (Operator, Drift). Empty Drum
  Racks produce silence.
- For sub-bass test pitches, use C3 not C1 (C1 = 32.7 Hz, hard to hear on most
  speakers)

### Project tracking

Each project in `projects/<name>/` should have `<name>.md` summarizing:

- Genre + BPM + key
- Current section being worked on
- Open decisions (sound choices, arrangement questions)
- Last session's progress

Keep it short. The file is the AI's memory of your project.

## Customize this file

Replace this section with your own preferences. Examples:

- Default genre and BPM for new projects
- Preferred reference artists
- House style rules ("always start drums with kick + open hat, then bass")
- Tools you want the AI to avoid (`adj-raw-live-api` is dev-only)

The AI reads this top-to-bottom. Anything you add here becomes part of every
session in this workspace.
