# Setup

Install and run Ableton DJ MCP.

## Requirements

See [Requirements](../README.md#requirements) in the README.

## Install

```bash
git clone https://github.com/gabrielpulga/ableton-dj-mcp.git
cd ableton-dj-mcp
npm install
npm run build
```

## Install the device in Ableton's User Library

```bash
npm run install:device
```

Copies the device + bundled JS into your User Library so it shows up in Live's
browser permanently. Cross-platform (macOS + Windows). Idempotent — re-run after
every `npm run build` to refresh.

The script writes to (these paths are real after running it — Live's browser
mirrors them 1:1):

- macOS: `~/Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect/`
- Windows:
  `%USERPROFILE%\Documents\Ableton\User Library\Presets\MIDI Effects\Max MIDI Effect\`

After running:

1. Open Ableton Live (or refresh the User Library in the browser — right-click
   User Library → Refresh if the device doesn't appear).
2. In the browser, look under **Places → User Library → Presets → MIDI Effects →
   Max MIDI Effect → Ableton_DJ_MCP**. Live 12 also surfaces it under
   **Categories → Max for Live → Max MIDI Effect**. (Folder names follow
   filesystem layout; localized Live builds translate the Live-side labels but
   the User Library folder structure is the same.)
3. Drag onto any MIDI track. The status panel should show
   `MCP server running on :3350`.

Sanity check from a terminal — files should match what's in the User Library
folder on disk:

```bash
ls "$HOME/Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect/"
# Ableton_DJ_MCP.amxd  live-api-adapter.js  mcp-server.mjs
# server-status.maxpat tab-context.maxpat   tab-main.maxpat  tab-setup.maxpat
```

### Manual install (alternative)

If you'd rather skip the script, drag `max-for-live-device/Ableton_DJ_MCP.amxd`
onto any MIDI track from your file manager. The device only persists in that one
Live set — for permanent install, use `npm run install:device`.

## Make the device load on every Live launch

**Strongly recommended.** Without this step, every new Live set is empty — the
device isn't loaded, and `:3350` is down until you drag the device in.
Self-bootstrap (next section) depends on this.

One-time setup:

1. Open a Live set and drop the device onto a **return or master track** (return
   tracks survive switching between Session and Arrangement views; regular
   tracks can be deleted accidentally).
2. Wait until the device's status panel reads `MCP server running on :3350`.
3. **File → Save Live Set as Default Set**. Live confirms the new default.

Every fresh Live set now auto-loads the device. `adj-connect` works without any
drag-and-drop.

### How to verify

Quit Live entirely. Reopen it. The device should appear on your default track
and the status panel should immediately show `MCP server running on :3350`.
Confirm with:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3350/mcp
```

A non-zero HTTP status means the device is up.

## Launch Live from the terminal

```bash
npm run start:live                 # launch Live (whatever the OS opens by default)
npm run start:live -- path.als     # launch Live with a specific .als file
npm run start:live -- --template   # launch Live with the bundled template.als
```

The `--template` flag opens a bundled `template.als` (a Live set with the device
pre-loaded on a return track). The template ships separately from this PR — if
the file doesn't exist yet, the script errors clearly.

This is the foundation for self-bootstrap: an MCP-aware AI client can call
`start:live` to bring up Live in the right state without the human having to
drag anything.

## Self-bootstrap (opt-in)

Set `ADJ_AUTO_BOOT=true` in your MCP client config to let the portal launch Live
automatically when it can't reach `:3350`. macOS only for now.

> **Prerequisite:** the device must auto-load on every Live launch. See
> [Make the device load on every Live launch](#make-the-device-load-on-every-live-launch)
> above. Without it, the portal will open Live but the device won't load, and
> your tool call will still fail.

Behavior:

- **Live closed** → portal launches Live (`open -b com.ableton.live`), polls
  `:3350` for up to 30 seconds, then forwards your tool call.
- **Live open with device** → noop, business as usual.
- **Live open without device** → portal does **not** auto-relaunch (would
  destroy unsaved work). Returns the standard setup error.
- **Single attempt per portal lifetime** — if boot fails, subsequent calls
  return the standard error.

### Claude Code

```bash
claude mcp add ableton-dj-mcp \
  -e ADJ_AUTO_BOOT=true \
  -- node /absolute/path/to/ableton-dj-mcp/dist/ableton-dj-mcp-portal.js
```

If you already added the server, remove it first
(`claude mcp remove ableton-dj-mcp`) and re-add with the `-e` flag.

### Claude Desktop

```json
{
  "mcpServers": {
    "ableton-dj-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/dist/ableton-dj-mcp-portal.js"],
      "env": { "ADJ_AUTO_BOOT": "true" }
    }
  }
}
```

## Wire up your AI client

### Claude Code

```bash
claude mcp add ableton-dj-mcp -- node /absolute/path/to/ableton-dj-mcp/dist/ableton-dj-mcp-portal.js
```

Restart Claude Code. Verify with `/mcp` — should show
`ableton-dj-mcp ✓ Connected`.

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ableton-dj-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/ableton-dj-mcp/dist/ableton-dj-mcp-portal.js"]
    }
  }
}
```

Restart Claude Desktop.

### Other MCP clients

Point the client at `node /absolute/path/to/dist/ableton-dj-mcp-portal.js`
(stdio transport) or `http://localhost:3350/mcp` (HTTP).

## Verify

In your MCP client:

```
Use adj-connect
```

Expected response:

```
connected: true
serverVersion: <current version>
abletonLiveVersion: 12.3.x
```

If you see this, you're done.

## Set up your music workspace

Optional but recommended. Creates a personal, gitignored `workspace/` for your
projects, genres, techniques, and AI instructions.

```bash
npm run init:workspace
```

Result:

```
workspace/
├── AI.md                # provider-agnostic instructions for your AI client
├── projects/
│   └── example-track/   # sample to copy or replace
├── genres/
└── techniques/
```

For music sessions, start your AI client from inside `workspace/` so it loads
music-first context (not dev/code context). The `adj-*` tools are registered
globally and work the same regardless of cwd.

Edit `workspace/AI.md` to add your own production preferences, reference
artists, and style rules. The file is read by your AI on every session.

## Troubleshooting

| Symptom                                         | Fix                                                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Device console silent                           | Reload device: eject + reinsert on track, or restart Live                                                                   |
| Tool list empty in client                       | Restart MCP client after `claude mcp add`                                                                                   |
| `connection refused :3350`                      | Device not loaded in Live — check the MIDI track                                                                            |
| Lazy-boot launches Live but `:3350` never opens | Default Live set has no device. See [Make the device load on every Live launch](#make-the-device-load-on-every-live-launch) |
| `bpatcher: error loading patcher tab-*.maxpat`  | User Library install is missing the `.maxpat` files. Re-run `npm run install:device` (fixed in #110)                        |
| Wrong version in console                        | Stale bundle. See [Releasing.md](Releasing.md)                                                                              |
