import { Channel, credentials, ServiceError } from "@grpc/grpc-js";

import { science } from "../api-science-device/api";
import protos from "../api-science-device/proto.json";
import { CallOptions, create } from "./client";
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
    request: science.IDeviceAuthenticationRequest,
    options?: CallOptions
  ): Promise<{ status: Status; response?: science.DeviceAuthenticationResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc_auth.authenticateDevice(
        request,
        options,
        (err: ServiceError, response: science.DeviceAuthenticationResponse) => {
          if (err) {
            reject(err);
          } else {
            resolve({ status: new Status(), response });
          }
        }
      );
    });
  }

  async listKeys(
    request: science.IListKeysRequest,
    options?: CallOptions
  ): Promise<{ status: Status; response?: science.ListKeysResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc_auth.listKeys(request, options, (err: ServiceError, response: science.ListKeysResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }

  async revokeKey(
    request: science.IRevokeKeyRequest,
    options?: CallOptions
  ): Promise<{ status: Status; response?: science.RevokeKeyResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc_auth.revokeKey(request, options, (err: ServiceError, response: science.RevokeKeyResponse) => {
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
    request: science.IListPackagesRequest,
    options?: CallOptions
  ): Promise<{ status: Status; response?: science.ListPackagesResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc_update.listPackages(request, options, (err: ServiceError, response: science.ListPackagesResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }

  async updatePackages(
    request: science.IUpdatePackagesRequest,
    options?: CallOptions
  ): Promise<{ status: Status; response?: science.UpdateResult }> {
    return new Promise((resolve, reject) => {
      this.rpc_update.updatePackages(request, options, (err: ServiceError, response: science.UpdateResult) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response });
        }
      });
    });
  }

  async uploadPackage(
    request: science.IUpdatePackageChunk,
    options?: CallOptions
  ): Promise<{ status: Status; response?: science.UpdateResult }> {
    return new Promise((resolve, reject) => {
      this.rpc_update.uploadPackage(request, options, (err: ServiceError, response: science.UpdateResult) => {
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
