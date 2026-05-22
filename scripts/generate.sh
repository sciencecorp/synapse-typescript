#!/bin/bash
PROTO_DIR=./synapse-api
PROTO_OUT_DIR=./src/api
PROTOS=$(find ${PROTO_DIR} -name '*.proto' | sed "s|${PROTO_DIR}/||")

mkdir -p ${PROTO_OUT_DIR}

# Mirror synapse-api/VERSION into src/api_version.ts so the protocol
# version is available as a constant in both node and browser builds.
if [ -f "${PROTO_DIR}/VERSION" ]; then
    SYNAPSE_API_VERSION=$(tr -d '[:space:]' < ${PROTO_DIR}/VERSION)
    cat > ./src/api_version.ts <<EOF
// Generated from synapse-api/VERSION by scripts/generate.sh. Do not edit.
export const SYNAPSE_API_VERSION = "${SYNAPSE_API_VERSION}";
EOF
fi

pbjs \
    -t json \
    -w es6 \
    -p ${PROTO_DIR} \
    -o ${PROTO_OUT_DIR}/proto.json \
    --force-long \
    ${PROTOS}

pbjs \
    -t static-module \
    -p ${PROTO_DIR} \
    -o ${PROTO_OUT_DIR}/api.js \
    --force-long \
    ${PROTOS}

pbts \
    -o ${PROTO_OUT_DIR}/api.d.ts \
    ${PROTO_OUT_DIR}/api.js
