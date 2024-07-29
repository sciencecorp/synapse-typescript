import dgram from "dgram";

import { DataType } from "../api/synapse/DataType";
import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import Node from "../node";

const kDefaultStreamInConfig = {
  shape: [2048, 1],
};

export interface StreamInArgs {
  dataType: DataType;
  shape?: number[];
}

class StreamIn extends Node {
  type = NodeType.kStreamIn;
  dataType: DataType;
  shape: number[];
  _socket: dgram.Socket;

  constructor(args: StreamInArgs = { dataType: DataType.kDataTypeUnknown }) {
    super();
    this.dataType = args.dataType || DataType.kDataTypeUnknown;
    this.shape = args.shape || [];
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

  toProto(): NodeConfig {
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

  static fromProto(proto: NodeConfig): StreamIn {
    const { config } = proto;
    if (config !== "streamIn") {
      throw new Error(`Invalid config type: ${config}`);
    }

    const { dataType = DataType.kDataTypeUnknown, shape = [] } = proto.streamIn;
    return new StreamIn({
      dataType,
      shape,
    });
  }
}

export default StreamIn;
