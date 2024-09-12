import { synapse } from "../api/api";
import Node from "../node";

class OpticalBroadband extends Node {
  type = synapse.NodeType.kOpticalBroadband;
  config: synapse.IOpticalBroadbandConfig;

  constructor(config: synapse.IOpticalBroadbandConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      opticalBroadband: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): OpticalBroadband {
    const { opticalBroadband } = proto;
    if (!opticalBroadband) {
      throw new Error("Invalid config, missing opticalBroadband");
    }

    return new OpticalBroadband(proto.opticalBroadband);
  }
}

export default OpticalBroadband;
