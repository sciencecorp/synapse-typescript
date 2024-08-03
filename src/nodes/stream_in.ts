import dgram from "dgram";

import { synapse } from "../api/api";
import Node from "../node";

const kDefaultStreamInConfig = {
  shape: [2048, 1],
};

export interface StreamInArgs {
  dataType: synapse.DataType;
  shape?: number[];
}

class StreamIn extends Node {
  type = synapse.NodeType.kStreamIn;
  dataType: synapse.DataType;
  shape: number[];
  _socket: dgram.Socket;

  constructor(config: synapse.IStreamInConfig = {}) {
    super();
    this.dataType = config.dataType || synapse.DataType.kDataTypeUnknown;
    this.shape = config.shape || [];
  }

  write(data: string | Buffer): boolean {
    if (this.device === null) {
      return false;
    }

    const socket = this.device.sockets.find((s) => s.nodeId === this.id);
    if (!socket) {
      return false;
    }

    const split = socket.bind.split(":");
    if (split.length !== 2) {
      return false;
    }

    const port = parseInt(split[1]);
    if (isNaN(port)) {
      return false;
    }

    const host = split[0];
    if (!host || !port) {
      return false;
    }

    if (!this._socket) {
      this._socket = dgram.createSocket("udp4");
    }

    try {
      this._socket.send(data, port, host);
    } catch (e) {
      return false;
    }

    return true;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      streamIn: {
        ...kDefaultStreamInConfig,
        dataType: this.dataType,
        shape: this.shape,
      },
    });
  }

  _getAddr = (): string | null => {
    if (this.device === null) {
      return null;
    }

    return this.device.uri.split(":")[0];
  };

  static fromProto(proto: synapse.INodeConfig): StreamIn {
    const { streamIn } = proto;
    if (!streamIn) {
      throw new Error("Invalid config, missing streamIn");
    }

    const { dataType = synapse.DataType.kDataTypeUnknown, shape = [] } = proto.streamIn;
    return new StreamIn({
      dataType,
      shape,
    });
  }
}

export default StreamIn;
