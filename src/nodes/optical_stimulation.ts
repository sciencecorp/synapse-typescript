import { synapse } from "../api/api";
import ChannelMask from "../channel_mask";
import Node from "../node";

class OpticalStimulation extends Node {
  type = synapse.NodeType.kOpticalStim;
  config: Omit<synapse.IOpticalStimConfig, "pixelMask"> & {
    pixelMask?: ChannelMask;
  };

  constructor(config: synapse.IOpticalStimConfig = {}) {
    super();

    const { pixelMask, ...rest } = config;
    this.config = {
      ...rest,
      pixelMask: new ChannelMask(pixelMask || []),
    };
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      opticalStim: {
        ...this.config,
        pixelMask: Array.from(this.config.pixelMask.iterChannels() || []),
      },
    });
  }

  static fromProto(proto: synapse.INodeConfig): OpticalStimulation {
    const { opticalStim } = proto;
    if (!opticalStim) {
      throw new Error("Invalid config, missing opticalStim");
    }

    return new OpticalStimulation(proto.opticalStim);
  }
}

export default OpticalStimulation;
