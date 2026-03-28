# Ableton DJ MCP

MCP server for AI-assisted electronic music production in Ableton Live.

Specialized for indie dance, tech house, melodic techno, and house music production.
Includes genre-aware context, music theory utilities, and 21 tools covering tracks,
clips, devices, scenes, and transport control.

## Requirements

- Ableton Live 12.3+
- A Max for Live device (`.amxd`) hosting the server
- An MCP-compatible AI client (Claude Desktop, etc.)
- Node.js 24+ (for the portal)

## How it works

The server runs inside a **Max for Live device** embedded in your Live set.
A lightweight portal bridges your AI client (stdio) to the server (HTTP :3350).

```
AI Client (Claude Desktop)
    ↓ stdio
ableton-dj-mcp-portal    ← standalone Node process
    ↓ HTTP :3350
MCP server               ← runs inside .amxd in Ableton Live
    ↓ Live API
Ableton Live
```

## Tools

21 tools prefixed `adj-`:

| Domain | Tools |
|---|---|
| Workflow | `connect`, `context`, `read-samples` |
| Live Set | `read-live-set`, `update-live-set` |
| Track | `read-track`, `create-track`, `update-track` |
| Scene | `read-scene`, `create-scene`, `update-scene` |
| Clip | `read-clip`, `create-clip`, `update-clip` |
| Device | `read-device`, `create-device`, `update-device` |
| Operations | `delete`, `duplicate` |
| Control | `select`, `playback` |

## Development

```bash
npm install
npm run parser:build   # required before tests
npm test               # unit tests
npm run check          # full quality gate
npm run build          # build all outputs to dist/
```

See `INDEX.md` for the full project map and `dev/` for deeper documentation.

## License

[GPL-3.0-or-later](./LICENSE)

Built on [Producer Pal](https://github.com/adamjmurray/producer-pal) by Adam Murray.
