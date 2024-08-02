import dgram from "dgram";

import { synapse } from "../api/api";
import Node from "../node";

const kMulticastTTL = 3;

class StreamOut extends Node {
  type = synapse.NodeType.kStreamOut;
  dataType: synapse.DataType;
  shape: number[];
  multicastGroup: string;
  _socket: dgram.Socket;
  _onMessage: ((msg: Buffer) => void) | null;

  constructor(config: synapse.IStreamOutConfig & { onMessage?: (msg: Buffer) => void } = {}) {
    super();

    const { dataType, shape, multicastGroup, onMessage } = config;
    this.dataType = dataType || synapse.DataType.kDataTypeUnknown;
    this.multicastGroup = multicastGroup;
    this.shape = shape || [];
    this._onMessage = onMessage;
  }

  async start(): Promise<any> {
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

    const host = this.multicastGroup ? this.multicastGroup : split[0];
    if (!host) {
      console.error(`Invalid bind address: ${host}`);
      return false;
    }

    this._socket = dgram.createSocket("udp4");

    this._socket.on("error", (err: any) => {});

    this._socket.on("message", (msg: Buffer, rinfo: any) => {
      console.log(`StreamOut | recv: ${msg.readUInt32BE()}`);
      this._onMessage?.(msg);
    });

    console.log(`Binding to ${host}:${port}`);
    this._socket.bind(port, host, () => {
      if (!this._socket) {
        return;
      }

      if (this.multicastGroup) {
        this._socket.setMulticastTTL(kMulticastTTL);
        this._socket.addMembership(this.multicastGroup);
      }
    });

    return true;
  }

  async stop(): Promise<any> {
    if (this._socket) {
      this._socket.close();
    }

    return true;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      streamOut: {
        dataType: this.dataType,
        shape: this.shape,
        multicastGroup: this.multicastGroup,
        useMulticast: !!this.multicastGroup,
      },
    });
  }

  static fromProto(proto: synapse.INodeConfig): StreamOut {
    const { streamOut } = proto;
    if (!streamOut) {
      throw new Error("Invalid config, missing streamOut");
    }

    const { dataType, shape, multicastGroup, useMulticast } = streamOut;
    return new StreamOut({
      dataType: dataType,
      shape: shape,
      multicastGroup: useMulticast ? multicastGroup : undefined,
    });
  }
}

export default StreamOut;
