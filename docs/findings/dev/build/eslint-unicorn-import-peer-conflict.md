---
title: eslint-unicorn-import-peer-conflict
domain: dev
validated: 2026-08-02
evidence: PR #230, npm error output
---

## Fact

`eslint-plugin-unicorn` >=66.0.0 requires `eslint >=10.4`, but
`eslint-plugin-import` (latest 2.32.0 as of this writing) peers on `eslint` up
to `^9` only — no released version supports eslint 10. These two constraints are
mutually exclusive at any single eslint major version, so bumping either package
past its current pin without checking the other breaks `npm ci`.

## Evidence

```
npm error While resolving: eslint-plugin-unicorn@72.0.0
npm error Found: eslint@9.39.5
npm error Could not resolve dependency:
npm error peer eslint@">=10.4" from eslint-plugin-unicorn@72.0.0
```

Fixed by pinning `eslint-plugin-unicorn` to `^65.0.1` (last version with
`eslint >=9.38.0`, before the `>=10.4` requirement landed at 66.0.0) and
`eslint` to `^9.39.5`.

## Apply when

A dependabot PR bumps `eslint`, `eslint-plugin-unicorn`, or
`eslint-plugin-import` in `package.json`. Verify the peer ranges of all three
are still mutually satisfiable before merging.
