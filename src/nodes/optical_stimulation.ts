import { synapse } from "../api/api";
import Node from "../node";

class OpticalStimulation extends Node {
  type = synapse.NodeType.kOpticalStimulation;
  config: synapse.IOpticalStimulationConfig;

  constructor(config: synapse.IOpticalStimulationConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      opticalStimulation: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): OpticalStimulation {
    const { opticalStimulation } = proto;
    if (!opticalStimulation) {
      throw new Error("Invalid config, missing opticalStimulation");
    }

    return new OpticalStimulation(proto.opticalStimulation);
  }
}

export default OpticalStimulation;
