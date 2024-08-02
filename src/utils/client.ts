import { ChannelCredentials, ChannelOptions, loadPackageDefinition } from "@grpc/grpc-js";
import { fromJSON } from "@grpc/proto-loader";

import protoJson from "../api/proto.json";

const loadClient = () => {
  const definition = fromJSON(protoJson as any, {
    keepCase: false,
    arrays: true,
    enums: Number,
    defaults: true,
    oneofs: true,
  });
  const descriptor = loadPackageDefinition(definition as any);
  return (descriptor.synapse as any).SynapseDevice;
};

export const create = (address: string, credentials: ChannelCredentials, options?: ChannelOptions) => {
  return new (loadClient())(address, credentials, options);
};
