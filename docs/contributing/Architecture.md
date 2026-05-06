# Architecture

Canonical reference for the system architecture, dataflow diagram, and build
outputs. Other docs link here instead of duplicating.

## System Overview

Ableton DJ MCP integrates with Ableton Live through a Max for Live device using
the Model Context Protocol (MCP) to enable AI assistants to manipulate music.

## Architecture Diagram

MCP hosts like Claude Desktop, Claude Code, or LM Studio connect via the Ableton
DJ MCP Portal (stdio-to-HTTP adapter). Locally hosted LLMs are also supported
with no online dependencies.

```
  +-----------------------+
  | LLM Cloud / Local LLM |
  +-----------------------+
             ↑
             | LLM API (streaming)
             ↓
     +----------------+
     | MCP Host (e.g. |
     | Claude Desktop)|
     +----------------+
             ↑
             | MCP stdio transport
             ↓
  +-------------------------+
  |  Ableton DJ MCP Portal  |
  | (stdio-to-http adapter) |
  +-------------------------+
             ↑
             | MCP streamable HTTP transport (port 3350)
             ↓
+-----------------------------+
|        Ableton Live         |
|  +-----------------------+  |
|  |  Max for Live Device  |  |
|  |  +---------------+    |  |
|  |  | Node for Max  |    |  |
|  |  | (MCP Server)  |    |  |
|  |  +---------------+    |  |
|  |         ↑             |  |
|  |         | Max message |  |
|  |         ↓             |  |
|  |  +---------------+    |  |
|  |  |      v8       |    |  |
|  |  |  (Live API)   |    |  |
|  |  +---------------+    |  |
|  +-----------------------+  |
+-----------------------------+
```

## Language Choices

The entire codebase is TypeScript (`src/` and `scripts/`).

**Benefits of TypeScript:**

- Static typing catches errors at compile time
- Streaming protocols and message parsing have many edge cases worth typing
- Tool definitions stay self-documenting via Zod schemas

**Runtime validation:**

- Zod schemas validate tool inputs to avoid unexpected runtime values
- Live API has no type definitions (uses type assertions where needed)

## Component Details

### 1. Ableton DJ MCP Portal (`src/portal/ableton-dj-mcp-portal.ts`)

Stdio-to-HTTP bridge that converts MCP stdio transport to HTTP for connecting to
the MCP server. Provides graceful fallback when Ableton DJ MCP is not running.

**Key features:**

- Zero runtime dependencies (all bundled)
- Graceful degradation when Live isn't running
- Returns helpful setup instructions when offline

### 2. MCP Server (`src/mcp-server/mcp-server.ts`)

HTTP endpoint for MCP communication running in Node for Max. Entry point that
imports all tool definitions from `src/tools/**/*.def.ts`.

**Key details:**

- Runs on port 3350 by default
- Uses StreamableHTTP transport (SSE is deprecated)
- Bundles all dependencies (@modelcontextprotocol/sdk, express, zod)

### 3. Tool Implementations (`src/tools/**`)

Core logic for each operation. Each tool is a pure function that transforms
requests into Live API calls.

### 4. Live API Adapter (`src/live-api-adapter/live-api-adapter.ts`)

V8 JavaScript that receives messages from Node.js and calls Live API. Entry
point for the V8 Max object.

**Key responsibilities:**

- Receives serialized JSON from Node.js
- Makes Live API calls
- Returns results to Node.js

### 5. Notation Parsers (`src/notation/`)

Two Peggy-generated DSLs for clip authoring:

- bar|beat MIDI notation — see [BarBeat-Spec.md](../specs/BarBeat-Spec.md)
- transform expression DSL — see
  [Transforms-Spec.md](../specs/Transforms-Spec.md)

## Build System

Three separate bundles built with rollup (`config/rollup.config.mjs`). Run
`npm run build` to produce all three in `dist/`. Deploying the device to Live
requires a manual copy step from `dist/` into `max-for-live-device/`; see
[Releasing.md](../Releasing.md).

| Bundle        | Entry                                      | Output (`dist/`)           | Target                       | Purpose                                                                              |
| ------------- | ------------------------------------------ | -------------------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| MCP server    | `src/mcp-server/mcp-server.ts`             | `mcp-server.mjs`           | Node.js (Node for Max)       | HTTP MCP endpoint inside the .amxd. All deps bundled.                                |
| V8 (Live API) | `src/live-api-adapter/live-api-adapter.ts` | `live-api-adapter.js`      | V8 engine (Max v8 object)    | Receives messages from Node for Max and calls the Live API. No deps (Max built-ins). |
| Portal        | `src/portal/ableton-dj-mcp-portal.ts`      | `ableton-dj-mcp-portal.js` | Node.js (standalone process) | stdio-to-HTTP adapter for MCP clients. Zero runtime deps; graceful offline fallback. |

## Message Protocol

Communication between Node.js and V8:

    ```js
    // Request from Node to V8
    ["mcp_request", JSON.stringify({ requestId, tool, args })]

    // Response from V8 to Node
    ["mcp_response", JSON.stringify({ requestId, result })]

    // Error from V8 to Node
    ["mcp_response", JSON.stringify({ requestId, error })]
    ```

## Live API Interface

The Live API has idiosyncrasies that are abstracted by
`src/live-api-adapter/live-api-extensions.ts`:

- Properties accessed via `.get("propertyName")?.[0]`
- Color values need special conversion
- Some properties require different access patterns

## Critical API Features

### drumMap Preservation

The `drumMap` property in track objects is a critical user-facing feature that
enables drum programming workflows. Any changes to device structure must
preserve drumMap functionality by ensuring extraction logic can locate drum rack
devices across all device categories.

### Playback State Handling

Due to Live API timing, playback-related operations return optimistic results
assuming success rather than immediately reading state which may not reflect
changes yet.

## Versioning

Semantic versioning (major.minor.patch) maintained in `src/shared/version.ts`:

- Displayed in server startup logs
- Sent to MCP SDK as server version
- Output to Max for display in device UI

## Testing Infrastructure

- **Framework:** Vitest
- **Mock Live API:** `src/test/mocks/mock-live-api.ts` (mock `LiveAPI` class)
- **Mock registry:** `src/test/mocks/mock-registry.ts` (instance-level mocks per
  Live API object)
- **Test location:** Colocated with source (`*.test.ts`)
- **Assertions:** Use instance-level `RegisteredMockObject` mocks for per-object
  assertions (e.g., `expect(device.set).toHaveBeenCalledWith(...)`)
