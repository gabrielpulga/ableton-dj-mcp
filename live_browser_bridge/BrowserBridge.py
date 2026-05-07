# Ableton DJ MCP - Live Browser Bridge
# Copyright (C) 2026 Gabriel Pulga
# SPDX-License-Identifier: GPL-3.0-or-later

"""ControlSurface that opens a UDP socket and dispatches browser ops on Live's
main thread.

Wire-protocol:

    Request:  {"id": "...", "op": "ping|browse|load_item|shutdown", "args": {...}}
    Reply OK: {"id": "...", "ok": true,  "result": {...}}
    Reply NO: {"id": "...", "ok": false, "error": {"code": "...", "message": "..."}}

Threading:
    - Socket thread: blocking ``recvfrom`` loop. Validates JSON, hands off to
      the request queue, drains the response queue and sends UDP replies.
    - Live main thread: ``update_display`` is called by Live every 100 ms; we
      drain the request queue there and execute browser ops, then push results
      onto the response queue."""

import json
import os
import socket
import threading
import traceback

try:
    import Live
except ImportError:  # pragma: no cover - tests stub Live
    Live = None

try:
    from _Framework.ControlSurface import ControlSurface
except ImportError:  # pragma: no cover - tests stub the base class
    class ControlSurface(object):  # type: ignore[no-redef]
        def __init__(self, c_instance):
            self._c_instance = c_instance

        def application(self):
            raise NotImplementedError

        def log_message(self, message):  # noqa: D401
            print(message)

        def disconnect(self):
            pass

        def update_display(self):
            pass

from . import browser_ops
from .queue_runner import BridgeQueues
from .version import BRIDGE_VERSION, DEFAULT_PORT


SOCKET_RECV_BUF = 65535
MAX_REQUESTS_PER_TICK = 8


class BrowserBridge(ControlSurface):
    """Live remote-script entry point. One instance per Live session."""

    def __init__(self, c_instance):
        ControlSurface.__init__(self, c_instance)
        self._queues = BridgeQueues()
        self._socket = None
        self._addr_by_id = {}
        self._socket_thread = None
        self._stop_event = threading.Event()
        self._port = self._resolve_port()
        self._start_socket()
        self._log("Ableton DJ MCP browser bridge %s listening on udp:%d" %
                  (BRIDGE_VERSION, self._port))

    # ------------------------------------------------------------------ setup

    def _resolve_port(self):
        env = os.environ.get("ADJ_BRIDGE_PORT")
        if env:
            try:
                return int(env)
            except ValueError:
                self._log("ignoring invalid ADJ_BRIDGE_PORT=%r" % env)
        return DEFAULT_PORT

    def _start_socket(self):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind(("127.0.0.1", self._port))
            sock.settimeout(0.25)
            self._socket = sock
        except Exception as exc:
            self._log("failed to bind udp:%d (%s); bridge inactive" %
                      (self._port, exc))
            self._socket = None
            return

        self._socket_thread = threading.Thread(
            target=self._socket_loop, name="adj-browser-bridge"
        )
        self._socket_thread.daemon = True
        self._socket_thread.start()

    # --------------------------------------------------------- socket thread

    def _socket_loop(self):
        sock = self._socket
        while not self._stop_event.is_set():
            self._drain_responses_to_socket()
            try:
                data, addr = sock.recvfrom(SOCKET_RECV_BUF)
            except socket.timeout:
                continue
            except OSError:
                break
            try:
                message = json.loads(data.decode("utf-8"))
            except Exception as exc:
                self._send(addr, self._error(None, "INVALID_ARGS",
                           "could not parse request: %s" % exc))
                continue
            req_id = message.get("id")
            op = message.get("op")
            if not req_id or not op:
                self._send(addr, self._error(req_id, "INVALID_ARGS",
                           "request missing id or op"))
                continue
            self._addr_by_id[req_id] = addr
            self._queues.submit_request(message)

    def _drain_responses_to_socket(self):
        for response in self._queues.drain_responses():
            req_id = response.get("id")
            addr = self._addr_by_id.pop(req_id, None) if req_id else None
            if addr is None:
                continue
            self._send(addr, response)

    def _send(self, addr, payload):
        if self._socket is None:
            return
        try:
            self._socket.sendto(json.dumps(payload).encode("utf-8"), addr)
        except Exception as exc:
            self._log("udp send failed: %s" % exc)

    # ----------------------------------------------------------- main thread

    def update_display(self):
        # Called by Live ~10 Hz. Process pending bridge requests here so all
        # LOM access happens on the main thread.
        try:
            requests = self._queues.drain_requests(max_items=MAX_REQUESTS_PER_TICK)
            for message in requests:
                response = self._handle_request(message)
                self._queues.submit_response(response)
        except Exception:
            # Never let a bridge failure crash Live's display tick.
            self._log("bridge tick error:\n%s" % traceback.format_exc())

    def _handle_request(self, message):
        req_id = message.get("id")
        op = message.get("op")
        args = message.get("args") or {}
        try:
            if op == "ping":
                return self._ok(req_id, self._op_ping())
            if op == "browse":
                return self._ok(req_id, self._op_browse(args))
            if op == "load_item":
                return self._ok(req_id, self._op_load_item(args))
            if op == "shutdown":
                # Best-effort; Live restart is the canonical way to stop us.
                return self._ok(req_id, {"acknowledged": True})
            return self._error(req_id, "INVALID_ARGS", "unknown op: %s" % op)
        except browser_ops.BrowserOpError as exc:
            return self._error(req_id, "BROWSER_API_FAILED", str(exc))
        except Exception as exc:
            return self._error(
                req_id,
                "MAIN_THREAD_ERROR",
                "%s: %s" % (exc.__class__.__name__, exc),
            )

    # ----------------------------------------------------------- ops impl

    def _browser(self):
        app = self.application()
        browser = getattr(app, "browser", None)
        if browser is None:
            raise browser_ops.BrowserOpError("Application.browser unavailable")
        return browser

    def _op_ping(self):
        live_version = "unknown"
        try:
            app = self.application()
            live_version = "%d.%d.%d" % (
                app.get_major_version(),
                app.get_minor_version(),
                app.get_bugfix_version(),
            )
        except Exception:
            pass
        return {"version": BRIDGE_VERSION, "liveVersion": live_version}

    def _op_browse(self, args):
        return browser_ops.browse(
            self._browser(),
            category=args.get("category"),
            path=args.get("path"),
            search=args.get("search"),
            depth=int(args.get("depth", 1)),
            limit=int(args.get("limit", 100)),
        )

    def _op_load_item(self, args):
        uri = args.get("uri")
        if not uri:
            raise browser_ops.BrowserOpError("uri is required for load_item")

        browser = self._browser()
        item = browser_ops.find_by_uri(browser, uri, category=args.get("category"))
        if item is None:
            raise browser_ops.BrowserOpError("uri not found in browser tree: %s" % uri)
        if not getattr(item, "is_loadable", False):
            raise browser_ops.BrowserOpError("item is not loadable: %s" % uri)

        # Capture pre-load device set on the focused track so we can report
        # the new device id after load.
        before_ids = self._focused_track_device_ids()
        browser.load_item(item)
        after_ids = self._focused_track_device_ids()
        new_ids = [d for d in after_ids if d not in before_ids]
        return {
            "loaded": True,
            "deviceId": new_ids[0] if new_ids else None,
            "deviceCountBefore": len(before_ids),
            "deviceCountAfter": len(after_ids),
        }

    def _focused_track_device_ids(self):
        try:
            song = self.application().get_document()
            track = song.view.selected_track
            return [str(d._live_ptr) if hasattr(d, "_live_ptr") else id(d)
                    for d in track.devices]
        except Exception:
            return []

    # ----------------------------------------------------------- responses

    def _ok(self, req_id, result):
        return {"id": req_id, "ok": True, "result": result}

    def _error(self, req_id, code, message):
        return {"id": req_id, "ok": False,
                "error": {"code": code, "message": message}}

    def _log(self, message):
        try:
            self.log_message("[adj-bridge] %s" % message)
        except Exception:  # pragma: no cover - log_message itself failing
            print("[adj-bridge] %s" % message)

    # ----------------------------------------------------------- shutdown

    def disconnect(self):
        self._stop_event.set()
        if self._socket is not None:
            try:
                self._socket.close()
            except Exception:
                pass
            self._socket = None
        try:
            ControlSurface.disconnect(self)
        except Exception:
            pass
