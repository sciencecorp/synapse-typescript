#!/bin/bash

generate_proto() {
    local dir_in=$1
    local dir_out=$2
    local protos=$(find ${dir_in} -name '*.proto' | sed "s|${dir_in}/||")

    if [ ! -d "${dir_in}" ]; then
        echo "Error: Input directory '${dir_in}' does not exist"
        exit 1
    fi

    mkdir -p ${dir_out}

    pbjs \
        -t json \
        -w es6 \
        -p ${dir_in} \
        -o ${dir_out}/proto.json \
        ${protos}

    pbjs \
        -t static-module \
        -p ${dir_in} \
        -o ${dir_out}/api.js \
        ${protos}

    pbts \
        -o ${dir_out}/api.d.ts \
        ${dir_out}/api.js
}

# Synapse API
PROTO_DIR_SYNAPSE_API=./synapse-api
PROTO_OUT_DIR_SYNAPSE_API=./src/api
generate_proto "${PROTO_DIR_SYNAPSE_API}" "${PROTO_OUT_DIR_SYNAPSE_API}"

# Science Device API
PROTO_DIR_SCIENCE_DEVICE_API=./science-device-api
PROTO_OUT_DIR_SCIENCE_DEVICE_API=./src/api-science-device
generate_proto "${PROTO_DIR_SCIENCE_DEVICE_API}" "${PROTO_OUT_DIR_SCIENCE_DEVICE_API}"

