import { ChannelCredentials, ChannelOptions } from "@grpc/grpc-js";
import { SynapseDeviceClient } from "../api/api/synapse_grpc_pb";
import type { SynapseDeviceClient as ISynapseDeviceClient } from "../api/synapse/SynapseDevice";

export const create = (
  address: string,
  credentials: ChannelCredentials,
  options?: ChannelOptions
): ISynapseDeviceClient => {
  return new SynapseDeviceClient(
    address,
    credentials,
    options
  ) as unknown as ISynapseDeviceClient;
};
