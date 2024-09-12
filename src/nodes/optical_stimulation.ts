import { synapse } from "../api/api";
import Node from "../node";

class OpticalStimulation extends Node {
  type = synapse.NodeType.kOpticalStim;
  config: synapse.IOpticalStimConfig;

  constructor(config: synapse.IOpticalStimConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      opticalStim: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): OpticalStimulation {
    const { opticalStim } = proto;
    if (!opticalStim) {
      throw new Error("Invalid config, missing opticalStim");
    }

    return new OpticalStimulation(proto.opticalStim);
  }
}

export default OpticalStimulation;
