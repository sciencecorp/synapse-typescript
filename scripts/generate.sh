#!/bin/bash
PROTO_DIR=./synapse-api
PROTO_API_OUT_DIR=./src/api
PROTOS=$(find ${PROTO_DIR} -name '*.proto' | sed "s|${PROTO_DIR}/||")

mkdir -p ${PROTO_API_OUT_DIR}
./node_modules/.bin/pbjs \
    -p ${PROTO_DIR} \
    --target static-module \
    --wrap es6 \
    --es6 \
    --out ${PROTO_API_OUT_DIR}/synapse.js \
    ${PROTOS}

./node_modules/.bin/pbts \
    -o ${PROTO_API_OUT_DIR}/synapse.d.ts \
    ${PROTO_API_OUT_DIR}/synapse.js