FROM node:lts-alpine AS build

RUN apk --no-cache add git

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile --network-timeout 0

COPY . /app
RUN yarn build

FROM nginx:stable-alpine

COPY --from=build /app/src/frontend/dist /usr/share/nginx/html/
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/frontend/entrypoint.sh /docker-entrypoint.d/env_replacement.sh
RUN chmod +x /docker-entrypoint.d/env_replacement.sh
