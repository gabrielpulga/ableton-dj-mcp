# Ableton DJ MCP - Live Browser Bridge
# Copyright (C) 2026 Gabriel Pulga
# SPDX-License-Identifier: GPL-3.0-or-later

# Bridge protocol/package version. Bump on protocol changes.
# Read by ping op so the Node side can warn on mismatch.
BRIDGE_VERSION = "0.1.0"

# Default UDP port. Configurable via env var ADJ_BRIDGE_PORT (read at boot).
DEFAULT_PORT = 11077
