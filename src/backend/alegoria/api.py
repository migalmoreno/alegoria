import html as _html
import requests
import os
import json
import re
import random
import time
import logging
import tempfile
from gallery_dl.exception import GalleryDLException, NotFoundError
from gallery_dl.extractor import extractors, find as find_extractor
from werkzeug.exceptions import HTTPException
from itertools import groupby
from gallery_dl import config, job
from flask import Blueprint, request, jsonify, make_response, Response
from urllib.parse import unquote, urlparse, urljoin, quote
from http import HTTPStatus
from datetime import datetime

_REDDIT_CLIENT_IDS = [
    "ohXpoqrZYub1kg",
    "6N9uN0krSDE-ig",
]
_REDDIT_ANDROID_VERSIONS = [
    "Version 2024.22.1/Build 1652272",
    "Version 2024.23.1/Build 1665606",
    "Version 2024.24.1/Build 1682520",
    "Version 2024.25.0/Build 1693595",
    "Version 2024.25.2/Build 1700401",
    "Version 2024.26.0/Build 1712645",
    "Version 2024.27.0/Build 1724716",
    "Version 2024.28.0/Build 1736729",
    "Version 2024.29.0/Build 1748758",
    "Version 2024.30.0/Build 1760827",
    "Version 2024.31.0/Build 1772896",
    "Version 2024.32.0/Build 1784965",
    "Version 2024.33.0/Build 1797034",
    "Version 2024.34.0/Build 1809103",
    "Version 2024.35.0/Build 1821172",
    "Version 2024.36.0/Build 1833241",
    "Version 2024.37.0/Build 1845310",
    "Version 2024.38.0/Build 1857379",
    "Version 2024.39.0/Build 1869448",
    "Version 2024.40.0/Build 1881517",
    "Version 2024.41.0/Build 1893586",
    "Version 2024.42.0/Build 1905655",
    "Version 2024.43.0/Build 1917724",
    "Version 2024.44.0/Build 1929793",
    "Version 2024.45.0/Build 2001943",
    "Version 2024.46.0/Build 2012731",
    "Version 2024.47.0/Build 2029755",
]
_reddit_rate_limited_at: dict[str, float] = {}
_current_reddit_client_id: str = _REDDIT_CLIENT_IDS[0]


class _RedditRateLimitHandler(logging.Handler):
    def emit(self, record):
        if "rate limit exceeded" in record.getMessage().lower():
            _reddit_rate_limited_at[_current_reddit_client_id] = time.monotonic()


logging.getLogger("gallery_dl.extractor.reddit").addHandler(_RedditRateLimitHandler())


def _best_reddit_client_id() -> str:
    global _current_reddit_client_id
    cid = min(_REDDIT_CLIENT_IDS, key=lambda c: _reddit_rate_limited_at.get(c, 0.0))
    _current_reddit_client_id = cid
    return cid


def _reddit_android_ua() -> str:
    version = random.choice(_REDDIT_ANDROID_VERSIONS)
    android = random.randint(9, 14)
    return f"Reddit/{version}/Android {android}"


from . import extractors as _extractors_patch
from .utils import fnv1a as _fnv1a

_extractors = list(extractors())


api_v1 = Blueprint("API_v1", __name__)


@api_v1.after_request
def handle_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response


@api_v1.errorhandler(HTTPException)
def handle_http_exception(e):
    response = e.get_response()
    response.data = jsonify(
        {"code": e.code, "name": e.name, "description": e.description}
    )
    response.content_type = "application/json"
    return response


@api_v1.errorhandler(NotFoundError)
def handle_gallery_dl_not_found(e):
    return make_response(
        {
            "message": e.message,
            "status": 404,
        },
        404,
    )


@api_v1.errorhandler(GalleryDLException)
def handle_gallery_dl_exception(e):
    status = e.status if hasattr(e, "status") else 500
    return make_response(
        {
            "message": e.message,
            "status": status,
        },
        status,
    )


@api_v1.route("/health")
def health():
    return make_response()


@api_v1.route("/config", methods=["POST"])
def load_config():
    content = request.get_json()
    with tempfile.TemporaryDirectory() as base:
        config_path = os.path.join(base, "config")
        with open(config_path, "w") as fp:
            fp.write(json.dumps(content))

        config.load((config_path,))

    return make_response(content)


@api_v1.route("/proxy", methods=["GET", "POST", "OPTIONS", "HEAD"])
def proxy():
    url = ""
    if _url := request.args.get("url"):
        url = unquote(_url)

    extra_headers = {}
    if headers_arg := request.args.get("headers"):
        extra_headers = json.loads(headers_arg)

    allow_redirects = request.args.get("follow_redirects", "true").lower() != "false"

    res = requests.request(
        method=request.method,
        url=url,
        headers={
            k: v
            for k, v in request.headers
            if k.lower() not in {"host", "referer", "origin"}
        }
        | extra_headers,
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=allow_redirects,
    )
    content = res.content
    excluded = {"transfer-encoding", "content-encoding", "content-length", "set-cookie"}
    headers = [(k, v) for k, v in res.raw.headers.items() if k.lower() not in excluded]
    headers.append(("Content-Length", str(len(content))))
    return Response(content, res.status_code, headers)


_SEARCH_SUBCATEGORIES = {
    "aac97454": {
        "name": "subreddit-search",
        "example": "https://www.reddit.com/r/SUBREDDIT/search/?q=QUERY&restrict_sr=1",
        "groups": ["QUERY", "SUBREDDIT"],
    },
    "d04699c9": {
        "name": "search",
        "example": "https://www.reddit.com/search/?q=QUERY",
        "groups": ["QUERY"],
    },
    "e05a81c1": {
        "name": "user-search",
        "example": "https://www.reddit.com/user/USER/search/?q=QUERY",
        "groups": ["QUERY", "USER"],
    },
    "f3e9f8dc": {
        "name": "top",
        "example": "https://www.reddit.com/top/?t=FILTER",
        "groups": ["FILTER"],
        "filters": ["hour", "day", "week", "month", "year", "all"],
    },
    "0160e943": {
        "name": "subreddit-top",
        "example": "https://www.reddit.com/r/SUBREDDIT/top/?t=FILTER",
        "groups": ["/r/SUBREDDIT", None, None, "FILTER"],
        "filters": ["hour", "day", "week", "month", "year", "all"],
    },
}


def get_grouped_extractors():
    groups = []
    for k, g in groupby(_extractors, key=lambda ext: ext.basecategory or ext.category):
        exts = []
        for ext in g:
            normalized = normalize(ext.category, ext.subcategory, {}, "")
            if normalized is None:
                continue
            exts.append(
                {
                    "name": ext.subcategory,
                    "category": ext.basecategory or ext.category,
                    "example": ext.example,
                    "searchable": normalized.get("searchable", True),
                }
            )
        if _fnv1a(k) == "bd300ce5" and exts:
            cat = exts[0]["category"]
            for sub in _SEARCH_SUBCATEGORIES.values():
                exts.append(
                    {
                        "name": sub["name"],
                        "category": cat,
                        "example": sub["example"],
                        "searchable": sub.get("searchable", True),
                    }
                )
        if exts:
            groups.append({"name": k, "subcategories": exts})

    return groups


@api_v1.route("/categories")
def get_categories():
    return make_response(get_grouped_extractors())


def get_extractors_by_category():
    groups = []
    for k, g in groupby(_extractors, key=lambda ext: ext.category or ext.basecategory):
        groups.append({"category": k, "subcategories": list(g)})
    return groups


@api_v1.route("/extractors")
def get_extractors():
    groups = get_extractors_by_category()

    category = None
    subcategory = None

    if cat := request.args.get("category"):
        category = cat
        subcategory = request.args.get("subcategory")
    elif url := request.args.get("url"):
        extractor = find_extractor(unquote(url))
        if extractor:
            category = extractor.category
            subcategory = extractor.subcategory

    if category and subcategory:
        sub_hash = _fnv1a(category + subcategory)
        if sub_hash in _SEARCH_SUBCATEGORIES:
            sub_info = _SEARCH_SUBCATEGORIES[sub_hash]
            ext_inst = find_extractor(sub_info["example"])
            return make_response(
                {
                    "category": category,
                    "subcategory": subcategory,
                    "url": sub_info["example"],
                    "groups": sub_info["groups"],
                    "configPath": ext_inst._cfgpath if ext_inst else [category],
                    **({"filters": sub_info["filters"]} if "filters" in sub_info else {}),
                }
            )

    for extractor_group in groups:
        if extractor_group["category"] == category:
            extractor = next(
                (
                    x
                    for x in extractor_group["subcategories"]
                    if x.subcategory == subcategory
                ),
                extractor_group["subcategories"][0],
            )
            if match := extractor.pattern.match(extractor.example):
                extractor_instance = extractor(match)
                return make_response(
                    {
                        "category": category,
                        "subcategory": extractor.subcategory,
                        "url": extractor_instance.url,
                        "groups": extractor_instance.groups,
                        "configPath": extractor_instance._cfgpath,
                    }
                )

    return make_response("Not found", HTTPStatus.NOT_FOUND)


def apply_extractor_config(category, subcategory, pagination):
    start, end = (int(x) for x in pagination.split("-"))
    page_size = end - start + 1
    match (_fnv1a(category), _fnv1a(category + subcategory)):
        case ("e88db17b", _):
            config.set(("extractor", "instagram"), "cookies-from-browser", "chrome")
            config.set(("extractor",), "image-range", pagination)
        case ("b8d92073", "70206412"):
            config.set(("extractor", category, subcategory), "tiktok-range", pagination)
        case ("c0d3c7b1", "1692405e") | ("03bfedaf", "e7d2ac0d"):
            config.set(("extractor",), "chapter-range", pagination)
        case ("bd300ce5", sub) if sub in (
            "2493dc95",
            "2c906dae",
            "ba419d12",
            "aac97454",
            "3ce02945",
            "e05a81c1",
            "8366fc68",
            "0160e943",
        ):
            config.set(("extractor", "reddit"), "client-id", _best_reddit_client_id())
            config.set(
                ("extractor", "reddit"), "user-agent-oauth", _reddit_android_ua()
            )
            config.set(("extractor", "reddit"), "limit", page_size)
            config.set(("extractor",), "chapter-range", pagination)
        case ("bd300ce5", _):
            config.set(("extractor", "reddit"), "client-id", _best_reddit_client_id())
            config.set(
                ("extractor", "reddit"), "user-agent-oauth", _reddit_android_ua()
            )
            config.set(("extractor",), "image-range", pagination)
        case _:
            config.set(("extractor",), "image-range", pagination)


def normalize(category, subcategory, data, base_url, url=""):
    key = (_fnv1a(category), _fnv1a(category + subcategory))
    meta = data.get("metadata", [])
    match key:
        case ("27b9c082", "67b6f7ae"):
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": (post.get("thumbnail") or {}).get("original"),
                        "url": post.get("url"),
                    }
                    for post in meta
                ],
            }
        case ("27b9c082", "4b1b2ee4"):
            if not meta:
                return {}
            post = meta[0]
            return {
                "renderer": "image",
                "url": post["thumbnail"]["original"],
                "description": post.get("content"),
                "authorName": post["creator"]["vanity"],
                "authorUrl": post["creator"]["url"],
                "authorThumbnail": post["campaign"]["avatar_photo_url"],
            }
        case ("5c6e7131", "9d8e01de"):
            if not any(post.get("id") for post in meta):
                sub_urls = data.get("urls", [])
                if sub_urls:
                    data = download_post(sub_urls[0])
                    meta = data.get("metadata", [])
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": post.get("url"),
                        "url": f"{base_url}/photo/?fbid={post['id']}&set={post['set_id']}",
                    }
                    for post in meta
                    if post.get("id")
                ],
            }
        case ("5c6e7131", "dc1d7def"):
            if not meta:
                return {}
            post = meta[0]
            return {
                "renderer": "image",
                "url": post.get("url"),
                "description": post.get("caption"),
                "date": post.get("date"),
                "authorName": post.get("username"),
                "authorUrl": f"{base_url}/{post['user_id']}",
            }
        case ("e88db17b", "a3848f58"):
            urls = data.get("urls", [])
            return {
                "renderer": "user-profile",
                "avatarUrl": next((u for u in urls if "info" in u), None),
                "galleryUrl": next((u for u in urls if "posts" in u), None),
            }
        case ("e88db17b", "7f691ebf"):
            posts = data.get("post", [])
            if not posts:
                return {}
            p = posts[0]
            return {
                "renderer": "user-info",
                "name": p.get("username"),
                "thumbnail": p.get("profile_pic_url_hd"),
                "category": p.get("category_name"),
                "bio": p.get("biography"),
                "private": p.get("is_private"),
                "nickname": p.get("full_name"),
                "stats": {
                    "mediaCount": (p.get("edge_owner_to_timeline_media") or {}).get(
                        "count"
                    ),
                    "followers": (p.get("edge_followed_by") or {}).get("count"),
                    "following": (p.get("edge_follow") or {}).get("count"),
                },
            }
        case ("e88db17b", "cf001e7a"):
            urls = data.get("urls", [])
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": urls[i] if i < len(urls) else None,
                        "url": urls[i] if i < len(urls) else None,
                    }
                    for i, _ in enumerate(meta)
                ],
            }
        case ("f3a30c28", "3418ee8b"):
            urls = data.get("urls", [])
            return {
                "renderer": "user-profile",
                "avatarUrl": next((u for u in urls if "avatar" in u), None),
                "galleryUrl": next((u for u in urls if "gallery" in u), None),
            }
        case ("f3a30c28", "246f9606"):
            urls = data.get("urls", [])
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": urls[i] if i < len(urls) else None,
                        "url": f"{base_url}/{post['user']}/{'video' if post.get('video') else 'media'}/{post['id']}",
                    }
                    for i, post in enumerate(meta)
                ],
            }
        case ("f3a30c28", "6b6a3fc1"):
            urls = data.get("urls", [])
            return {
                "renderer": "user-info",
                "name": meta[0].get("user") if meta else None,
                "thumbnail": urls[0] if urls else None,
            }
        case ("f3a30c28", "77240af5"):
            if not meta:
                return {}
            m = meta[0]
            posts = data.get("post", [])
            p = posts[0] if posts else {}
            urls = data.get("urls", [])
            return {
                "renderer": "image",
                "url": urls[0] if urls else None,
                "authorName": p.get("user"),
                "filename": m.get("filename"),
                "date": m.get("date"),
                "description": m.get("description"),
                "authorUrl": f"{base_url}/{p.get('user')}",
            }
        case ("c0d3c7b1", "1776446d"):
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": post.get("url"),
                        "url": f"{base_url}/pin/{post['id']}",
                        "authorName": post["pinner"]["username"],
                        "authorThumbnail": post["pinner"]["image_small_url"],
                        "authorUrl": f"{base_url}/{post['pinner']['username']}",
                        "groupName": (post.get("board") or {}).get("name"),
                        "groupThumbnail": (post.get("board") or {}).get(
                            "image_cover_url"
                        ),
                        "groupUrl": (
                            f"{base_url}{post['board']['url']}"
                            if post.get("board")
                            else None
                        ),
                    }
                    for post in meta
                ],
            }
        case ("c0d3c7b1", "1692405e"):
            return {
                "renderer": "group-board",
                "items": [
                    {
                        "name": post.get("name"),
                        "thumbnail": post.get("image_cover_url"),
                        "url": f"{base_url}{post['url']}",
                        "count": post.get("pin_count"),
                        "date": post.get("created_at"),
                    }
                    for post in meta
                ],
            }
        case ("c0d3c7b1", "22c9473f") | ("c0d3c7b1", "2b9db8bf"):
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": post.get("url"),
                        "url": f"{base_url}{post['seo_url']}",
                    }
                    for post in meta
                ],
            }
        case ("c0d3c7b1", "e3df3be0"):
            if not meta:
                return {}
            post = meta[0]
            api_url = request.host_url.rstrip("/")
            return {
                "renderer": "image",
                "url": f"{api_url}/api/v1/proxy?url={post['url']}",
                "authorName": post["pinner"]["username"],
                "authorThumbnail": post["pinner"]["image_small_url"],
                "authorUrl": f"{base_url}/{post['pinner']['username']}",
                "description": post.get("description"),
                "date": post.get("created_at"),
                "groupName": post["board"]["name"],
                "groupThumbnail": post["board"]["image_cover_url"],
                "groupUrl": f"{base_url}{post['board']['url']}",
            }
        case (
            ("ce200ea0", "404ea5a3")
            | ("ce200ea0", "36c7e141")
            | ("ce200ea0", "1601e678")
        ):
            items = [
                {
                    "thumbnail": urljoin(
                        f"{(p := urlparse(post['url'])).scheme}://{p.netloc}/",
                        post["thumbnail_path"],
                    ),
                    "url": f"{base_url}/{post['creator']}/{post['id']}",
                    "authorName": post.get("creator"),
                    "authorThumbnail": (post.get("profile") or {}).get("profile_pic"),
                    "authorUrl": f"{base_url}/{post.get('creator')}",
                }
                for post in meta
            ]
            return {
                "renderer": "gallery",
                **({"searchable": False} if key[1] in ("36c7e141", "1601e678") else {}),
                "items": items,
            }
        case ("ce200ea0", "5262c92a"):
            if not meta:
                return {}
            m = meta[0]
            posts = data.get("post", [])
            p = posts[0] if posts else {}
            return {
                "renderer": "image",
                "url": p.get("url"),
                "videoUrl": p.get("url"),
                "type": "video" if m.get("extension") in ("mp4", "mov") else "image",
                "filename": p.get("filename"),
                "description": m.get("description"),
                "authorName": p.get("creator"),
                "authorUrl": f"{base_url}/{p.get('creator')}",
            }
        case ("b8d92073", "f374b090"):
            urls = data.get("urls", [])
            return {
                "renderer": "user-profile",
                "avatarUrl": next((u for u in urls if "avatar" in u), None),
                "galleryUrl": next((u for u in urls if "posts" in u), None),
            }
        case ("b8d92073", "af675fda"):
            posts = data.get("post", [])
            urls = data.get("urls", [])
            p = posts[0] if posts else {}
            return {
                "renderer": "user-info",
                "name": p.get("nickname"),
                "thumbnail": urls[0] if urls else None,
                "bio": p.get("signature"),
                "verified": p.get("verified"),
            }
        case ("b8d92073", "70206412"):
            posts = data.get("post", [])
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": (post.get("video") or {}).get("cover"),
                        "url": f"{base_url}/@{post['user']}/{'video' if i < len(meta) and meta[i].get('type') == 'video' else 'photo'}/{post['id']}",
                    }
                    for i, post in enumerate(posts)
                ],
            }
        case ("03bfedaf", "e7d2ac0d"):
            urls = data.get("urls", [])
            return {
                "renderer": "media-board",
                "items": [
                    {
                        "url": urls[i],
                        "name": m.get("sub") or f"#{m['no']}",
                        "description": (
                            _html.unescape(re.sub(r"<[^>]+>", " ", m["com"])).strip()
                            if m.get("com")
                            else None
                        ),
                        "count": m.get("replies"),
                        "date": datetime.utcfromtimestamp(
                            m["last_modified"]
                        ).isoformat()
                        + "Z",
                        "thumbnail": (
                            f"https://i.4cdn.org/{m['board']}/{m['tim']}s.jpg"
                            if m.get("tim")
                            else None
                        ),
                    }
                    for i, m in enumerate(meta)
                    if i < len(urls)
                ],
            }
        case ("03bfedaf", "25ba7f3f"):
            urls = data.get("urls", [])
            return {
                "renderer": "thread",
                "items": [
                    {
                        "no": m.get("no"),
                        "com": m.get("com"),
                        "name": m.get("name"),
                        "date": (
                            datetime.utcfromtimestamp(m["time"]).isoformat() + "Z"
                            if m.get("time")
                            else None
                        ),
                        "thumbnail": (
                            f"https://i.4cdn.org/{m['board']}/{m['tim']}s.jpg"
                            if m.get("tim")
                            else None
                        ),
                        "url": urls[i] if i < len(urls) and urls[i] else None,
                        "filename": (
                            f"{m['filename']}{m['ext']}"
                            if m.get("filename") and m.get("ext")
                            else None
                        ),
                        "resto": m.get("resto"),
                    }
                    for i, m in enumerate(meta)
                ],
            }
        case (
            ("bd300ce5", "2493dc95")
            | ("bd300ce5", "2c906dae")
            | ("bd300ce5", "ba419d12")
            | ("bd300ce5", "aac97454")
            | ("bd300ce5", "3ce02945")
            | ("bd300ce5", "e05a81c1")
            | ("bd300ce5", "8366fc68")
            | ("bd300ce5", "0160e943")
        ):
            urls = data.get("urls", [])
            return {
                "renderer": "media-board",
                "columns": 1,
                **({"searchable": False} if key == ("bd300ce5", "2c906dae") else {}),
                "items": [
                    {
                        "url": urls[i] if i < len(urls) else None,
                        "name": m.get("title"),
                        "thumbnail": next(
                            (
                                v
                                for v in [
                                    _html.unescape(
                                        (
                                            (
                                                (m.get("preview") or {}).get("images")
                                                or [{}]
                                            )[0].get("source")
                                            or {}
                                        ).get("url", "")
                                    )
                                    or None,
                                    (
                                        m.get("thumbnail")
                                        if (m.get("thumbnail") or "").startswith(
                                            "https://"
                                        )
                                        else None
                                    ),
                                ]
                                if v
                            ),
                            None,
                        ),
                        "description": (
                            m.get("selftext")[:200] if m.get("selftext") else None
                        ),
                        "count": m.get("num_comments"),
                        "score": m.get("score"),
                        "date": (
                            datetime.utcfromtimestamp(m["created_utc"]).isoformat()
                            + "Z"
                            if m.get("created_utc")
                            else None
                        ),
                        "groupName": (
                            f"r/{m['subreddit']}" if m.get("subreddit") else None
                        ),
                        "groupUrl": (
                            f"{base_url}/r/{m['subreddit']}"
                            if m.get("subreddit")
                            else None
                        ),
                    }
                    for i, m in enumerate(meta)
                ],
            }
        case ("bd300ce5", "578a8689"):
            urls = [u for u in data.get("urls", []) if not u.startswith("ytdl:")]
            items = []
            for i, m in enumerate(meta):
                if m.get("_reddit_type") == "submission" or m.get("title"):
                    title = m.get("title", "")
                    selftext_html = re.sub(
                        r"<!--.*?-->", "", _html.unescape(m.get("selftext_html") or "")
                    ).strip()
                    com = selftext_html or None
                    thumbnail = next(
                        (
                            v
                            for v in [
                                _html.unescape(
                                    (
                                        (
                                            (m.get("preview") or {}).get("images")
                                            or [{}]
                                        )[0].get("source")
                                        or {}
                                    ).get("url", "")
                                )
                                or None,
                                (
                                    m.get("thumbnail")
                                    if (m.get("thumbnail") or "").startswith("https://")
                                    else None
                                ),
                            ]
                            if v
                        ),
                        None,
                    )
                    sub_url = m.get("url", "")
                    if m.get("is_video"):
                        reddit_video = (m.get("media") or {}).get("reddit_video") or {}
                        media_url = (
                            reddit_video.get("fallback_url")
                            or reddit_video.get("hls_url")
                            or None
                        )
                        media_type = "video"
                        source_url = None
                    elif sub_url.startswith("https://i.redd.it/"):
                        media_url = sub_url
                        media_type = "image"
                        source_url = None
                    elif (
                        sub_url and not m.get("is_self") and "reddit.com" not in sub_url
                    ):
                        media_url = None
                        media_type = None
                        source_url = sub_url
                        thumbnail = m.get("thumbnail") or thumbnail
                    else:
                        media_url = None
                        media_type = None
                        source_url = None
                    author = m.get("author")
                    subreddit = m.get("subreddit")
                    items.append(
                        {
                            "title": title or None,
                            "com": com,
                            "name": author,
                            "authorUrl": (
                                f"{base_url}/user/{author}" if author else None
                            ),
                            "date": (
                                datetime.utcfromtimestamp(m["created_utc"]).isoformat()
                                + "Z"
                                if m.get("created_utc")
                                else None
                            ),
                            "thumbnail": thumbnail,
                            "url": media_url,
                            "mediaType": media_type,
                            "sourceUrl": source_url,
                            "postUrl": url,
                            "score": m.get("score"),
                            "count": m.get("num_comments"),
                            "groupName": f"r/{subreddit}" if subreddit else None,
                            "groupUrl": (
                                f"{base_url}/r/{subreddit}" if subreddit else None
                            ),
                        }
                    )
                else:
                    body_html = re.sub(
                        r"<!--.*?-->", "", _html.unescape(m.get("body_html") or "")
                    ).strip()
                    if not body_html:
                        continue
                    author = m.get("author")
                    items.append(
                        {
                            "com": body_html,
                            "name": author,
                            "authorUrl": (
                                f"{base_url}/user/{author}" if author else None
                            ),
                            "date": (
                                datetime.utcfromtimestamp(m["created_utc"]).isoformat()
                                + "Z"
                                if m.get("created_utc")
                                else None
                            ),
                            "score": m.get("score"),
                        }
                    )
            return {
                "renderer": "thread",
                "items": items,
            }
        case ("b8d92073", "33295e95"):
            posts = data.get("post", [])
            urls = data.get("urls", [])
            if not posts or not meta:
                return {}
            p = posts[0]
            m = meta[0]
            cookies = data.get("cookies", {})
            http_headers = data.get("http_headers", {})
            cookie_str = "; ".join(f"{k}={v}" for k, v in cookies.items())
            headers = {**http_headers, **({"Cookie": cookie_str} if cookie_str else {})}
            api_url = request.host_url.rstrip("/")
            video_url = (
                f"{api_url}/api/v1/proxy?headers={quote(json.dumps(headers))}&url={quote(urls[0])}"
                if urls
                else None
            )
            video = p.get("video") or {}
            return {
                "renderer": "image",
                "url": video.get("cover"),
                "posterUrl": video.get("cover"),
                "videoUrl": video_url,
                "type": m.get("type"),
                "filename": m.get("filename"),
                "date": m.get("date"),
                "description": p.get("desc"),
                "authorName": p.get("user"),
                "authorUrl": f"{base_url}/@{p.get('user')}",
                "authorThumbnail": (p.get("author") or {}).get("avatarThumb"),
            }
    return None


def download_post(url):
    extractor = find_extractor(url)
    data_job = job.DataJob(extractor, file=None)
    with open(os.devnull, "w") as f:
        data_job.file = f
        data_job.run()

    if data_job.exception:
        raise data_job.exception

    error_entry = next((d[1] for d in data_job.data if d[0] == -1), None)
    if error_entry:
        raise GalleryDLException(error_entry["message"])

    if not data_job.data_meta and not data_job.data_post:
        exc = GalleryDLException(f"No content returned for {url}")
        exc.status = 502
        raise exc

    cookies = {}
    http_headers = {}
    if extractor is not None and extractor.session is not None:
        cookies = {c.name: c.value for c in extractor.session.cookies}
        http_headers = dict(extractor.session.headers)

    return {
        "metadata": data_job.data_meta,
        "post": data_job.data_post,
        "urls": data_job.data_urls,
        "cookies": cookies,
        "http_headers": http_headers,
    }


@api_v1.route("/posts/<path:url>")
def posts(url=""):
    items_per_page = request.args.get("limit", default=10, type=int)
    pagination_start = request.args.get("skip", default=0, type=int) + 1
    pagination_end = pagination_start + items_per_page - 1
    parsed_url = unquote(url)
    extractor = find_extractor(parsed_url)

    if extractor:
        apply_extractor_config(
            extractor._cfgpath[1],
            extractor._cfgpath[2],
            f"{pagination_start}-{pagination_end}",
        )

    post = download_post(parsed_url)

    if extractor:
        category, subcategory = extractor._cfgpath[1], extractor._cfgpath[2]
        base_url = f"{urlparse(parsed_url).scheme}://{urlparse(parsed_url).netloc}"
        normalized = normalize(category, subcategory, post, base_url, parsed_url)
        if normalized is not None:
            return make_response(normalized)

    return make_response(post)
