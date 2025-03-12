import dgram from "dgram";

import { synapse } from "../api/api";
import Node from "../node";

const kDefaultStreamOutPort = 50038;
const kSocketBufferSize = 5 * 1024 * 1024; // 5MB

class StreamOut extends Node {
  type = synapse.NodeType.kStreamOut;
  _destinationAddress: string;
  _destinationPort: number;
  _label: string;
  _socket: dgram.Socket | null;
  _onMessage: ((msg: Buffer) => void) | null;
  _onError: ((error: Error) => void) | null;

  constructor(config: synapse.IStreamOutConfig, onMessage?: (msg: Buffer) => void, onError?: (error: Error) => void) {
    super();

    const { udpUnicast } = config || {};
    this._destinationAddress = udpUnicast?.destinationAddress || this.getClientIp() || "127.0.0.1";
    this._destinationPort = udpUnicast?.destinationPort || kDefaultStreamOutPort;
    this._label = config.label;
    this._onMessage = onMessage;
  }

  private getClientIp(): string | null {
    try {
      const socket = dgram.createSocket("udp4");
      socket.bind(0);

      socket.send(Buffer.from([]), 0, 0, 53, "8.8.8.8", () => {});

      const address = socket.address();
      socket.close();
      return address.address;
    } catch (e) {
      return null;
    }
  }

  async start(): Promise<boolean> {
    try {
      this._socket = dgram.createSocket("udp4");

      this._socket.on("message", (msg: Buffer) => {
        this._onMessage?.(msg);
      });

      this._socket.on("error", (error: Error) => {
        this._onError?.(error);
      });

      await new Promise<void>((resolve, reject) => {
        if (!this._socket) return reject(new Error("Socket is null"));

        this._socket.bind(this._destinationPort, this._destinationAddress, () => {
          resolve();
        });

        this._socket.setRecvBufferSize(kSocketBufferSize);
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  async stop(): Promise<boolean> {
    if (this._socket) {
      this._socket.close();
    }

    return true;
  }

  toProto(): synapse.NodeConfig {
    const config: synapse.IStreamOutConfig = {
      label: this._label,
      udpUnicast: {
        destinationAddress: this._destinationAddress,
        destinationPort: this._destinationPort,
      },
    };

    return super.toProto({
      streamOut: config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): StreamOut {
    const { streamOut } = proto;
    if (!streamOut) {
      throw new Error("Invalid config, missing streamOut");
    }

    return new StreamOut(streamOut, undefined);
  }
}

export default StreamOut;
