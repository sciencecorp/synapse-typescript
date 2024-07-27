import dgram from "dgram";

import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import Node from "../node";

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

    const port = socket.bind;
    const addr = this._getAddr();
    if (!addr || !port) {
      return false;
    }

    if (!this._socket) {
      this._socket = dgram.createSocket("udp4");

      this._socket.on("error", (err: any) => {});
    }

    try {
      this._socket.send(data, port, addr);
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

  _getAddr = (): string | null => {
    if (this.device === null) {
      return null;
    }

    if (this.multicastGroup) {
      return this.multicastGroup;
    }

    return this.device.uri.split(":")[0];
  };

  static fromProto(proto: NodeConfig): StreamIn {
    const { config } = proto;
    if (config !== "streamIn") {
      throw new Error(`Invalid config type: ${config}`);
    }
    const { multicastGroup } = proto.streamIn;
    return new StreamIn({ multicastGroup });
  }
}

export default StreamIn;
