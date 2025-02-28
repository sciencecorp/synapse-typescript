import { Channel, credentials, ServiceError } from "@grpc/grpc-js";

import { science } from "../api-science-device/api";
import protos from "../api-science-device/proto.json";
import { create } from "./client";
import { Status } from "./status";

const kDeviceAuthService = "science.DeviceAuthService";
const kDeviceUpdateService = "science.SynapseUpdate";

class DeviceManager {
  rpc_auth: any | null = null;
  rpc_update: any | null = null;
  channel: Channel | null = null;

  constructor(public uri: string) {
    const { status: statusAuth, client: clientAuth } = create(protos, kDeviceAuthService)(
      uri,
      credentials.createInsecure()
    );
    if (!statusAuth.ok() || !clientAuth) {
      throw new Error(`Failed to create client for ${uri}: ${statusAuth.message}`);
    }
    this.rpc_auth = clientAuth;

    const { status: statusUpdate, client: clientUpdate } = create(protos, kDeviceUpdateService)(
      uri,
      credentials.createInsecure()
    );
    if (!statusUpdate.ok() || !clientUpdate) {
      throw new Error(`Failed to create client for ${uri}: ${statusUpdate.message}`);
    }
    this.rpc_update = clientUpdate;
  }

  // Authentication

  async authenticateDevice(
    args: science.IDeviceAuthenticationRequest
  ): Promise<{ status: Status; response?: science.DeviceAuthenticationResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc_auth.authenticateDevice(args, (err: ServiceError, response: science.DeviceAuthenticationResponse) => {
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
      this.rpc_auth.listKeys(args, (err: ServiceError, response: science.ListKeysResponse) => {
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
      this.rpc_auth.revokeKey(args, (err: ServiceError, response: science.RevokeKeyResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }

  // Update

  async listPackages(
    args: science.IListPackagesRequest
  ): Promise<{ status: Status; response?: science.ListPackagesResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc_update.listPackages(args, (err: ServiceError, response: science.ListPackagesResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }

  async updatePackages(
    args: science.IUpdatePackagesRequest
  ): Promise<{ status: Status; response?: science.UpdateResult }> {
    return new Promise((resolve, reject) => {
      this.rpc_update.updatePackages(args, (err: ServiceError, response: science.UpdateResult) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }

  async uploadPackage(args: science.IUpdatePackageChunk): Promise<{ status: Status; response?: science.UpdateResult }> {
    return new Promise((resolve, reject) => {
      this.rpc_update.uploadPackage(args, (err: ServiceError, response: science.UpdateResult) => {
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
