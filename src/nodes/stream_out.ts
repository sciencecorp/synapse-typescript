import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import ChannelMask from "../channel_mask";
import Node from "../node";

class StreamOut extends Node {
  type = NodeType.kStreamOut;
  channelMask: ChannelMask;

  constructor(channelMask = new ChannelMask()) {
    super();
    this.channelMask = channelMask;
  }

  async read(): Promise<any> {
    if (this.device === null) {
      return false;
    }

    const socket = this.device.sockets.find((s) => s.nodeId === this.id);
    if (!socket) {
      return false;
    }

    return false;
  }

  toProto(): NodeConfig {
    return super.toProto({
      streamOut: {
        chMask: Array.from(this.channelMask.iterChannels()),
      },
    });
  }
}

export default StreamOut;
