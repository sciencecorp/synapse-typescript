import { Channel, credentials } from "@grpc/grpc-js";

import gpe from "google-protobuf/google/protobuf/empty_pb.js";

import { Status } from "./api/synapse/Status";
import { StatusCode } from "./api/synapse/StatusCode";
import Config from "./config";
import { create } from "./utils/client";
import { SynapseDeviceClient } from "./api/synapse/SynapseDevice";
import { DeviceConfiguration } from "./api/synapse/DeviceConfiguration";

class Device {
  rpc: SynapseDeviceClient;
  channel: Channel;
  sockets: any = null;

  constructor(public uri: string) {
    this.rpc = create(this.uri, credentials.createInsecure());
  }

  async configure(config: Config): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.rpc.configure(config.toProto(), (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (this._handleStatusResponse(res!)) {
            resolve(true);
          } else {
            reject("Error configuring device");
          }
        }
      });
    });
  }

  async info(): Promise<DeviceConfiguration> {
    // TODO(antoniae)
    return new Promise((resolve, reject) => {
      this.rpc.info(new gpe.Empty(), (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res as DeviceConfiguration);
        }
      });
    });
  }

  async start(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.rpc.start(new gpe.Empty(), (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (this._handleStatusResponse(res!)) {
            resolve(true);
          } else {
            reject("Error starting device");
          }
        }
      });
    });
  }

  async stop(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.rpc.stop(new gpe.Empty(), (err, res) => {
        if (err) {
          reject(err);
        } else {
          if (this._handleStatusResponse(res!)) {
            resolve(true);
          } else {
            reject("Error stopping device");
          }
        }
      });
    });
  }

  _handleStatusResponse(status: Status): boolean {
    if (status.code !== StatusCode.kOk) {
      console.log(`Error ${status.code}: ${status.message}`);
      return false;
    } else {
      this.sockets = status.sockets;
      return true;
    }
  }
}

export default Device;
