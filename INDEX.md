# Ableton DJ MCP — Project Index

MCP server for AI-assisted electronic music production in Ableton Live.
Based on [Producer Pal](https://github.com/adamjmurray/producer-pal) by Adam Murray. GPL-3.0-or-later.

---

## How it works

Ableton Live runs a Max for Live device. The device embeds two Node.js scripts:
- `live-api-adapter.js` — runs in Max's V8 engine, exposes the Live API over HTTP
- `mcp-server.mjs` — Node.js HTTP/MCP server that the AI client connects to

A lightweight portal script (`ableton-dj-mcp-portal.ts`) bridges stdio to HTTP, so standard MCP clients (Claude Desktop, etc.) can connect.

```
AI Client (Claude Desktop)
    ↓ stdio
ableton-dj-mcp-portal.ts   ← src/portal/
    ↓ HTTP
mcp-server.ts               ← src/mcp-server/   (runs inside .amxd device)
    ↓ internal
live-api-adapter.ts         ← src/live-api-adapter/  (runs in Max V8 inside .amxd)
    ↓ LiveAPI globals
Ableton Live
```

---

## Source tree (`src/`)

| Directory | Purpose |
|---|---|
| `src/tools/` | All 21 MCP tools (`adj-*`). One subdirectory per domain. |
| `src/mcp-server/` | Express HTTP server, MCP protocol handler, REST API routes |
| `src/live-api-adapter/` | Ableton Live API bridge (runs in Max's V8 runtime) |
| `src/portal/` | stdio-to-HTTP bridge entry point (`ableton-dj-mcp-portal.ts`) |
| `src/notation/` | Barbeat notation parser/interpreter (Peggy grammar + evaluator) |
| `src/shared/` | Shared utilities: version check, pitch utils, response helpers |
| `src/skills/` | Context strings injected as MCP skills (`basic.ts`, `electronic-music.ts`) |
| `src/types/` | TypeScript type declarations for Max API globals and Live API |
| `src/test/` | Test infrastructure: mocks, meta-tests, license header checks |

### Key entry points

| File | Role |
|---|---|
| `src/portal/ableton-dj-mcp-portal.ts` | Stdio bridge — this is what Claude Desktop runs |
| `src/mcp-server/mcp-server.ts` | HTTP server entry point — bundled into .amxd |
| `src/live-api-adapter/live-api-adapter.ts` | Max V8 entry point — bundled into .amxd |
| `src/mcp-server/create-mcp-server.ts` | Registers all tools with the MCP SDK |
| `src/mcp-server/create-express-app.ts` | Express app: `/mcp`, `/config`, REST API |

### Tools (`src/tools/`)

Each tool has a `.def.ts` (schema/definition) and a `.ts` (implementation).

| Tool group | Prefix | Files |
|---|---|---|
| Clip | `adj-read-clip`, `adj-create-clip`, `adj-update-clip` | `src/tools/clip/` |
| Track | `adj-read-track`, `adj-create-track`, `adj-update-track` | `src/tools/track/` |
| Device | `adj-read-device`, `adj-create-device`, `adj-update-device` | `src/tools/device/` |
| Scene | `adj-read-scene`, `adj-create-scene`, `adj-update-scene` | `src/tools/scene/` |
| Live Set | `adj-read-live-set`, `adj-update-live-set` | `src/tools/live-set/` |
| Operations | `adj-delete`, `adj-duplicate` | `src/tools/operations/` |
| Control | `adj-playback`, `adj-select` | `src/tools/control/` |
| Workflow | `adj-connect`, `adj-context`, `adj-read-samples` | `src/tools/workflow/` |

### Adding a new tool

1. Create `src/tools/{domain}/{action}.def.ts` — Zod schema + tool definition
2. Create `src/tools/{domain}/{action}.ts` — implementation
3. Register in `src/mcp-server/create-mcp-server.ts`
4. Add tests in `src/tools/{domain}/tests/`

---

## Tests

| Location | What it tests |
|---|---|
| `src/**/*.test.ts` | Unit tests for all tools, notation, shared utils |
| `e2e/mcp/` | Integration tests requiring live Ableton connection |
| `e2e/live-sets/` | Ableton Live Set files used by E2E tests |

Run unit tests: `npm test`
Run with coverage: `npm run test:coverage`
Run full check suite: `npm run check` (lint + typecheck + format + duplication + coverage)
Run in Docker: `docker compose run check`

---

## Build

```bash
npm run parser:build   # Generate Peggy parsers (required before tests)
npm run build          # Build all three bundles to dist/
```

Output in `dist/`:
- `dist/live-api-adapter.js` — for Max V8 inside .amxd
- `dist/mcp-server.mjs` — for Node.js inside .amxd
- `dist/ableton-dj-mcp-portal.js` — standalone stdio bridge

---

## Config files

| File | Purpose |
|---|---|
| `config/rollup.config.mjs` | Three-bundle build: adapter, server, portal |
| `config/vitest.config.ts` (root) | Unit test config with coverage thresholds |
| `config/vitest.e2e.config.ts` | E2E test config |
| `config/.jscpd*.json` | Code duplication thresholds per domain |
| `Dockerfile` | Containerized CI (runs `npm run check`) |
| `docker-compose.yml` | Docker services: dev, check, test, build |

---

## Notation system (`src/notation/`)

Custom barbeat notation for writing MIDI clips as text. Format: `C4:t/8 D4:t/4`.

| File | Purpose |
|---|---|
| `barbeat/parser/barbeat-grammar.peggy` | Peggy grammar source |
| `barbeat/interpreter/barbeat-interpreter.ts` | Converts parse tree to note objects |
| `barbeat/serializer/barbeat-serializer.ts` | Converts note objects back to notation |
| `transform/parser/transform-grammar.peggy` | Transform expression grammar (velocity, pitch, timing) |
| `transform/transform-evaluator.ts` | Applies transforms to note sets |

Parsers are generated at build time into `generated-*-parser.js` (git-ignored, regenerated by `npm run parser:build`).

---

## Scripts (`scripts/`)

| File/Dir | Purpose |
|---|---|
| `scripts/adj-client.ts` | CLI client for calling tools manually during dev |
| `scripts/run-parallel.ts` | Runs multiple npm scripts in parallel (used by `check`) |
| `scripts/loc/` | Lines-of-code counter |
| `scripts/open-live-set/` | Dev utility to open a Live Set in Ableton |
