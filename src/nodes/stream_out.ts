import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import ChannelMask from "../channel_mask";
import Node from "../node";

import zmq from "zeromq";

class StreamOut extends Node {
  type = NodeType.kStreamOut;
  channelMask: ChannelMask;
  ctx: zmq.Context;

  constructor(channelMask = new ChannelMask()) {
    super();
    this.ctx = new zmq.Context();
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

    const sub = new zmq.Subscriber({ context: this.ctx });
    sub.connect(socket.bind);
    sub.subscribe("");
    return await sub.receive();
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
