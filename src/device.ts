import { Channel, credentials } from "@grpc/grpc-js";

import { synapse } from "./api/api";
import Config from "./config";
import { create } from "./utils/client";
import { getName } from "./utils/enum";

class Device {
  rpc: any | null = null;
  channel: Channel | null = null;
  sockets: synapse.INodeSocket[] = [];

  constructor(public uri: string) {
    this.rpc = create(uri, credentials.createInsecure());
    if (!this.rpc) {
      throw new Error(`Failed to create client for ${uri}`);
    }
  }

  async configure(config: Config): Promise<boolean> {
    return new Promise((resolve, reject) => {
      config.setDevice(this);

      const proto = config.toProto();
      this.rpc.configure(proto, (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (this._handleStatusResponse(res!)) {
            resolve(true);
          } else {
            reject(`Error configuring device: (code: ${getName(synapse.StatusCode, res.code)}) ${res.message}`);
          }
        }
      });
    });
  }

  async info(): Promise<synapse.DeviceInfo> {
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
            reject(`Error starting device: (code: ${getName(synapse.StatusCode, res.code)}) ${res.message}`);
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
            reject(`Error stopping device: (code: ${getName(synapse.StatusCode, res.code)}) ${res.message}`);
          }
        }
      });
    });
  }

  _handleStatusResponse(status: synapse.Status): boolean {
    const { code, sockets } = status;
    if (code && (code as any) !== synapse.StatusCode.kOk) {
      return false;
    } else {
      this.sockets = sockets || [];
      return true;
    }
  }
}

export default Device;
