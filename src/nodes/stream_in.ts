import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import Node from "../node";

import zmq from "zeromq";

const kDefaultStreamInConfig = {
  shape: [2048, 1],
};

class StreamIn extends Node {
  type = NodeType.kStreamIn;
  pub: zmq.Publisher;

  constructor() {
    super();
    this.pub = new zmq.Publisher();
  }

  write(data: string): boolean {
    if (this.device === null) {
      return false;
    }

    const socket = this.device.sockets.find((s) => s.nodeId === this.id);
    if (!socket) {
      return false;
    }

    this.pub.connect(socket.bind);

    try {
      this.pub.send(data);
    } catch (e) {
      console.error(`Error sending data: ${e}`);
    }

    return true;
  }

  toProto(): NodeConfig {
    return super.toProto({
      streamIn: kDefaultStreamInConfig,
    });
  }
}

export default StreamIn;
