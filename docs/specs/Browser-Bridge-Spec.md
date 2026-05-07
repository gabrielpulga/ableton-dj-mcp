# Browser Bridge — Specification

> Status: IMPLEMENTED (Phase 1). Issue [#26]. Supersedes the M4L-JS-only design
> sketched in the original issue, which was disproven by a runtime probe (see
> [`docs/findings/dev/m4l-no-browser-api.md`](../findings/dev/m4l-no-browser-api.md)).
>
> Source: [`live_browser_bridge/`](../../live_browser_bridge/). Install with
> `npm run install:bridge`. Phase 2 (auto prefs toggle) still deferred.

---

## Why a sidecar

Live's `Application.Browser` is exposed to **Python remote scripts** but
deliberately filtered out of Max for Live's JavaScript `LiveAPI` bindings. A
runtime probe (`LiveAPI('live_app').info`) shows no `browser` child. The issue's
proposed `track.create_device(uri)` and `device.load_drum_kit(uri)` methods do
not exist on any class in any Live LOM version. The only path to Browser
navigation and URI-based loading is a Python remote script running inside Live's
interpreter. AbletonOSC and Ziforge/ableton-liveapi-tools are existing
precedents.

---

## Architecture

```
   MCP client (Claude Desktop, Cursor, etc.)
            │ stdio
            ▼
   ableton-dj-mcp-portal (Node, ~/usr/local/bin)
            │ HTTP localhost:3350/mcp
            ▼
   mcp-server.mjs (Node-for-Max, inside .amxd)
   ┌────────┴────────┐
   │                 │ UDP localhost:11077  (proposed)
   │                 ▼
   │   live-browser-bridge.py (Live remote script)
   │                 │ Application.Browser API
   │                 ▼
   │   Live's LOM (Python side)
   ▼
   v8 LiveAPI adapter (live-api-adapter.js, inside .amxd)
            │
            ▼
   Live's LOM (JS side, no Browser)
```

All non-browser tool calls stay on the existing JS path. Only browser navigation
and browser-URI device loading are forwarded over UDP to Python.

---

## IPC protocol

### Transport

UDP on `127.0.0.1`. Ports:

- Bridge listens on **11077** (request port)
- Node sends from ephemeral, receives replies on the same socket

UDP chosen over TCP for two reasons:

1. AbletonOSC precedent — known to work cleanly with Live's threading model.
2. No connection state to manage during Live restarts; lost packets surface as
   timeouts rather than half-open connections.

Each request/reply is a single UDP datagram, length-bounded by Node's `udp4`
socket. Browser results that exceed ~60 KB are paginated (see Tool contract).

### Message format

JSON, UTF-8.

#### Request

```json
{
  "id": "req_<uuid4>",
  "op": "browse" | "load_item" | "ping" | "shutdown",
  "args": { ... }
}
```

#### Reply

```json
{
  "id": "req_<uuid4>",
  "ok": true,
  "result": { ... }
}
```

```json
{
  "id": "req_<uuid4>",
  "ok": false,
  "error": {
    "code": "BRIDGE_NOT_FOUND" | "MAIN_THREAD_ERROR"
          | "BROWSER_API_FAILED" | "INVALID_ARGS"
          | "TIMEOUT_INTERNAL",
    "message": "<human-readable>"
  }
}
```

### Operations

#### `ping`

Returns `{ "version": "<bridge version>", "live_version": "<live version>" }`.
Used by Node side to confirm bridge is alive on connect.

#### `browse`

Args:

```json
{
  "category": "instruments" | "audio_effects" | ...,
  "path": "Synths/Operator",
  "search": "bass",
  "depth": 1,
  "limit": 100,
  "cursor": "<opaque, optional>"
}
```

Result:

```json
{
  "category": "...",
  "path": "...",
  "items": [
    { "name": "...", "uri": "...", "isFolder": true,
      "isDevice": false, "isLoadable": true, "children": [...] }
  ],
  "cursor": "<opaque, present if truncated>"
}
```

#### `load_item`

Args:

```json
{
  "uri": "<browser uri>",
  "trackPath": "t0" | "t0/d0" | "t0/d0/pC1",
  "drumKit": false
}
```

Effect: selects the target track via Live's view, then calls
`Application.Browser.load_item(item)` where `item` is resolved by walking the
browser tree until an item with matching `uri` is found. For `drumKit: true`,
the bridge first verifies that the track has a Drum Rack at `trackPath` and
loads the kit into it via the same `load_item` call (kit items are scoped under
Drums; Live routes them to the focused rack).

Result:

```json
{
  "loaded": true,
  "deviceId": "<id>",
  "deviceIndex": 1
}
```

`deviceId` resolution: bridge captures the track's `devices` list before and
after `load_item`, returns the new id.

---

## Tool contract (MCP-side, unchanged from previous draft except as noted)

`adj-browse` — same shape as the JS-only draft, but the Node implementation now
forwards to the Python bridge. If the bridge is unreachable, the tool returns a
structured error suggesting the user run `npm run install:bridge` and restart
Live.

`adj-create-device` `browserUri` — same shape; forwards to `load_item`.

Drum-kit compound (`deviceName: "Drum Rack"` + kit `browserUri`):

- Node side first creates the Drum Rack via existing `insert_device` JS path.
- Then forwards `load_item` to Python with `trackPath` resolved to the
  newly-created rack.

---

## Bridge implementation outline (Python)

`live-browser-bridge/`:

```
__init__.py             # Live entry point: returns BrowserBridge instance
BrowserBridge.py        # ControlSurface subclass, owns the UDP loop
browser_ops.py          # Pure functions: walk tree, find by uri, etc.
queue_runner.py         # Thread-safe queue: socket thread → main thread
README.md               # Install instructions
LICENSE                 # GPL-3.0-or-later, matches repo
```

Threading model (forced by Live):

- Socket thread owns the UDP loop. Receives JSON, validates, enqueues.
- Live's main thread polls the queue once per scheduler tick (use
  `Live.Base.Timer` or the `ControlSurface.update_display` callback) and
  executes browser ops. Replies pushed back to a response queue.
- Socket thread drains response queue, sends UDP replies.

This pattern is what `ableton-liveapi-tools` uses and is necessary because
direct LOM access from a non-main thread crashes Live.

---

## Install flow

### Phase 1 — semi-automated (ship target)

`npm run install:bridge` (new script):

1. Copies `live-browser-bridge/` (verbatim, no compilation) into:
   - macOS: `~/Music/Ableton/User Library/Remote Scripts/AbletonDjMcp/`
   - Windows:
     `%USERPROFILE%\Documents\Ableton\User Library\Remote Scripts\AbletonDjMcp\`
2. Detects whether Live is running. If so, prompts the user to quit Live; on
   confirmation, sends quit via `osascript` (mac) / equivalent (win).
3. Re-launches Live via existing `npm run start:live` flow.
4. Prints the **only manual step**: open Preferences → Link/Tempo/MIDI → set a
   Control Surface dropdown to `AbletonDjMcp`.
5. The Max device shows a one-time banner if it doesn't see the bridge after
   `connect`; banner disappears once `ping` succeeds.

### Phase 2 — fully-automated prefs toggle (deferred)

Research `~/Library/Preferences/Ableton/Live <version>/Preferences.cfg` schema
across Live 11.x and 12.x, verify safe edit semantics, ship a flag
`install:bridge --enable-prefs` that writes the Control Surface selection.
Risk-gated — not in the first ship.

---

## Distribution

- The Python source ships in the repo at `live-browser-bridge/`.
- An npm `bin` script (`bin/install-bridge.cjs`) wraps the install logic so
  end-users can run `npx ableton-dj-mcp install:bridge` post-`npm install`.
- Released versions of the npm package include the Python source verbatim.
- License: GPL-3.0-or-later (matches root). Each Python file carries the same
  header as the rest of the repo.

---

## Recovery and error handling

| Scenario                                         | Bridge state                                                 | Node behavior                                                  |
| ------------------------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------- |
| Bridge not installed                             | UDP send fails with ECONNREFUSED-equivalent                  | tool returns error: "install:bridge then enable in Live prefs" |
| Bridge installed, Live not running               | Send timeouts                                                | error: "start Live first"                                      |
| Bridge installed, Live running, prefs toggle off | Same as above                                                | error: "enable AbletonDjMcp in Live prefs"                     |
| Bridge crashed mid-session                       | Subsequent ops timeout                                       | error: "bridge died, restart Live"                             |
| Bridge slow / blocked on Live main thread        | Op exceeds timeout (10 s for `browse`, 30 s for `load_item`) | error: "bridge timeout, retry"                                 |

The Node side caches `ping` success for 30 s to avoid round-tripping every call.
Cache invalidates on first failure.

No automatic retry — failures surface to the LLM, which can rephrase or inform
the user.

---

## Testing

### Bridge (Python)

- Unit tests for `browser_ops.py` (pure functions) using `pytest`. Live imports
  stubbed.
- Mock `Live` module providing fake `BrowserItem` trees.
- CI: `python -m pytest live-browser-bridge/tests/` (Python 3.x).

### Node side

- Existing Vitest suite. Tools that call the bridge get a mock UDP socket in
  tests (no real Python).
- Integration test (manual, in `docs/Tools-Reference.md` checklist):
  `adj-browse instruments` returns expected categories on a fresh Live install.

---

## Open questions

1. **Drum kit URI scoping.** Verify in-Live whether `Browser.load_item(kit)`
   automatically targets the focused Drum Rack, or whether we need to walk into
   the rack's drum-pad chain first. Spike before finalizing the drum-kit
   compound flow.
2. **Cursor pagination shape.** Decide on opaque-string vs explicit
   offset+depth. Lean toward opaque (server-side state); decide once `load_item`
   is verified.
3. **Windows install path correctness.** Confirm exact path on Windows 12.x
   install — needs a Windows tester.
4. **Bundled python-osc vs raw socket.** AbletonOSC bundles python-osc; we don't
   need OSC, plain JSON-over-UDP is simpler, no third-party deps.

---

## Out of scope

- Sample preview before loading (issue #26 mentioned it; defer to a follow-up).
- Editing items in the User Library (renaming, deleting). Read-only browse.
- Full filesystem fallback when bridge is missing — design assumes Python bridge
  is the only path; without it, browser tools are unavailable but the rest of
  `adj-*` tools work normally.
