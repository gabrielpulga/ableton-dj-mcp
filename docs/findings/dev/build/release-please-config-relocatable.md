---
title: release-please-config-relocatable
domain: dev
validated: 2026-08-02
evidence: PR #234, v1.12.0 and v1.13.0 releases cut successfully
---

## Fact

`googleapis/release-please-action`'s `config-file`/`manifest-file` inputs let
you relocate `release-please-config.json` and `.release-please-manifest.json`
anywhere in the repo. Package paths and `extra-files` entries inside the config
JSON still resolve relative to the repo root regardless of where the config file
itself lives — release-please operates on the git tree, not on paths relative to
its own config.

## Evidence

`.github/workflows/release.yml`:

```yaml
config-file: config/release-please-config.json
manifest-file: config/.release-please-manifest.json
```

No changes needed inside either JSON file's content. Releases v1.12.0 and
v1.13.0 both cut correctly after the move (tag, GitHub release, CHANGELOG,
`src/shared/version.ts` bump via `extra-files` all worked unchanged).

## Apply when

Reorganizing root-level config files, or debugging why a relocated
release-please config isn't picking up `extra-files`/`packages` entries (the
JSON content is not the problem — check the action's `config-file`/
`manifest-file` inputs instead).
