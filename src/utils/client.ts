import {
  ChannelCredentials,
  ChannelOptions,
  loadPackageDefinition,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

const PROTO_DIR = "synapse-api";
const PROTO_FILE = `api/synapse.proto`;

const loadClient = () => {
  const definition = loadSync(PROTO_FILE, {
    keepCase: false,
    arrays: true,
    enums: Number,
    defaults: true,
    oneofs: true,
    includeDirs: [PROTO_DIR],
  });
  const descriptor = loadPackageDefinition(definition);
  return (descriptor.synapse as any).SynapseDevice;
};

export const create = (
  address: string,
  credentials: ChannelCredentials,
  options?: ChannelOptions
) => {
  return new (loadClient())(address, credentials, options);
};
