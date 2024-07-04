import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import Node from "../node";

const kDefaultStreamInConfig = {
  shape: [2048, 1],
};

class StreamIn extends Node {
  type = NodeType.kStreamIn;

  constructor() {
    super();
  }

  write(data: string): boolean {
    if (this.device === null) {
      return false;
    }

    const socket = this.device.sockets.find((s) => s.nodeId === this.id);
    if (!socket) {
      return false;
    }

    try {
      return false;
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
