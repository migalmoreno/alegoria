#!/bin/sh

if [ -z "${API_URL}" ]; then
    echo "API_URL not set"
    exit 1
fi

find /usr/share/nginx/html \
     -type f \( -name '*.js' \) \
     -exec sed -i "s@http://localhost:5000@${API_URL}@g" '{}' +

nginx -g "daemon off;"
