import { ElectricalBroadbandConfig } from "../api/synapse/ElectricalBroadbandConfig";
import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import ChannelMask from "../channel_mask";
import Node from "../node";

class ElectricalBroadband extends Node {
  type = NodeType.kElectricalBroadband;

  config: Omit<ElectricalBroadbandConfig, "chMask"> & {
    chMask?: ChannelMask;
  };

  constructor(config: ElectricalBroadbandConfig = {}) {
    super();

    const { chMask, ...rest } = config;
    this.config = {
      ...rest,
      chMask: new ChannelMask(chMask || []),
    };
  }

  toProto(): NodeConfig {
    return super.toProto({
      electricalBroadband: {
        ...this.config,
        chMask: Array.from(this.config.chMask?.iterChannels() || []),
      },
    });
  }

  static fromProto(proto: NodeConfig): ElectricalBroadband {
    const { config } = proto;
    if (config !== "electricalBroadband") {
      throw new Error(`Invalid config type: ${config}`);
    }
    return new ElectricalBroadband(proto.electricalBroadband);
  }
}

export default ElectricalBroadband;
