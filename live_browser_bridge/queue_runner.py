# Ableton DJ MCP - Live Browser Bridge
# Copyright (C) 2026 Gabriel Pulga
# SPDX-License-Identifier: GPL-3.0-or-later

"""Thread-safe request/response queues used to bridge the UDP socket thread
and Live's main thread.

Direct LOM access from a non-main thread crashes Live, so the socket thread
must hand work to the main thread and vice versa. Both queues are unbounded;
in practice request rate is low (interactive tool calls)."""

try:
    # Python 3 (Live 11+)
    from queue import Queue, Empty
except ImportError:  # pragma: no cover - kept for older runtimes
    from Queue import Queue, Empty  # type: ignore[no-redef]


class BridgeQueues(object):
    """Pair of queues: requests go socket->main, responses go main->socket."""

    def __init__(self):
        self.requests = Queue()
        self.responses = Queue()

    def submit_request(self, message):
        """Called from the socket thread. message is a dict with id/op/args."""
        self.requests.put(message)

    def drain_requests(self, max_items=16):
        """Called from the main thread. Returns a list of pending requests."""
        out = []
        for _ in range(max_items):
            try:
                out.append(self.requests.get_nowait())
            except Empty:
                break
        return out

    def submit_response(self, message):
        """Called from the main thread."""
        self.responses.put(message)

    def drain_responses(self, max_items=64):
        """Called from the socket thread. Returns a list of pending responses."""
        out = []
        for _ in range(max_items):
            try:
                out.append(self.responses.get_nowait())
            except Empty:
                break
        return out
