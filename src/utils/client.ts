import path from "path";
import { ChannelCredentials, ChannelOptions, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";

const PROTO_DIR = path.resolve(__dirname, "../synapse-api");
const PROTO_FILE = `api/synapse.proto`;
let DEFINITION = null;

const loadClient = () => {
  if (!DEFINITION) {
    try {
      DEFINITION = loadSync(PROTO_FILE, {
        keepCase: false,
        arrays: true,
        enums: Number,
        defaults: true,
        oneofs: true,
        includeDirs: [PROTO_DIR],
      });
    } catch (error) {
      const msg = `Failed to load proto definition from ${PROTO_DIR} with error: ${error}`;
      console.error(msg);
      throw new Error(msg);
    }
  }
  console.log(`Attempting to load proto definition ${PROTO_FILE} from ${PROTO_DIR}`);
  const descriptor = loadPackageDefinition(DEFINITION);
  return (descriptor.synapse as any).SynapseDevice;
};

export const create = (address: string, credentials: ChannelCredentials, options?: ChannelOptions) => {
  return new (loadClient())(address, credentials, options);
};
