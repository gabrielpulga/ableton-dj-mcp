---
title: release-please-version-sync
domain: dev
validated: 2026-04-25
evidence: PR #82 (commit 322f2080)
---

## Fact
Release-please bumps `package.json` but ignores other files unless explicitly listed in `extra-files`. Hardcoded `VERSION` constants drift across releases — dist bundles ship with stale version strings.

## Evidence
v1.7.0 and v1.8.0 dist bundles both reported `Ableton DJ MCP 1.6.0 Live API adapter ready` because `src/shared/version.ts` was hardcoded `"1.6.0"`. Release-please bumped `package.json` only.

Fix in `release-please-config.json`:

```json
{
  "packages": {
    ".": {
      "extra-files": [
        { "type": "generic", "path": "src/shared/version.ts" }
      ]
    }
  }
}
```

Marker required in target file (release-please scans for it):

```ts
export const VERSION = "1.8.1"; // x-release-please-version
```

Verified: v1.8.1 release auto-bumped both files.

## Apply when
Adding any new hardcoded version string outside `package.json`. Add the file to `extra-files` and annotate the line with `// x-release-please-version`.
