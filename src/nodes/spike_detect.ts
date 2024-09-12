import { synapse } from "../api/api";
import Node from "../node";

class SpikeDetect extends Node {
  type = synapse.NodeType.kSpikeDetect;
  config: synapse.ISpikeDetectConfig;

  constructor(config: synapse.ISpikeDetectConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      spikeDetect: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): SpikeDetect {
    const { spikeDetect } = proto;
    if (!spikeDetect) {
      throw new Error("Invalid config, missing spikeDetect");
    }

    return new SpikeDetect(proto.spikeDetect);
  }
}

export default SpikeDetect;
