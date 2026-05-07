# Ableton DJ MCP - Live Browser Bridge tests
# Copyright (C) 2026 Gabriel Pulga
# SPDX-License-Identifier: GPL-3.0-or-later

"""Unit tests for browser_ops. The Live module is not imported here; we use a
plain Python object graph that mirrors the BrowserItem shape (name, uri,
is_folder, is_device, is_loadable, children)."""

import os
import sys
import unittest

# Make the package importable when running pytest from the repo root.
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, os.pardir, os.pardir))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from live_browser_bridge import browser_ops  # type: ignore  # noqa: E402


class FakeItem(object):
    def __init__(self, name="", uri="", is_folder=False, is_device=False,
                 is_loadable=False, children=()):
        self.name = name
        self.uri = uri
        self.is_folder = is_folder
        self.is_device = is_device
        self.is_loadable = is_loadable
        self.children = list(children)


class FakeBrowser(object):
    def __init__(self, **roots):
        for attr in browser_ops.CATEGORY_ATTRS:
            setattr(self, attr, roots.get(attr))


def _build_browser():
    operator = FakeItem(name="Operator", uri="query:Synths#Operator",
                        is_device=True, is_loadable=True)
    bass_kit = FakeItem(name="808 Kit", uri="query:Drums#808",
                        is_device=False, is_loadable=True)
    synth_folder = FakeItem(name="Synths", is_folder=True, children=[operator])
    instruments = FakeItem(name="Instruments", is_folder=True, children=[synth_folder])
    drums = FakeItem(name="Drums", is_folder=True, children=[bass_kit])
    return FakeBrowser(instruments=instruments, drums=drums)


class ListCategoriesTest(unittest.TestCase):
    def test_lists_only_present_roots(self):
        browser = _build_browser()
        cats = browser_ops.list_categories(browser)
        self.assertIn("instruments", cats)
        self.assertIn("drums", cats)
        self.assertNotIn("clips", cats)


class WalkPathTest(unittest.TestCase):
    def test_empty_path_returns_root(self):
        browser = _build_browser()
        root = browser_ops.get_category_root(browser, "instruments")
        self.assertIs(browser_ops.walk_path(root, ""), root)

    def test_single_segment(self):
        root = browser_ops.get_category_root(_build_browser(), "instruments")
        node = browser_ops.walk_path(root, "Synths")
        self.assertEqual(node.name, "Synths")

    def test_multi_segment(self):
        root = browser_ops.get_category_root(_build_browser(), "instruments")
        node = browser_ops.walk_path(root, "Synths/Operator")
        self.assertEqual(node.uri, "query:Synths#Operator")

    def test_missing_segment_raises(self):
        root = browser_ops.get_category_root(_build_browser(), "instruments")
        with self.assertRaises(browser_ops.BrowserOpError):
            browser_ops.walk_path(root, "Synths/Nope")


class BrowseTest(unittest.TestCase):
    def test_no_category_lists_categories(self):
        result = browser_ops.browse(_build_browser())
        self.assertIn("instruments", result["categories"])
        self.assertEqual(result["items"], [])

    def test_with_category_lists_root_children(self):
        result = browser_ops.browse(_build_browser(), category="instruments")
        names = [it["name"] for it in result["items"]]
        self.assertEqual(names, ["Synths"])
        self.assertFalse(result["truncated"])

    def test_with_path_walks(self):
        result = browser_ops.browse(_build_browser(), category="instruments",
                                    path="Synths")
        names = [it["name"] for it in result["items"]]
        self.assertEqual(names, ["Operator"])

    def test_search_filters(self):
        result = browser_ops.browse(_build_browser(), category="drums",
                                    search="808")
        names = [it["name"] for it in result["items"]]
        self.assertEqual(names, ["808 Kit"])

    def test_search_negative(self):
        result = browser_ops.browse(_build_browser(), category="drums",
                                    search="bigband")
        self.assertEqual(result["items"], [])

    def test_limit_truncates(self):
        children = [FakeItem(name="Item%d" % i) for i in range(5)]
        big_root = FakeItem(name="Big", is_folder=True, children=children)
        browser = FakeBrowser(instruments=big_root)
        result = browser_ops.browse(browser, category="instruments", limit=3)
        self.assertEqual(len(result["items"]), 3)
        self.assertTrue(result["truncated"])

    def test_depth_recurses(self):
        result = browser_ops.browse(_build_browser(), category="instruments",
                                    depth=2)
        self.assertEqual(result["items"][0]["name"], "Synths")
        self.assertEqual(result["items"][0]["children"][0]["name"], "Operator")


class FindByUriTest(unittest.TestCase):
    def test_finds_in_category(self):
        browser = _build_browser()
        item = browser_ops.find_by_uri(browser, "query:Synths#Operator")
        self.assertIsNotNone(item)
        self.assertEqual(item.uri, "query:Synths#Operator")

    def test_finds_in_other_category(self):
        browser = _build_browser()
        item = browser_ops.find_by_uri(browser, "query:Drums#808")
        self.assertIsNotNone(item)

    def test_returns_none_when_missing(self):
        browser = _build_browser()
        self.assertIsNone(browser_ops.find_by_uri(browser, "query:Nope"))

    def test_empty_uri_returns_none(self):
        self.assertIsNone(browser_ops.find_by_uri(_build_browser(), ""))


class SerializeItemTest(unittest.TestCase):
    def test_leaf_no_children_when_max_depth_zero(self):
        item = FakeItem(name="x", uri="u", is_loadable=True,
                        children=[FakeItem(name="kid")])
        out = browser_ops.serialize_item(item, max_depth=0, include_children=False)
        self.assertNotIn("children", out)

    def test_includes_children_at_depth(self):
        item = FakeItem(name="x", children=[FakeItem(name="kid")])
        out = browser_ops.serialize_item(item, max_depth=1)
        self.assertEqual(len(out["children"]), 1)


if __name__ == "__main__":
    unittest.main()
