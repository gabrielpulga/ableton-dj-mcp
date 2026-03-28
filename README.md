# Ableton DJ MCP

[![CI](https://github.com/gabrielpulga/ableton-dj-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrielpulga/ableton-dj-mcp/actions/workflows/ci.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](./LICENSE)

MCP server for AI-assisted electronic music production in Ableton Live.

Specialized for **indie dance, tech house, melodic techno, and house music**.
Ships with built-in genre theory, production techniques, and reference analyses
from real tracks — so your AI assistant gives grounded, specific advice instead
of generic music theory.

## How it works

The server runs inside a **Max for Live device** embedded in your Live set. A
lightweight portal bridges your AI client (stdio) to the server over HTTP.

```
AI Client (Claude Desktop, etc.)
    ↓ stdio
ableton-dj-mcp-portal    ← standalone Node process, runs externally
    ↓ HTTP :3350
MCP server               ← runs inside .amxd device in Ableton Live
    ↓ Live API
Ableton Live
```

## Requirements

- Ableton Live 12.3+ with Max for Live
- Node.js 24+
- An MCP-compatible AI client (Claude Desktop, Cursor, etc.)

## Setup

### 1. Install the Max for Live device

Copy `dist/live-api-adapter.js` and `dist/mcp-server.mjs` into your `.amxd`
device and load it in a Live set. The server starts automatically when the
device loads.

### 2. Run the portal

```bash
npx ableton-dj-mcp
```

Or install globally:

```bash
npm install -g ableton-dj-mcp
ableton-dj-mcp
```

### 3. Configure your AI client

**Claude Desktop** — add to
`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ableton-dj-mcp": {
      "command": "npx",
      "args": ["ableton-dj-mcp"]
    }
  }
}
```

## Tools

21 tools prefixed `adj-`:

| Domain     | Tools                                           |
| ---------- | ----------------------------------------------- |
| Workflow   | `connect`, `context`, `read-samples`            |
| Live Set   | `read-live-set`, `update-live-set`              |
| Track      | `read-track`, `create-track`, `update-track`    |
| Scene      | `read-scene`, `create-scene`, `update-scene`    |
| Clip       | `read-clip`, `create-clip`, `update-clip`       |
| Device     | `read-device`, `create-device`, `update-device` |
| Operations | `delete`, `duplicate`                           |
| Control    | `select`, `playback`                            |

## Genre knowledge

The AI context includes production knowledge for:

- **Indie Dance** (120-128 BPM) — Dorian mode, i-VII-VI-VII progressions, disco
  bass, chopped vocals. Reference: Innellea, Mall Grab, Gerd Janson.
- **Tech House** (126-132 BPM) — minor pentatonic, single-chord grooves, driving
  16th bass, hypnotic loops. Reference: Chris Lake, Fisher, Solardo.
- **Melodic Techno** (128-138 BPM) — Phrygian/Aeolian, i-bVII-bVI, portamento
  leads, long builds. Reference: ARTBAT, Massano, Innellea.
- **House** (120-128 BPM) — Mixolydian, ii-V-I, piano chords on 2&4, TR-909/808.
  Reference: Larry Heard, Masters At Work.

Includes the Innellea Spectrum V2 reference analysis: exact drum velocity
curves, bass off-beat pattern (first hit at 1.25), synth pluck arp, FX placement
timing.

## Development

```bash
npm install
npm run parser:build   # required before tests (generates Peggy parsers)
npm test               # run unit tests
npm run check          # full quality gate: lint + typecheck + format + duplication + coverage
npm run fix            # auto-fix lint and formatting
npm run build          # bundle all three outputs to dist/
```

See [`INDEX.md`](./INDEX.md) for the full project map and [`dev/`](./dev/) for
deeper documentation.

## License

[GPL-3.0-or-later](./LICENSE). Originally based on
[Producer Pal](https://github.com/adamjmurray/producer-pal) by Adam Murray.
