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
}

export default ElectricalBroadband;
