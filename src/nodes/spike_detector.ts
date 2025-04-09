import { synapse } from "../api/api";
import Node from "../node";

class SpikeDetector extends Node {
  type = synapse.NodeType.kSpikeDetector;
  config: synapse.ISpikeDetectorConfig;

  constructor(config: synapse.ISpikeDetectorConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      spikeDetector: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): SpikeDetector {
    const { spikeDetector } = proto;
    if (!spikeDetector) {
      throw new Error("Invalid config, missing spikeDetector");
    }

    return new SpikeDetector(proto.spikeDetector);
  }
}

export default SpikeDetector;
