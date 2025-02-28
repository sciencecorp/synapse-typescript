import { Channel, credentials, ServiceError } from "@grpc/grpc-js";

import { science } from "../api-science-device/api";
import protos from "../api-science-device/proto.json";
import { create } from "./client";
import { Status } from "./status";

const kDeviceManagementService = "science.DeviceAuthService";
class DeviceManager {
  rpc: any | null = null;
  channel: Channel | null = null;

  constructor(public uri: string) {
    const { status, client } = create(protos, kDeviceManagementService)(uri, credentials.createInsecure());
    if (!status.ok() || !client) {
      throw new Error(`Failed to create client for ${uri}: ${status.message}`);
    }
    this.rpc = client;
  }

  async authenticateDevice(
    args: science.IDeviceAuthenticationRequest
  ): Promise<{ status: Status; response?: science.DeviceAuthenticationResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc.authenticateDevice(args, (err: ServiceError, response: science.DeviceAuthenticationResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }

  async listKeys(args: science.IListKeysRequest): Promise<{ status: Status; response?: science.ListKeysResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc.listKeys(args, (err: ServiceError, response: science.ListKeysResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }

  async revokeKey(args: science.IRevokeKeyRequest): Promise<{ status: Status; response?: science.RevokeKeyResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc.revokeKey(args, (err: ServiceError, response: science.RevokeKeyResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }
}

export default DeviceManager;
