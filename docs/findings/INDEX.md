# Findings Index

One line per finding. Always loaded. Individual files load on demand only when
the bracketed globs match the current task's file paths.

Line format: `- [<slug>](<domain>/<slug>.md) [<glob>,<glob>] — <summary>`, or
`- [<slug>](<domain>/<subdir>/<slug>.md) [...] — ...` when the domain has
subdirs (see `HOW-TO-WRITE.md`).

## dev

- [track-freeze-missing-from-lom](dev/track-freeze-missing-from-lom.md)
  [src/tools/track/update/helpers/update-track-freeze-helpers.ts] — Live Object
  Model has no freeze/flatten trigger on Track, only get/observe can_be_frozen
  and is_frozen
- [v8-task-needs-persistent-ref](dev/v8-task-needs-persistent-ref.md)
  [src/shared/v8-sleep.ts, src/live-api-adapter/**] — inline
  `new Task(cb).schedule(ms)` with no stored reference risks GC before it fires

### notation

- [barbeat-notation-order](dev/notation/barbeat-notation-order.md)
  [src/notation/barbeat/**, src/tools/generative/**, *_/notes-formatter_] —
  pitch must precede time pos in barbeat or first note drops + warning

### browser

- [browser-search-shallow](dev/browser/browser-search-shallow.md)
  [src/tools/browse/**, live_browser_bridge/browser_ops.py,
  src/mcp-server/bridge-dispatcher.ts] — adj-browse search filters only direct
  children; user Places not reachable via Live categories
- [m4l-no-browser-api](dev/browser/m4l-no-browser-api.md) [src/tools/browse/**,
  src/tools/device/create/**, live_browser_bridge/**,
  src/mcp-server/browser-bridge-client.ts, src/mcp-server/bridge-dispatcher.ts]
  — Live Browser object not exposed to M4L LiveAPI JS in 12.4; Python remote
  script is only path (now implemented as `live_browser_bridge/`)

### device

- [drum-kit-uri-loads-full-rack](dev/device/drum-kit-uri-loads-full-rack.md)
  [src/tools/device/create/**, src/mcp-server/bridge-dispatcher.ts,
  live_browser_bridge/BrowserBridge.py] — load_item on a kit URI creates a
  populated Drum Rack; pre-inserting "Drum Rack" device yields an extra empty
  rack
- [empty-drum-rack-silent](dev/device/empty-drum-rack-silent.md)
  [src/tools/device/**, *_/adj-create-device_] — adj-create-device "Drum Rack"
  returns success but rack has no samples = no sound
- [live-instrument-limit](dev/device/live-instrument-limit.md)
  [src/tools/device/**, src/tools/track/**] — Live blocks 2nd instrument per
  track with vague error; delete first

### build

- [ci-format-job-ignores-untracked](dev/build/ci-format-job-ignores-untracked.md)
  [.github/workflows/ci.yml, .prettierignore, src/generated/**] — CI Format job
  (write + git diff) misses formatting bugs in gitignored files; use
  format:check for a true signal
- [eslint-unicorn-import-peer-conflict](dev/build/eslint-unicorn-import-peer-conflict.md)
  [package.json, package-lock.json] — eslint-plugin-unicorn>=66 needs
  eslint>=10.4, eslint-plugin-import caps at eslint^9; mutually exclusive
- [install-device-file-list](dev/build/install-device-file-list.md)
  [scripts/install-device.ts, max-for-live-device/**] — User Library install
  needs all 7 files (.amxd + 2 JS + 4 .maxpat); missing .maxpat = blank UI
- [prettier-ignore-path-cwd-relative](dev/build/prettier-ignore-path-cwd-relative.md)
  [.prettierignore, config/prettier.config.mjs, package.json] — --ignore-path
  resolves relative to the ignore file's dir, not cwd (unlike --config)
- [release-please-config-relocatable](dev/build/release-please-config-relocatable.md)
  [config/release-please-config.json, config/.release-please-manifest.json,
  .github/workflows/release.yml] — config-file/manifest-file inputs can be
  relocated; internal paths stay repo-root-relative
- [release-please-version-sync](dev/build/release-please-version-sync.md)
  [config/release-please-config.json, src/shared/version.ts, package.json] —
  VERSION constants need extra-files entry + marker comment

### testing

- [new-readonly-field-breaks-strictequal](dev/testing/new-readonly-field-breaks-strictequal.md)
  [src/tools/_/read/\**, src/tools/live-set/read-live-set.ts,
  \**/tests/_-basic.test.ts] — new always-present read field breaks existing
  toStrictEqual fixtures; add mock-default value to each

## music

- [euclidean-density-sweep](music/euclidean-density-sweep.md)
  [src/tools/generative/**, *_/named-patterns_] — vary `pulses` per section
  (3→5→7→11) for arrangement arc with one algorithm

## workflow

- [device-deploy-flow](workflow/device-deploy-flow.md) [max-for-live-device/**,
  dist/**, package.json] — build → copy bundles to max-for-live-device → restart
  Live to load new version
- [self-bootstrap-prereq](workflow/self-bootstrap-prereq.md)
  [src/portal/lazy-boot*, scripts/start-live.ts, docs/Setup.md] — lazy-boot only
  opens Live; device load needs "Save Live Set as Default Set" with device on
  track
