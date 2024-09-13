import { synapse } from "../api/api";
import Node from "../node";

class ElectricalBroadband extends Node {
  type = synapse.NodeType.kElectricalBroadband;
  config: synapse.IElectricalBroadbandConfig;

  constructor(config: synapse.IElectricalBroadbandConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      electricalBroadband: this.config,
    });
  }

  static fromProto(proto: synapse.NodeConfig): ElectricalBroadband {
    const { electricalBroadband } = proto;
    if (!electricalBroadband) {
      throw new Error("Invalid config, missing electricalBroadband");
    }

    return new ElectricalBroadband(proto.electricalBroadband);
  }
}

export default ElectricalBroadband;
