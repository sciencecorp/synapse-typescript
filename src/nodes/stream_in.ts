import dgram from "dgram";

import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import Node from "../node";
import { parseAddress } from "../utils/addr";

const kDefaultStreamInConfig = {
  shape: [2048, 1],
};

export interface StreamInArgs {
  shape?: number[];
  multicastGroup?: string;
}

class StreamIn extends Node {
  type = NodeType.kStreamIn;
  multicastGroup: string;
  _socket: dgram.Socket;

  constructor(args: StreamInArgs) {
    super();
    this.multicastGroup = args.multicastGroup || null;
  }

  write(data: string | Buffer): boolean {
    if (this.device === null) {
      return false;
    }

    const socket = this.device.sockets.find((s) => s.nodeId === this.id);
    if (!socket) {
      return false;
    }

    const addr = parseAddress(socket.bind);
    if (!addr.host || !addr.port) {
      return false;
    }

    if (!this._socket) {
      this._socket = dgram.createSocket("udp4");

      this._socket.on("error", (err: any) => {});
    }

    try {
      this._socket.send(data, addr.port, addr.host);
    } catch (e) {
      return false;
    }

    return true;
  }

  toProto(): NodeConfig {
    return super.toProto({
      streamIn: {
        ...kDefaultStreamInConfig,
        multicastGroup: this.multicastGroup,
      },
    });
  }
}

export default StreamIn;
