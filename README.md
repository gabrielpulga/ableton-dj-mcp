# Ableton DJ MCP

```
    █████╗ ██████╗      ██╗    ███╗   ███╗ ██████╗██████╗
   ██╔══██╗██╔══██╗     ██║    ████╗ ████║██╔════╝██╔══██╗
   ███████║██║  ██║     ██║    ██╔████╔██║██║     ██████╔╝
   ██╔══██║██║  ██║██   ██║    ██║╚██╔╝██║██║     ██╔═══╝
   ██║  ██║██████╔╝╚█████╔╝    ██║ ╚═╝ ██║╚██████╗██║
   ╚═╝  ╚═╝╚═════╝  ╚════╝     ╚═╝     ╚═╝ ╚═════╝╚═╝
   ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▁▂▃▄▅▆▇█
                  ideas in. music out.
```

[![CI](https://github.com/gabrielpulga/ableton-dj-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrielpulga/ableton-dj-mcp/actions/workflows/ci.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](./LICENSE)

MCP server for AI-assisted electronic music production in Ableton Live.

Specialized for **indie dance, tech house, melodic techno, and house music** —
ships with built-in genre theory and production techniques so your AI gives
grounded, specific advice instead of generic music theory.

## How it works

The server runs inside a Max for Live device embedded in your Live set. A portal
bridges your AI client (stdio) to the server over HTTP. Tools prefixed `adj-`
let the AI read and manipulate the Live set in real time.

## Requirements

- Ableton Live 12.3+ with Max for Live
- Node.js 24+
- An MCP-compatible AI client (Claude Desktop, Cursor, etc.)

## Setup and usage

See [`docs/`](./docs/) for installation, tool reference, and developer docs.

## License

[GPL-3.0-or-later](./LICENSE).
