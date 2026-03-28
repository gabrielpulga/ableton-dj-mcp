# Ableton DJ MCP

MCP server for AI-assisted electronic music production in Ableton Live.
Based on [Producer Pal](https://github.com/adamjmurray/producer-pal) by Adam Murray (GPL-3.0-or-later).

## Quick start

```bash
npm install
npm run parser:build   # required before tests (generates Peggy parsers)
npm test               # run unit tests
npm run check          # full quality gate: lint + typecheck + format + duplication + coverage
npm run fix            # auto-fix lint and formatting
npm run build          # bundle all three outputs to dist/
docker compose run check  # same as npm run check, in isolation
```

## Architecture

```
AI Client (Claude Desktop, etc.)
    ↓ stdio
src/portal/ableton-dj-mcp-portal.ts   ← bridges stdio to HTTP
    ↓ HTTP :3350
src/mcp-server/                        ← Express server + MCP protocol handler
    ↓ internal dispatch
src/tools/                             ← 21 MCP tool implementations (adj-*)
    ↓ HTTP to Max
src/live-api-adapter/                  ← runs in Max's V8 inside .amxd
    ↓ LiveAPI globals
Ableton Live
```

The server runs **inside a Max for Live device** (the `.amxd`). The portal runs externally as a standalone Node process.

## Project map

See `INDEX.md` at root — full directory map, tool list, entry points, build system, notation system.
See `dev/` for deeper documentation on specific topics.

## 21 Tools (all prefixed `adj-`)

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
| Dev-only | `raw-live-api` (env flag required) |

Each tool has a `.def.ts` (Zod schema) and a `.ts` (implementation).

## Coding rules

- `.js` extensions in all imports (`import x from './foo.js'`)
- Path alias `#src/*` instead of `../` imports in `src/`
- Zod schemas: primitives and enums only — no `.object()` nesting in tool params
- `== null` over `=== null` (catches both null and undefined)
- Optimistic results for playback operations (don't wait for Live to confirm)
- Tool functions receive args object: `(args) => fn(args)` not destructured

## Notation

- **Bar|beat positions**: `17|1` (bar 17, beat 1). Grammar: `src/notation/barbeat/`
- **Transform expressions**: `velocity += rand(-5, 5)`. Grammar: `src/notation/transform/`
- Parsers are Peggy-generated — run `npm run parser:build` after changing `.peggy` files

## Build outputs (`dist/`)

| File | Destination |
|---|---|
| `dist/live-api-adapter.js` | Copy into .amxd (runs in Max V8) |
| `dist/mcp-server.mjs` | Copy into .amxd (runs in Node.js) |
| `dist/ableton-dj-mcp-portal.js` | Run directly — bridges stdio to :3350 |

## Branching

- `main` — stable
- Feature branches: `gabriel/<description>`

## Commit style

Use conventional commits — release-please reads these to auto-generate the CHANGELOG:
- `feat: add scale-aware note generation` — new feature (minor version bump)
- `fix: correct barbeat serializer off-by-one` — bug fix (patch bump)
- `perf: cache drum map lookups` — performance improvement
- `chore:`, `ci:`, `docs:`, `test:`, `refactor:` — no release, hidden in changelog
- `feat!:` or `BREAKING CHANGE:` footer — major version bump

## License

GPL-3.0-or-later. Upstream copyright (Adam Murray) preserved per license.
