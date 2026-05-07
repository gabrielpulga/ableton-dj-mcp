# Ableton DJ MCP - Live Browser Bridge
# Copyright (C) 2026 Gabriel Pulga
# SPDX-License-Identifier: GPL-3.0-or-later

"""Pure helpers for browsing Live's Application.Browser tree.

Functions here take a `browser` object and operate on it. They never touch
sockets or queues, which makes them easy to unit-test with a stubbed Live
module.

The functions tolerate Live's mix of attribute/iterator-style children
(``BrowserItem.children`` is a sequence in modern versions; older versions
exposed ``iter_children``)."""

CATEGORY_ATTRS = (
    "instruments",
    "audio_effects",
    "midi_effects",
    "drums",
    "sounds",
    "samples",
    "clips",
    "current_project",
    "user_library",
    "user_folders",
    "packs",
    "plugins",
    "max_for_live",
)


class BrowserOpError(Exception):
    """Raised by ops when the Live browser API behaves unexpectedly."""


def list_categories(browser):
    """Return the names of category roots present on this browser instance.

    Different Live versions expose different roots; we probe for each known
    attribute and skip any that are missing or None."""
    out = []
    for attr in CATEGORY_ATTRS:
        if hasattr(browser, attr) and getattr(browser, attr) is not None:
            out.append(attr)
    return out


def get_category_root(browser, category):
    """Return the BrowserItem root for ``category`` or raise BrowserOpError."""
    if category not in CATEGORY_ATTRS:
        raise BrowserOpError("unknown category: %s" % category)
    root = getattr(browser, category, None)
    if root is None:
        raise BrowserOpError("category not available: %s" % category)
    return root


def children_of(item):
    """Return a list of children for a BrowserItem, abstracting over Live versions."""
    children = getattr(item, "children", None)
    if children is None:
        children = getattr(item, "iter_children", None)
        if callable(children):
            children = list(children())
        else:
            children = []
    # children may be a Live "vector" — coerce to plain list
    return list(children)


def serialize_item(item, depth=0, max_depth=1, include_children=True):
    """Convert a BrowserItem to a JSON-safe dict.

    ``depth=0, max_depth=1`` returns the item plus one level of children.
    Pass ``max_depth=0`` to get a leaf-only dict (no children traversal)."""
    out = {
        "name": getattr(item, "name", "") or "",
        "uri": getattr(item, "uri", "") or "",
        "isFolder": bool(getattr(item, "is_folder", False)),
        "isDevice": bool(getattr(item, "is_device", False)),
        "isLoadable": bool(getattr(item, "is_loadable", False)),
    }
    if include_children and depth < max_depth:
        kids = []
        for child in children_of(item):
            kids.append(
                serialize_item(
                    child,
                    depth=depth + 1,
                    max_depth=max_depth,
                    include_children=True,
                )
            )
        out["children"] = kids
    return out


def walk_path(root, path):
    """Walk a slash-separated path of BrowserItem names down from ``root``.

    Empty/None path returns the root unchanged. Raises BrowserOpError on
    a missing segment, with the partial path that resolved."""
    if not path:
        return root
    segments = [s for s in path.split("/") if s]
    current = root
    walked = []
    for seg in segments:
        match = None
        for child in children_of(current):
            if getattr(child, "name", "") == seg:
                match = child
                break
        if match is None:
            raise BrowserOpError(
                "path segment not found: %s (resolved: %s)" % (seg, "/".join(walked))
            )
        walked.append(seg)
        current = match
    return current


def browse(browser, category=None, path=None, search=None, depth=1, limit=100):
    """Return a serialized listing of the browser tree.

    - No ``category``: list category names.
    - With ``category``, no ``path``: list category root's direct children.
    - With ``category`` + ``path``: walk to that subnode and list its children.
    - With ``search``: case-insensitive substring filter applied AFTER children
      enumeration. depth>1 supported to expand sub-folders inline.
    - ``limit`` truncates the top-level item list. Truncation is reported via
      the ``truncated`` flag on the result."""
    if category is None:
        return {
            "categories": list_categories(browser),
            "items": [],
        }

    root = get_category_root(browser, category)
    target = walk_path(root, path)
    raw_items = children_of(target)

    if search:
        needle = search.lower()
        raw_items = [it for it in raw_items if needle in (getattr(it, "name", "") or "").lower()]

    truncated = False
    if limit is not None and len(raw_items) > limit:
        raw_items = raw_items[:limit]
        truncated = True

    items = [
        serialize_item(it, depth=0, max_depth=max(depth - 1, 0), include_children=depth > 1)
        for it in raw_items
    ]

    return {
        "category": category,
        "path": path or "",
        "items": items,
        "truncated": truncated,
    }


def find_by_uri(browser, uri, category=None):
    """Depth-first search for the first BrowserItem whose ``uri`` matches.

    Searches all categories when ``category`` is None; restricts to that
    category root otherwise. Returns the matching item or None."""
    if not uri:
        return None
    roots = (
        [get_category_root(browser, category)]
        if category is not None
        else [
            getattr(browser, attr)
            for attr in CATEGORY_ATTRS
            if hasattr(browser, attr) and getattr(browser, attr) is not None
        ]
    )

    seen = 0
    stack = list(roots)
    # Cap the walk so a malformed URI can't spin Live for ages. Live's full
    # browser is large but a few thousand items is enough headroom.
    MAX_NODES = 50_000
    while stack and seen < MAX_NODES:
        item = stack.pop()
        seen += 1
        if getattr(item, "uri", None) == uri:
            return item
        for child in children_of(item):
            stack.append(child)
    return None
