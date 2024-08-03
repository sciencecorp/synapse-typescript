import { synapse } from "../api/api";
import ChannelMask from "../channel_mask";
import Node from "../node";

class ElectricalBroadband extends Node {
  type = synapse.NodeType.kElectricalBroadband;

  config: Omit<synapse.IElectricalBroadbandConfig, "chMask"> & {
    chMask?: ChannelMask;
  };

  constructor(config: synapse.IElectricalBroadbandConfig = {}) {
    super();

    const { chMask, ...rest } = config;
    this.config = {
      ...rest,
      chMask: new ChannelMask(chMask || []),
    };
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      electricalBroadband: {
        ...this.config,
        chMask: Array.from(this.config.chMask?.iterChannels() || []),
      },
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
