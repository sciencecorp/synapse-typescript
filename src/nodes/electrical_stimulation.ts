import { synapse } from "../api/api";
import Node from "../node";

class ElectricalStimulation extends Node {
  type = synapse.NodeType.kElectricalStim;
  config: synapse.IElectricalStimConfig;

  constructor(config: synapse.IElectricalStimConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      electricalStim: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): ElectricalStimulation {
    const { electricalStim } = proto;
    if (!electricalStim) {
      throw new Error("Invalid config, missing electricalStim");
    }

    return new ElectricalStimulation(proto.electricalStim);
  }
}

export default ElectricalStimulation;
