# Ableton DJ MCP - Live Browser Bridge
# Copyright (C) 2026 Gabriel Pulga
# SPDX-License-Identifier: GPL-3.0-or-later

# Live's remote-script loader imports this package and calls
# create_instance(c_instance) to obtain the ControlSurface.
from .BrowserBridge import BrowserBridge


def create_instance(c_instance):
    return BrowserBridge(c_instance)
