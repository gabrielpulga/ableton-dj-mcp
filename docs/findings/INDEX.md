# Findings Index

One line per finding. Domain prefix indicates load priority. Read individual files only when working in matching context.

## dev
- [barbeat-notation-order](dev/barbeat-notation-order.md) — pitch must precede time pos in barbeat or first note drops + warning
- [empty-drum-rack-silent](dev/empty-drum-rack-silent.md) — adj-create-device "Drum Rack" returns success but rack has no samples = no sound
- [live-instrument-limit](dev/live-instrument-limit.md) — Live blocks 2nd instrument per track with vague error; delete first
- [release-please-version-sync](dev/release-please-version-sync.md) — VERSION constants need extra-files entry + marker comment

## music
- [euclidean-density-sweep](music/euclidean-density-sweep.md) — vary `pulses` per section (3→5→7→11) for arrangement arc with one algorithm

## workflow
- [device-deploy-flow](workflow/device-deploy-flow.md) — build → copy bundles to max-for-live-device → restart Live to load new version
