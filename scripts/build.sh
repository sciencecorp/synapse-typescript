#!/bin/bash
PROTO_OUT_DIST_DIR=./dist/api
PROTO_OUT_SRC_DIR=./src/api

mkdir -p ${PROTO_OUT_DIST_DIR}

./node_modules/.bin/tsc

pbts \
    -o ${PROTO_OUT_DIST_DIR}/api.d.ts \
    ${PROTO_OUT_SRC_DIR}/api.js
