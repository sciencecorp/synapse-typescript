#!/bin/bash
PROTO_DIR=./synapse-api
PROTO_OUT_DIR=./src/api
PROTOS=$(find ${PROTO_DIR} -name '*.proto' | sed "s|${PROTO_DIR}/||")

mkdir -p ${PROTO_OUT_DIR}
proto-loader-gen-types  \
    --defaults \
    --includeComments \
    --oneofs \
    --grpcLib=@grpc/grpc-js \
    --includeDirs=${PROTO_DIR} \
    --outDir=${PROTO_OUT_DIR} \
    ${PROTOS}
