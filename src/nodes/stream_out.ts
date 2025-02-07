import dgram from "dgram";

import { synapse } from "../api/api";
import Node from "../node";

const kMulticastTTL = 3;

class StreamOut extends Node {
  type = synapse.NodeType.kStreamOut;
  config: synapse.IStreamOutConfig;
  _socket: dgram.Socket;
  _onMessage: ((msg: Buffer) => void) | null;

  constructor(config: synapse.IStreamOutConfig, onMessage?: (msg: Buffer) => void) {
    super();

    this.config = config;
    this._onMessage = onMessage;
  }

  async start(): Promise<boolean> {
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

    const host = this.config.multicastGroup;
    if (!host) {
      return false;
    }

    this._socket = dgram.createSocket("udp4");

    this._socket.on("error", () => {});

    this._socket.on("message", (msg: Buffer) => {
      this._onMessage?.(msg);
    });

    this._socket.bind(port, host, () => {
      if (!this._socket) {
        return;
      }

      if (this.config.multicastGroup) {
        this._socket.setMulticastTTL(kMulticastTTL);
        this._socket.addMembership(this.config.multicastGroup);
      }
    });

    return true;
  }

  async stop(): Promise<boolean> {
    if (this._socket) {
      this._socket.close();
    }

    return true;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      streamOut: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): StreamOut {
    const { streamOut } = proto;
    if (!streamOut) {
      throw new Error("Invalid config, missing streamOut");
    }

    return new StreamOut(streamOut);
  }
}

export default StreamOut;
