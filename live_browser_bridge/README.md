# Ableton DJ MCP — Browser Bridge

Live remote-control script that exposes `Application.Browser` over a local UDP
socket. The Node-side MCP server forwards browser navigation and URI-based
device loads here; nothing else in the package needs the bridge.

License: GPL-3.0-or-later (matches the parent project).

## Why it exists

`Application.Browser` is exposed to Python remote scripts but deliberately
filtered out of Live's Max-for-Live JavaScript bindings. See
`docs/findings/dev/m4l-no-browser-api.md` and
`docs/specs/Browser-Bridge-Spec.md` in the parent repo for the full rationale.

## Install

From the parent repo:

```
npm run install:bridge
```

That copies this directory to:

- macOS: `~/Music/Ableton/User Library/Remote Scripts/AbletonDjMcp/`
- Windows:
  `%USERPROFILE%\Documents\Ableton\User Library\Remote Scripts\AbletonDjMcp\`

After installing, restart Live and enable the surface in **Preferences →
Link/Tempo/MIDI → Control Surface → AbletonDjMcp**.

## Protocol

UDP on `127.0.0.1:11077` (override with the `ADJ_BRIDGE_PORT` env var). One JSON
datagram per request and reply. See the parent repo spec for the full schema.

## Layout

| File               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `__init__.py`      | Live entry point; returns the `BrowserBridge` instance |
| `BrowserBridge.py` | ControlSurface subclass, owns the UDP loop             |
| `browser_ops.py`   | Pure tree walking / serialisation helpers              |
| `queue_runner.py`  | Thread-safe queues bridging socket and main thread     |
| `version.py`       | Version + default port constants                       |

`browser_ops.py` is import-clean (no Live import) so it can be unit-tested with
a stubbed browser module.
