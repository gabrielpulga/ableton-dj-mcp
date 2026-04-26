# Releasing

How releases work + how to deploy a new version locally.

## Release process (automated)

Driven by [release-please](https://github.com/googleapis/release-please).

1. Write commits in [Conventional Commits](https://www.conventionalcommits.org/)
   format:
   - `feat: ...` → minor version bump
   - `fix: ...` → patch version bump
   - `perf: ...` → patch version bump
   - `chore: ...`, `ci: ...`, `docs: ...` → no release
   - `feat!: ...` or `BREAKING CHANGE:` footer → major version bump
2. Merge PRs to `main` as usual
3. Release-please opens a release PR
   (`chore(main): release ableton-dj-mcp X.Y.Z`) accumulating all unreleased
   changes
4. Merge the release PR
5. Release-please cuts the git tag, GitHub release, and CHANGELOG entry

## Files release-please updates

| File                            | What                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `package.json`                  | `version` field                                               |
| `package-lock.json`             | `version` field                                               |
| `src/shared/version.ts`         | `VERSION` constant (via `// x-release-please-version` marker) |
| `CHANGELOG.md`                  | new release section                                           |
| `.release-please-manifest.json` | tracking                                                      |

To add a new file with a hardcoded version:

1. Annotate the version line:
   `export const X = "1.0.0"; // x-release-please-version`
2. Add to `release-please-config.json` under `extra-files`

## Deploying a new version locally

After a release lands on `main`:

```bash
git checkout main && git pull
npm run build
cp dist/live-api-adapter.js max-for-live-device/live-api-adapter.js
cp dist/mcp-server.mjs max-for-live-device/mcp-server.mjs
```

Then in Ableton Live:

1. Eject the `Ableton_DJ_MCP` device from its MIDI track (or restart Live)
2. Re-drag `max-for-live-device/Ableton_DJ_MCP.amxd` onto the track
3. Verify console shows the new version:

```
node.script: [...] Ableton DJ MCP <new-version> running.
v8: [...] Ableton DJ MCP <new-version> Live API adapter ready
```

## Why the manual copy step

The `.amxd` references sibling JS files via relative path
(`v8 ./live-api-adapter.js`, `node.script ./mcp-server.mjs`). Rollup writes to
`dist/`. Live loads from `max-for-live-device/`. Bridging them is currently
manual. Tracked in
[#78](https://github.com/gabrielpulga/ableton-dj-mcp/issues/78) (smoother
install UX).

## Verifying a release end-to-end

```bash
# Confirm bundle has the expected version baked in
grep -o '1\.[0-9]\.[0-9]' max-for-live-device/live-api-adapter.js | sort -u
```

Should match the version in `package.json`.
