import { synapse } from "../api/api";
import Node from "../node";

class BroadbandSource extends Node {
  type = synapse.NodeType.kBroadbandSource;
  config: synapse.IBroadbandSourceConfig;

  constructor(config: synapse.IBroadbandSourceConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      broadbandSource: this.config,
    });
  }

  static fromProto(proto: synapse.NodeConfig): BroadbandSource {
    const { broadbandSource } = proto;
    if (!broadbandSource) {
      throw new Error("Invalid config, missing broadbandSource");
    }

    return new BroadbandSource(proto.broadbandSource);
  }
}

export default BroadbandSource;
