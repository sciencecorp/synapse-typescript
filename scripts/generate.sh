#!/bin/bash
PROTO_DIR=./synapse-api
PROTO_OUT_DIR=./src/api
PROTOS=$(find ${PROTO_DIR} -name '*.proto' | sed "s|${PROTO_DIR}/||")

# Generate types & services
mkdir -p ${PROTO_OUT_DIR}
proto-loader-gen-types  \
    --defaults \
    --includeComments \
    --oneofs \
    --grpcLib=@grpc/grpc-js \
    --includeDirs=${PROTO_DIR} \
    --outDir=${PROTO_OUT_DIR} \
    ${PROTOS}

# Create barrel file for types
TYPES_FILE=${PROTO_OUT_DIR}/types.ts
rm -f ${TYPES_FILE} && touch ${TYPES_FILE}
for file in $(find ${PROTO_OUT_DIR}/synapse -name '*.ts' | sed "s|${PROTO_OUT_DIR}/synapse/||" | sed "s|.ts$||"); do
    # check that there's no grpc-js import
    if grep -q "@grpc/grpc-js" ${PROTO_OUT_DIR}/synapse/${file}.ts; then
        continue
    fi
    echo "export * from './synapse/${file}';" >> ${TYPES_FILE}
done
