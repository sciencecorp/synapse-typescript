import { synapse } from "api/synapse";
import ChannelMask from "../channel_mask";
import Node from "../node";

const kDefaultElectricalBroadbandConfig = {
  bit_width: 10,
  gain: 1,
  peripheral_id: 0,
  sample_rate: 20000,
};

class ElectricalBroadband extends Node {
  channelMask: ChannelMask;
  type: synapse.NodeType.kElectricalBroadband;

  constructor(channelMask = new ChannelMask("all")) {
    super();
    this.channelMask = channelMask;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      electricalBroadband: {
        ...kDefaultElectricalBroadbandConfig,
        chMask: Array.from(this.channelMask.iterChannels()),
      },
    });
  }
}

export default ElectricalBroadband;
