import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import ChannelMask from "../channel_mask";
import Node from "../node";

const kDefaultElectricalBroadbandConfig = {
  bit_width: 10,
  gain: 1,
  peripheral_id: 0,
  sample_rate: 20000,
};

class ElectricalBroadband extends Node {
  type = NodeType.kElectricalBroadband;
  channelMask: ChannelMask;

  constructor(channelMask = new ChannelMask()) {
    super();
    this.channelMask = channelMask;
  }

  toProto(): NodeConfig {
    return super.toProto({
      electricalBroadband: {
        ...kDefaultElectricalBroadbandConfig,
        chMask: Array.from(this.channelMask.iterChannels()),
      },
    });
  }

  static fromProto(proto: NodeConfig): ElectricalBroadband {
    const { config } = proto;
    if (config !== "electricalBroadband") {
      throw new Error(`Invalid config type: ${config}`);
    }
    return new ElectricalBroadband(new ChannelMask());
  }
}

export default ElectricalBroadband;
