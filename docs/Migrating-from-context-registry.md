# Migrating from a separate context-registry repo

If you previously kept your music context in a separate repo (e.g.,
`ableton-context-registry/`), here's how to fold it into this repo's
`workspace/` pattern.

## Why migrate

- One clone for tool + personal context
- Tool updates land via `git pull` automatically
- Music sessions can reference repo findings (`docs/findings/`) without
  cross-repo coordination
- Personal data still gitignored — nothing leaks to the public repo

## Steps

### 1. Init the workspace

From the repo root:

```bash
npm run init:workspace
```

This creates `workspace/` from the tracked template.

### 2. Move your existing content

Replace `~/path/to/ableton-context-registry` with your actual path:

```bash
mv ~/path/to/ableton-context-registry/projects/* workspace/projects/
mv ~/path/to/ableton-context-registry/genres/* workspace/genres/
mv ~/path/to/ableton-context-registry/techniques/* workspace/techniques/
```

### 3. Merge AI instructions

The template ships a fresh `workspace/AI.md`. If your old registry had a
`CLAUDE.md` (or equivalent) with personal preferences, merge the relevant parts
into `workspace/AI.md`. Don't blindly overwrite — the template includes
important conventions (notation order, tool list, drum-map warnings) you'll lose
otherwise.

```bash
# Compare side by side
diff ~/path/to/ableton-context-registry/CLAUDE.md workspace/AI.md
```

### 4. Verify the move

```bash
ls workspace/projects/   # should show your projects
git status               # workspace/ ignored, no tracked changes
```

### 5. Delete or archive the old repo

Once confirmed working:

```bash
mv ~/path/to/ableton-context-registry ~/path/to/ableton-context-registry.archive
```

Keep the archive until you've completed at least one full session in the new
workspace.

## Differences from the old layout

| Old (`ableton-context-registry/`) | New (`workspace/`)               |
| --------------------------------- | -------------------------------- |
| Separate git repo                 | Gitignored dir in this repo      |
| `CLAUDE.md`                       | `AI.md` (provider-agnostic name) |
| Independent of tool versioning    | Travels with the tool            |
| Required `cd` to a different repo | Just `cd workspace`              |

## Sessions

For music work: `cd workspace` and start your AI client. This loads
`workspace/AI.md` instead of the repo root's `CLAUDE.md`, giving you music-first
context.

For tool dev work: stay at the repo root.

The MCP server (`adj-*` tools) is registered globally with your AI client, so
all tools are available from either cwd.
