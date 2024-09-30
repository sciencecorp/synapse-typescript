import { synapse } from "../api/api";
import Node from "../node";

class ElectricalStimulation extends Node {
  type = synapse.NodeType.kElectricalStimulation;
  config: synapse.IElectricalStimulationConfig;

  constructor(config: synapse.IElectricalStimulationConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      electricalStimulation: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): ElectricalStimulation {
    const { electricalStimulation } = proto;
    if (!electricalStimulation) {
      throw new Error("Invalid config, missing electricalStimulation");
    }

    return new ElectricalStimulation(proto.electricalStimulation);
  }
}

export default ElectricalStimulation;
