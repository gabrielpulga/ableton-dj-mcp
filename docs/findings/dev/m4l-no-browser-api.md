---
title: m4l-no-browser-api
domain: dev
validated: 2026-05-07
evidence: PR #117 diagnostic dump
---

## Fact

Live's Browser object is not exposed to Max for Live's `LiveAPI` JavaScript
bindings in Live 12.4. `live_app browser` is not a navigable path, and the
`Application` object has no `browser` child or property. Browser access is
control-surface-only (Python).

## Evidence

`LiveAPI.from("live_app").info` returns:

```
type Application
children control_surfaces ControlSurface
child view View
property average_process_usage float
property current_dialog_button_count int
property current_dialog_message str
property open_dialog_count int
property peak_process_usage float
function get_bugfix_version, get_document, get_major_version,
         get_minor_version, get_version_string,
         press_current_dialog_button
```

No `browser` entry. Console error on `LiveAPI("live_app browser")`:

```
v8liveapi: component 'browser' is not an object
v8liveapi: 'Application' object has no attribute 'browser'
```

## Apply when

Designing tools that need to enumerate Live's library (instruments, effects,
samples, presets, drum kits) or load items by browser URI. The Python LOM
docs describing `Application.Browser` do not apply to Max for Live JS. A
Python remote script sidecar (with UDP/TCP IPC to Node) is the only path
that fully exposes the Browser API. See
[`docs/specs/Browser-Bridge-Spec.md`](../../specs/Browser-Bridge-Spec.md).
