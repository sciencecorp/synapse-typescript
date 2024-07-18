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
rm -f ${PROTO_OUT_DIR}/index.ts && touch ${PROTO_OUT_DIR}/index.ts
for file in $(find ${PROTO_OUT_DIR}/synapse -name '*.ts' | sed "s|${PROTO_OUT_DIR}/synapse/||" | sed "s|.ts$||"); do
    echo "export * from './synapse/${file}';" >> ${PROTO_OUT_DIR}/index.ts
done
