# Ableton DJ MCP - Live Browser Bridge tests
# Copyright (C) 2026 Gabriel Pulga
# SPDX-License-Identifier: GPL-3.0-or-later

"""Unit tests for BrowserBridge's send-failure fallback. Live/ControlSurface
are not imported here; BrowserBridge.py falls back to a stub base class when
they're unavailable, so the module imports cleanly outside Live."""

import json
import os
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, os.pardir, os.pardir))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from live_browser_bridge.BrowserBridge import BrowserBridge  # type: ignore  # noqa: E402


class FakeSocket(object):
    def __init__(self, side_effects):
        self.side_effects = list(side_effects)
        self.sent = []

    def sendto(self, data, addr):
        effect = self.side_effects.pop(0)
        self.sent.append(json.loads(data.decode("utf-8")))
        if isinstance(effect, Exception):
            raise effect


def _make_bridge(socket_):
    # Bypass __init__ (which binds a real UDP socket and starts a thread).
    bridge = BrowserBridge.__new__(BrowserBridge)
    bridge._socket = socket_
    bridge._log = lambda message: None
    return bridge


class SendFallbackTest(unittest.TestCase):
    def test_oversized_reply_sends_reply_too_large(self):
        sock = FakeSocket([OSError(40, "Message too long"), None])
        bridge = _make_bridge(sock)

        bridge._send("addr", {"id": "req_1", "ok": True, "result": {"items": []}})

        self.assertEqual(len(sock.sent), 2)
        fallback = sock.sent[1]
        self.assertEqual(fallback["id"], "req_1")
        self.assertFalse(fallback["ok"])
        self.assertEqual(fallback["error"]["code"], "REPLY_TOO_LARGE")

    def test_other_send_failure_sends_send_failed(self):
        sock = FakeSocket([OSError(9, "Bad file descriptor"), None])
        bridge = _make_bridge(sock)

        bridge._send("addr", {"id": "req_2", "ok": True, "result": {}})

        fallback = sock.sent[1]
        self.assertEqual(fallback["error"]["code"], "SEND_FAILED")

    def test_fallback_send_failure_does_not_raise(self):
        sock = FakeSocket([OSError(40, "Message too long"), OSError(9, "still broken")])
        bridge = _make_bridge(sock)

        bridge._send("addr", {"id": "req_3", "ok": True, "result": {}})  # must not raise

    def test_missing_id_skips_fallback(self):
        sock = FakeSocket([OSError(40, "Message too long")])
        bridge = _make_bridge(sock)

        bridge._send("addr", {"id": None, "ok": True, "result": {}})

        self.assertEqual(len(sock.sent), 1)

    def test_successful_send_does_not_trigger_fallback(self):
        sock = FakeSocket([None])
        bridge = _make_bridge(sock)

        bridge._send("addr", {"id": "req_4", "ok": True, "result": {}})

        self.assertEqual(len(sock.sent), 1)


if __name__ == "__main__":
    unittest.main()
