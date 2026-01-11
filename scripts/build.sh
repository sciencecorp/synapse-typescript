#!/bin/bash
PROTO_OUT_DIST_DIR=./dist/api
PROTO_OUT_SRC_DIR=./src/api

mkdir -p ${PROTO_OUT_DIST_DIR}

# Compile TypeScript (excluding src/api which is protobuf-generated)
./node_modules/.bin/tsc

# Copy protobuf-generated files to dist
cp ${PROTO_OUT_SRC_DIR}/*.js ${PROTO_OUT_DIST_DIR}/
cp ${PROTO_OUT_SRC_DIR}/*.d.ts ${PROTO_OUT_DIST_DIR}/
cp ${PROTO_OUT_SRC_DIR}/*.json ${PROTO_OUT_DIST_DIR}/
