#!/bin/bash
PROTO_DIR=./synapse-api
PROTO_OUT_DIR=./src/api
PROTOS=$(find ${PROTO_DIR} -name '*.proto' | sed "s|${PROTO_DIR}/||")

mkdir -p ${PROTO_OUT_DIR}

pbjs \
    -t json \
    -w es6 \
    -p ${PROTO_DIR} \
    -o ${PROTO_OUT_DIR}/proto.json \
    ${PROTOS}

pbjs \
    -t static-module \
    -p ${PROTO_DIR} \
    -o ${PROTO_OUT_DIR}/api.js \
    ${PROTOS}

pbts \
    -o ${PROTO_OUT_DIR}/api.d.ts \
    ${PROTO_OUT_DIR}/api.js
