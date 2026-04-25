# Setup

Install and run Ableton DJ MCP.

## Requirements

- Ableton Live 12.3+ with Max for Live
- Node.js 24+
- An MCP-compatible AI client (Claude Desktop, Claude Code, Cursor)

## Install

```bash
git clone https://github.com/gabrielpulga/ableton-dj-mcp.git
cd ableton-dj-mcp
npm install
npm run build
```

## Load the device in Ableton

1. Open Ableton Live
2. From your file manager, drag `max-for-live-device/Ableton_DJ_MCP.amxd` onto any MIDI track
3. The device's status panel should show `MCP server running on :3350`

## Wire up your AI client

### Claude Code

```bash
claude mcp add ableton-dj-mcp -- node /absolute/path/to/ableton-dj-mcp/dist/ableton-dj-mcp-portal.js
```

Restart Claude Code. Verify with `/mcp` — should show `ableton-dj-mcp ✓ Connected`.

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

Point the client at `node /absolute/path/to/dist/ableton-dj-mcp-portal.js` (stdio transport) or `http://localhost:3350/mcp` (HTTP).

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

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Device console silent | Reload device: eject + reinsert on track, or restart Live |
| Tool list empty in client | Restart MCP client after `claude mcp add` |
| `connection refused :3350` | Device not loaded in Live — check the MIDI track |
| Wrong version in console | Stale bundle. See [Releasing.md](Releasing.md) |
