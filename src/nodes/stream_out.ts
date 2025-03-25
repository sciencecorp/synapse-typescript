import dgram from "dgram";

import { synapse } from "../api/api";
import Node from "../node";
import { Status, StatusCode } from "../utils/status";
import { getClientIp } from "../utils/ip";

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

  constructor(
    config: synapse.IStreamOutConfig,
    callbacks?: { onMessage?: (msg: Buffer) => void; onError?: (error: Error) => void }
  ) {
    super();

    const { udpUnicast } = config || {};
    this._destinationAddress = udpUnicast?.destinationAddress;
    this._destinationPort = udpUnicast?.destinationPort || kDefaultStreamOutPort;
    this._label = config.label;
    this._onMessage = callbacks?.onMessage;
    this._onError = callbacks?.onError;
  }

  async start(): Promise<Status> {
    try {
      this._socket = dgram.createSocket("udp4");

      if (!this._destinationAddress) {
        try {
          const ip = await getClientIp();
          if (!ip) {
            return new Status(StatusCode.INTERNAL, "failed to get client ip");
          }
          this._destinationAddress = ip;
        } catch (e) {
          console.error(e);
          return new Status(StatusCode.INTERNAL, `failed to get client ip: ${e}`);
        }
      }
      if (!this._destinationPort) {
        this._destinationPort = kDefaultStreamOutPort;
      }

      this._socket.on("message", (msg: Buffer) => {
        this._onMessage?.(msg);
      });

      this._socket.on("error", (error: Error) => {
        this._onError?.(error);
      });

      await new Promise<void>((resolve, reject) => {
        if (!this._socket) return reject(new Error("Socket is null"));

        this._socket.bind(this._destinationPort, this._destinationAddress, () => {
          this._socket.setRecvBufferSize(kSocketBufferSize);
          resolve();
        });
      });

      return new Status();
    } catch (e) {
      return new Status(StatusCode.INTERNAL, `failed to start stream out node: ${e}`);
    }
  }

  async stop(): Promise<Status> {
    if (this._socket) {
      this._socket.close();
    }

    return new Status();
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
