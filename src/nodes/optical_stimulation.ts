import { synapse } from "api/synapse";
import ChannelMask from "../channel_mask";
import Node from "../node";

const kDefaultOpticalStimConfig = {
  bit_width: 10,
  gain: 1,
  peripheral_id: 0,
  sample_rate: 20000,
};

class OpticalStimulation extends Node {
  channelMask: ChannelMask;
  type: synapse.NodeType.kOpticalStim;

  constructor(channelMask = new ChannelMask("all")) {
    super();
    this.channelMask = channelMask;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      opticalStim: {
        ...kDefaultOpticalStimConfig,
        pixelMask: Array.from(this.channelMask.iterChannels()),
      },
    });
  }
}

export default OpticalStimulation;
