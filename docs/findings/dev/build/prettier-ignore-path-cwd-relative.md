---
title: prettier-ignore-path-cwd-relative
domain: dev
validated: 2026-08-02
evidence: PR #234, PR #235
---

## Fact

Prettier's `--ignore-path <file>` resolves the listed patterns relative to that
file's own directory (like `.gitignore`), not relative to cwd. This differs from
`--config <file>` (prettier), `--config <file>` (eslint), and `-c <file>`
(vitest), which all resolve their own internal path settings relative to cwd
even when the config file lives elsewhere.

## Evidence

Moving `.prettierignore` into `config/` (PR #234) silently broke every pattern
in it (`src/generated/`, `**/generated-*-parser.js`, etc) because they were now
interpreted relative to `config/`, not repo root:

```
npx prettier --ignore-path config/.prettierignore --check src/generated/build-info.ts
# [warn] src/generated/build-info.ts   <- should have been ignored, wasn't
```

Reverting `.prettierignore` to root (dropping the flag entirely, relying on
prettier's default cwd discovery) fixed it (PR #235). Meanwhile
`eslint.config.js` and `vitest.config.ts` moved into `config/` in the same PR
without issue, since `--config`/`-c` don't share this behavior.

## Apply when

Relocating any tool's config file into a subdirectory. Check whether that tool's
flag resolves paths relative to cwd or to the config file's own location before
assuming the move is safe.
