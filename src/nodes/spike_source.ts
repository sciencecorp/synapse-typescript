import { synapse } from "../api/api";
import Node from "../node";

class SpikeSource extends Node {
  type = synapse.NodeType.kSpikeSource;
  config: synapse.ISpikeSourceConfig;

  constructor(config: synapse.ISpikeSourceConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      spikeSource: this.config,
    });
  }

  static fromProto(proto: synapse.NodeConfig): SpikeSource {
    const { spikeSource } = proto;
    if (!spikeSource) {
      throw new Error("Invalid config, missing spikeSource");
    }

    return new SpikeSource(proto.spikeSource);
  }
}

export default SpikeSource;
