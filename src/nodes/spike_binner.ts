import { synapse } from "../api/api";
import Node from "../node";

class SpikeBinner extends Node {
  type = synapse.NodeType.kSpikeBinner;
  config: synapse.ISpikeBinnerConfig;

  constructor(config: synapse.ISpikeBinnerConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      spikeBinner: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): SpikeBinner {
    const { spikeBinner } = proto;
    if (!spikeBinner) {
      throw new Error("Invalid config, missing spikeBinner");
    }

    return new SpikeBinner(proto.spikeBinner);
  }
}

export default SpikeBinner;
