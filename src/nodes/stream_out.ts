import dgram from "dgram";

import { NodeConfig } from "../api/synapse/NodeConfig";
import { NodeType } from "../api/synapse/NodeType";
import ChannelMask from "../channel_mask";
import Node from "../node";

const kMulticastTTL = 3;

export interface StreamOutArgs {
  channelMask?: ChannelMask;
  multicastGroup?: string;
  onMessage?: (msg: Buffer) => void;
}

class StreamOut extends Node {
  type = NodeType.kStreamOut;
  channelMask: ChannelMask;
  multicastGroup: string;
  _socket: dgram.Socket;
  _onMessage: ((msg: Buffer) => void) | null;

  constructor(args: StreamOutArgs = { channelMask: new ChannelMask() }) {
    super();

    const { channelMask, multicastGroup, onMessage } = args;
    this.channelMask = channelMask;
    this.multicastGroup = multicastGroup;
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

    const port = socket.bind;
    const addr = this._getAddr();
    if (!addr) {
      console.error(`Invalid bind address: ${addr}`);
      return false;
    }

    this._socket = dgram.createSocket("udp4");

    this._socket.on("error", (err: any) => {});

    this._socket.on("message", (msg: Buffer, rinfo: any) => {
      this._onMessage?.(msg);
    });

    this._socket.bind(port, addr, () => {
      if (!this._socket) {
        return;
      }

      if (this.multicastGroup) {
        this._socket.setMulticastTTL(kMulticastTTL);
        this._socket.addMembership(addr);
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

  toProto(): NodeConfig {
    return super.toProto({
      streamOut: {
        chMask: this.channelMask ? Array.from(this.channelMask.iterChannels()) : null,
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
}

export default StreamOut;
