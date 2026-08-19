import requests
import os
import json
import tempfile
from gallery_dl.exception import GalleryDLException, NotFoundError
from gallery_dl.extractor import extractors, find as find_extractor
from werkzeug.exceptions import HTTPException
from itertools import groupby
from gallery_dl import config, job
from yt_dlp import DownloadError
from flask import Blueprint, request, jsonify, make_response, Response
from urllib.parse import unquote
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


@api_v1.errorhandler(DownloadError)
def handle_yt_dlp_download_error(e):
    return make_response({"message": e.msg, "status": 500}, 500)


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


def download_post(url):
    extractor = find_extractor(url)
    data_job = job.DataJob(extractor, file=None)
    with open(os.devnull, "w") as f:
        data_job.file = f
        data_job.run()

    if data_job.exception:
        raise data_job.exception

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
    return make_response(post)
