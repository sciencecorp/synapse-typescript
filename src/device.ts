import { Channel, credentials } from "@grpc/grpc-js";

import { DeviceInfo } from "./api/synapse/DeviceInfo";
import { NodeSocket } from "./api/synapse/NodeSocket";
import { Status } from "./api/synapse/Status";
import { StatusCode } from "./api/synapse/StatusCode";
import Config from "./config";
import { create } from "./utils/client";
import { getName } from "./utils/enum";

class Device {
  rpc: any | null = null;
  channel: Channel | null = null;
  sockets: NodeSocket[] = [];

  constructor(public uri: string) {
    this.rpc = create(uri, credentials.createInsecure());
    if (!this.rpc) {
      throw new Error(`Failed to create client for ${uri}`);
    }
  }

  async configure(config: Config): Promise<boolean> {
    return new Promise((resolve, reject) => {
      config.setDevice(this);

      this.rpc.configure(config.toProto(), (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (this._handleStatusResponse(res!)) {
            resolve(true);
          } else {
            const { status } = res;
            reject(`Error configuring device: (code: ${getName(StatusCode, status.code)}) ${status.message}`);
          }
        }
      });
    });
  }

  async info(): Promise<DeviceInfo> {
    return new Promise((resolve, reject) => {
      this.rpc.info({}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res!);
        }
      });
    });
  }

  async start(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.rpc.start({}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (this._handleStatusResponse(res!)) {
            resolve(true);
          } else {
            const { status } = res;
            reject(`Error starting device: (code: ${getName(StatusCode, status.code)}) ${status.message}`);
          }
        }
      });
    });
  }

  async stop(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.rpc.stop({}, (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (this._handleStatusResponse(res!)) {
            resolve(true);
          } else {
            const { status } = res;
            reject(`Error stopping device: (code: ${getName(StatusCode, status.code)}) ${status.message}`);
          }
        }
      });
    });
  }

  _handleStatusResponse(status: Status): boolean {
    if (status.code !== StatusCode.kOk) {
      return false;
    } else {
      this.sockets = status.sockets || [];
      return true;
    }
  }
}

export default Device;
