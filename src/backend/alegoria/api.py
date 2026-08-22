import requests
import os
import json
import tempfile
from gallery_dl.exception import GalleryDLException, NotFoundError
from gallery_dl.extractor import extractors, find as find_extractor
from werkzeug.exceptions import HTTPException
from itertools import groupby
from gallery_dl import config, job
from flask import Blueprint, request, jsonify, make_response, Response
from urllib.parse import unquote, urlparse, urljoin, quote
from http import HTTPStatus

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
        headers={k: v for k, v in request.headers if k.lower() != "host"}
        | extra_headers,
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=allow_redirects,
    )
    headers = [(k, v) for k, v in res.raw.headers.items()]
    response = Response(res.content, res.status_code, headers)
    return response


def get_grouped_extractors():
    groups = []
    for k, g in groupby(_extractors, key=lambda ext: ext.basecategory or ext.category):
        exts = []
        for ext in g:
            exts.append(
                {
                    "name": ext.subcategory,
                    "category": ext.basecategory or ext.category,
                    "example": ext.example,
                }
            )

        groups.append({"name": k, "subcategories": list(exts)})

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
    match (category, subcategory):
        case ("tiktok", "posts"):
            config.set(
                (
                    "extractor",
                    "tiktok",
                    subcategory,
                ),
                "tiktok-range",
                pagination,
            )
        case ("pinterest", "user"):
            config.set(("extractor",), "chapter-range", pagination)
        case _:
            config.set(("extractor",), "image-range", pagination)


def _fnv1a(s):
    h = 0x811C9DC5
    for c in s.encode():
        h ^= c
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


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
        case ("ce200ea0", "404ea5a3"):
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": urljoin(
                            f"{(p := urlparse(post['url'])).scheme}://{p.netloc}/",
                            post["thumbnail_path"],
                        ),
                        "url": f"{base_url}/{post['creator']}/{post['id']}",
                        "authorName": post.get("creator"),
                        "authorUrl": f"{base_url}/{post['creator']}",
                    }
                    for post in meta
                ],
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
        case ("ce200ea0", "36c7e141") | ("ce200ea0", "1601e678"):
            return {
                "renderer": "gallery",
                "items": [
                    {
                        "thumbnail": urljoin(
                            f"{(p := urlparse(post['url'])).scheme}://{p.netloc}/",
                            post["thumbnail_path"],
                        ),
                        "url": f"{base_url}/{post['creator']}/{post['id']}",
                        "authorName": post.get("creator"),
                        "authorThumbnail": (post.get("profile") or {}).get(
                            "profile_pic"
                        ),
                        "authorUrl": f"{base_url}/{post.get('creator')}",
                    }
                    for post in meta
                ],
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
    return {}


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
        if normalized:
            return make_response(normalized)

    return make_response(post)
