from urllib.parse import urlparse
from gallery_dl.extractor import extractors
from gallery_dl.extractor.common import Message
from gallery_dl import text as _gdl_text
from .utils import fnv1a as _fnv1a

_by_key = {
    (
        _fnv1a(getattr(c, "category", "")),
        _fnv1a(getattr(c, "category", "") + getattr(c, "subcategory", "")),
    ): c
    for c in extractors()
}
_ThreadExtractor = _by_key.get(("03bfedaf", "25ba7f3f"))
_BoardExtractor = _by_key.get(("03bfedaf", "e7d2ac0d"))

_board_root = (
    f"{(p := urlparse(_BoardExtractor.example)).scheme}://{p.netloc}"
    if _BoardExtractor
    else ""
)


def _patched_thread_items(self):
    posts = self.request_json(
        f"https://a.4cdn.org/{self.board}/thread/{self.thread}.json"
    )["posts"]
    title = posts[0].get("sub") or _gdl_text.remove_html(posts[0]["com"])
    data = {
        "board": self.board,
        "thread": self.thread,
        "title": _gdl_text.unescape(title)[:50],
    }
    yield Message.Directory, "", data
    for post in posts:
        post.update(data)
        if "filename" in post:
            post["extension"] = post["ext"][1:]
            post["filename"] = _gdl_text.unescape(post["filename"])
            yield Message.Url, f"https://i.4cdn.org/{post['board']}/{post['tim']}{post['ext']}", post
        else:
            yield Message.Url, "", post


def _patched_board_items(self):
    pages = self.request_json(f"https://a.4cdn.org/{self.board}/catalog.json")
    data = {"board": self.board}
    yield Message.Directory, "", data
    for page in pages:
        for thread in page.get("threads", []):
            thread["board"] = self.board
            thread["_extractor"] = _ThreadExtractor
            yield Message.Queue, f"{_board_root}/{self.board}/thread/{thread['no']}/", thread


if _ThreadExtractor:
    _ThreadExtractor.items = _patched_thread_items
if _BoardExtractor:
    _BoardExtractor.items = _patched_board_items
