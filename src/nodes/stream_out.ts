import { synapse } from "api/synapse";
import ChannelMask from "../channel_mask";
import Node from "../node";

import zmq from "zeromq";

class StreamOut extends Node {
  channelMask: ChannelMask;
  ctx: zmq.Context;
  type: synapse.NodeType.kStreamOut;

  constructor(channelMask = new ChannelMask("all")) {
    super();
    this.ctx = new zmq.Context();
    this.channelMask = channelMask;
  }

  async read(): Promise<any> {
    if (this.device === null) {
      return false;
    }

    const socket = this.device.sockets.find((s) => s.node_id === this.id);
    if (!socket) {
      return false;
    }

    const sub = new zmq.Subscriber({ context: this.ctx });
    sub.connect(socket.bind);
    sub.subscribe("");
    return await sub.receive();
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      streamOut: {
        chMask: Array.from(this.channelMask.iterChannels()),
      },
    });
  }
}

export default StreamOut;
