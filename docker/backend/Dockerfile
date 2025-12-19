FROM python:3.13.2-slim-bullseye AS build
WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_CACHE_DIR=/opt/uv-cache/
ENV UV_NO_DEV=1

COPY --from=ghcr.io/astral-sh/uv:0.6.0 /uv /uvx /bin/
COPY ./uv.lock ./pyproject.toml ./

RUN --mount=type=cache,target=/opt/uv-cache \
    uv sync --frozen --no-dev --no-editable --no-install-project

COPY ./ ./
RUN --mount=type=cache,target=/opt/uv-cache \
    uv sync --frozen --no-dev --no-editable

FROM python:3.13.2-slim-bullseye AS prod
WORKDIR /app

COPY --from=build /app/.venv ./.venv
ENV PATH="/app/.venv/bin:$PATH"

CMD gunicorn -w 4 -b :5000 "alegoria:create_app()"
