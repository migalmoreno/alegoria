FROM node:lts-alpine AS build

WORKDIR /app

COPY package.json /app/
RUN yarn install

COPY . /app
RUN yarn build

FROM nginx:stable-alpine

COPY --from=build /app/src/frontend/dist /usr/share/nginx/html/
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/frontend/entrypoint.sh /docker-entrypoint.d/env_replacement.sh
RUN chmod +x /docker-entrypoint.d/env_replacement.sh
