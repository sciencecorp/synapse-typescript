import path from "path";
import { ChannelCredentials, ChannelOptions, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

const PROTO_DIR = path.resolve(__dirname, "../synapse-api");
const PROTO_FILE = `api/synapse.proto`;
let DEFINITION = null;

const loadClient = () => {
  if (!DEFINITION) {
    DEFINITION = loadSync(PROTO_FILE, {
      keepCase: false,
      arrays: true,
      enums: Number,
      defaults: true,
      oneofs: true,
      includeDirs: [PROTO_DIR],
    });
  }
  const descriptor = loadPackageDefinition(DEFINITION);
  return (descriptor.synapse as any).SynapseDevice;
};

export const create = (address: string, credentials: ChannelCredentials, options?: ChannelOptions) => {
  return new (loadClient())(address, credentials, options);
};
