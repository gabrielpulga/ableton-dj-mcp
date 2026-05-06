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

After running:

1. Open Ableton Live (or refresh the User Library in the browser)
2. Browser → Categories → Max for Live → Max MIDI Effect → **Ableton DJ MCP**
3. Drag onto any MIDI track. The status panel should show
   `MCP server running on :3350`.

To make the device load automatically in every new Live set:

1. Drop the device onto a return or master track
2. File → Save Live Set as Default Set
3. Every new Live set will now auto-load the device

### Manual install (alternative)

If you'd rather skip the script, drag `max-for-live-device/Ableton_DJ_MCP.amxd`
onto any MIDI track from your file manager. The device only persists in that one
Live set — for permanent install, use `npm run install:device`.

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

| Symptom                    | Fix                                                       |
| -------------------------- | --------------------------------------------------------- |
| Device console silent      | Reload device: eject + reinsert on track, or restart Live |
| Tool list empty in client  | Restart MCP client after `claude mcp add`                 |
| `connection refused :3350` | Device not loaded in Live — check the MIDI track          |
| Wrong version in console   | Stale bundle. See [Releasing.md](Releasing.md)            |
