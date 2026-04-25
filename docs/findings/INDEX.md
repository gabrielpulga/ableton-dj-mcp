# Findings Index

One line per finding. Always loaded. Individual files load on demand only when the bracketed globs match the current task's file paths.

Line format: `- [<slug>](<domain>/<slug>.md) [<glob>,<glob>] — <summary>`

## dev
- [barbeat-notation-order](dev/barbeat-notation-order.md) [src/notation/barbeat/**, src/tools/generative/**, **/notes-formatter*] — pitch must precede time pos in barbeat or first note drops + warning
- [empty-drum-rack-silent](dev/empty-drum-rack-silent.md) [src/tools/device/**, **/adj-create-device*] — adj-create-device "Drum Rack" returns success but rack has no samples = no sound
- [live-instrument-limit](dev/live-instrument-limit.md) [src/tools/device/**, src/tools/track/**] — Live blocks 2nd instrument per track with vague error; delete first
- [release-please-version-sync](dev/release-please-version-sync.md) [release-please-config.json, src/shared/version.ts, package.json] — VERSION constants need extra-files entry + marker comment

## music
- [euclidean-density-sweep](music/euclidean-density-sweep.md) [src/tools/generative/**, **/named-patterns*] — vary `pulses` per section (3→5→7→11) for arrangement arc with one algorithm

## workflow
- [device-deploy-flow](workflow/device-deploy-flow.md) [max-for-live-device/**, dist/**, package.json] — build → copy bundles to max-for-live-device → restart Live to load new version
