import { OpticalStimConfig } from "../api/synapse/OpticalStimConfig";
import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import ChannelMask from "../channel_mask";
import Node from "../node";

class OpticalStimulation extends Node {
  type = NodeType.kOpticalStim;
  config: Omit<OpticalStimConfig, "pixelMask"> & {
    pixelMask?: ChannelMask;
  };

  constructor(config: OpticalStimConfig = {}) {
    super();

    const { pixelMask, ...rest } = config;
    this.config = {
      ...rest,
      pixelMask: new ChannelMask(pixelMask || []),
    };
  }

  toProto(): NodeConfig {
    return super.toProto({
      opticalStim: {
        ...this.config,
        pixelMask: Array.from(this.config.pixelMask.iterChannels() || []),
      },
    });
  }

  static fromProto(proto: NodeConfig): OpticalStimulation {
    const { config } = proto;
    if (config !== "opticalStim") {
      throw new Error(`Invalid config type: ${config}`);
    }
    return new OpticalStimulation(proto.opticalStim);
  }
}

export default OpticalStimulation;
