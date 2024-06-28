import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import ChannelMask from "../channel_mask";
import Node from "../node";

const kDefaultOpticalStimConfig = {
  bit_width: 10,
  gain: 1,
  peripheral_id: 0,
  sample_rate: 20000,
};

class OpticalStimulation extends Node {
  type = NodeType.kOpticalStim;
  channelMask: ChannelMask;

  constructor(channelMask = new ChannelMask()) {
    super();
    this.channelMask = channelMask;
  }

  toProto(): NodeConfig {
    return super.toProto({
      opticalStim: {
        ...kDefaultOpticalStimConfig,
        pixelMask: Array.from(this.channelMask.iterChannels()),
      },
    });
  }
}

export default OpticalStimulation;
