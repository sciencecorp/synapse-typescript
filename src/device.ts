import { Channel, credentials, ServiceError } from "@grpc/grpc-js";
import * as fs from "fs";
import * as crypto from "crypto";
import * as path from "path";
import Long from "long";

import protos from "./api/proto.json";
import { synapse } from "./api/api";
import Config from "./config";
import { CallOptions, create } from "./utils/client";
import { fromDeviceStatus, Status } from "./utils/status";

const FILE_CHUNK_SIZE = 1024 * 1024; // 1MB chunks

function calculateSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

function extractVersion(packageName: string): string {
  // Format: package-name_version_architecture.deb
  const parts = packageName.split("_");
  return parts.length >= 2 ? parts[1] : "";
}

const kSynapseService = "synapse.SynapseDevice";

class Device {
  rpc: any | null = null;
  channel: Channel | null = null;

  constructor(public uri: string) {
    const { status, client } = create(protos, kSynapseService)(uri, credentials.createInsecure());
    if (!status.ok() || !client) {
      throw new Error(`Failed to create client for ${uri}: ${status.message}`);
    }
    this.rpc = client as synapse.SynapseDevice;
  }

  async configure(config: Config, options: CallOptions = {}): Promise<Status> {
    return new Promise((resolve, reject) => {
      config.setDevice(this);
      const proto = config.toProto();
      this.rpc.configure(proto, options, (err: ServiceError, res) => {
        if (err) {
          reject(err);
        } else {
          const status = this._handleStatusResponse(res!);
          if (status.ok()) {
            resolve(status);
          } else {
            reject(new Status(status.code, `failed to configure device: ${status.message}`));
          }
        }
      });
    });
  }

  async info(options: CallOptions = {}): Promise<{ status: Status; response?: synapse.DeviceInfo }> {
    return new Promise((resolve, reject) => {
      this.rpc.info({}, options, (err: ServiceError, res: synapse.DeviceInfo) => {
        if (err) {
          reject(err);
        } else if (!res) {
          reject(new Status(err.code, "failed to get device info: " + err.message));
        } else {
          resolve({ status: new Status(), response: res });
        }
      });
    });
  }

  async start(options: CallOptions = {}): Promise<Status> {
    return new Promise((resolve, reject) => {
      this.rpc.start({}, options, (err: ServiceError, res: synapse.IStatus) => {
        if (err) {
          reject(err);
        } else {
          const status = this._handleStatusResponse(res!);
          if (status.ok()) {
            resolve(status);
          } else {
            reject(new Status(status.code, `failed to start device: ${status.message}`));
          }
        }
      });
    });
  }

  async stop(options: CallOptions = {}): Promise<Status> {
    return new Promise((resolve, reject) => {
      this.rpc.stop({}, options, (err: ServiceError, res: synapse.IStatus) => {
        if (err) {
          reject(err);
        } else {
          const status = this._handleStatusResponse(res!);
          if (status.ok()) {
            resolve(status);
          } else {
            reject(new Status(status.code, `failed to stop device: ${status.message}`));
          }
        }
      });
    });
  }

  async streamQuery(
    query: synapse.IStreamQueryRequest,
    options: CallOptions = {},
    callbacks: {
      onData: (data: synapse.StreamQueryResponse) => void;
      onEnd?: () => void;
      onError?: (err: Error) => void;
      onStatus?: (status: Status) => void;
    }
  ) {
    const { onData, onEnd, onError, onStatus } = callbacks;
    const call = this.rpc.streamQuery(query, options);
    call.on("data", (data: synapse.StreamQueryResponse) => {
      onData(data);
    });
    if (onEnd) {
      call.on("end", () => {
        onEnd();
      });
    }
    if (onError) {
      call.on("error", (err: ServiceError) => {
        onError(err);
      });
    }
    if (onStatus) {
      call.on("status", (grpcStatus) => {
        onStatus?.(new Status(grpcStatus.code, grpcStatus.details));
      });
    }
    return call;
  }

  // Query (unary RPC for things like listing taps)

  async query(
    request: synapse.IQueryRequest,
    options: CallOptions = {}
  ): Promise<{ status: Status; response?: synapse.QueryResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc.query(request, options, (err: ServiceError, res: synapse.QueryResponse) => {
        if (err) {
          reject(err);
        } else if (!res) {
          reject(new Error("No response from query"));
        } else {
          resolve({ status: new Status(), response: res });
        }
      });
    });
  }

  // Logs

  async getLogs(
    query: synapse.ILogQueryRequest,
    options: CallOptions = {}
  ): Promise<{ status: Status; response?: synapse.LogQueryResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc.getLogs(query, options, (err: ServiceError, res: synapse.LogQueryResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve({ status: new Status(), response: res });
        }
      });
    });
  }

  async tailLogs(
    query: synapse.ITailLogsRequest,
    options: CallOptions = {},
    callbacks: {
      onData: (data: synapse.LogEntry) => void;
      onEnd?: () => void;
      onError?: (err: Error) => void;
      onStatus?: (status: Status) => void;
    }
  ) {
    const { onData, onEnd, onError, onStatus } = callbacks;
    const call = this.rpc.tailLogs(query, options);
    call.on("data", onData);
    if (onEnd) {
      call.on("end", onEnd);
    }
    if (onError) {
      call.on("error", onError);
    }
    if (onStatus) {
      call.on("status", (grpcStatus) => {
        onStatus?.(new Status(grpcStatus.code, grpcStatus.details));
      });
    }
    return call;
  }

  // Apps

  async listApps(options: CallOptions = {}): Promise<{ status: Status; response?: synapse.ListAppsResponse }> {
    return new Promise((resolve, reject) => {
      this.rpc.listApps({}, options, (err: ServiceError, res: synapse.ListAppsResponse) => {
        if (err) {
          reject(err);
        } else if (!res) {
          reject(new Error("No response from listApps"));
        } else {
          resolve({ status: new Status(), response: res });
        }
      });
    });
  }

  // Settings

  async updateDeviceSettings(
    settings: synapse.IDeviceSettings,
    options: CallOptions = {}
  ): Promise<{ status: Status; response?: synapse.UpdateDeviceSettingsResponse }> {
    return new Promise((resolve, reject) => {
      const request: synapse.IUpdateDeviceSettingsRequest = { settings };
      this.rpc.updateDeviceSettings(
        request,
        options,
        (err: ServiceError, res: synapse.UpdateDeviceSettingsResponse) => {
          if (err) {
            reject(err);
          } else if (!res) {
            reject(new Error("No response from updateDeviceSettings"));
          } else {
            const status = res.status ? this._handleStatusResponse(res.status) : new Status();
            resolve({ status, response: res });
          }
        }
      );
    });
  }

  deployApp(
    options: CallOptions = {},
    callbacks: {
      onData: (data: synapse.AppDeployResponse) => void;
      onEnd?: () => void;
      onError?: (err: Error) => void;
      onStatus?: (status: Status) => void;
    }
  ) {
    const { onData, onEnd, onError, onStatus } = callbacks;
    const call = this.rpc.deployApp({}, options);

    call.on("data", (data: synapse.AppDeployResponse) => {
      onData(data);
    });
    if (onEnd) {
      call.on("end", onEnd);
    }
    if (onError) {
      call.on("error", (err: ServiceError) => {
        onError(err);
      });
    }
    if (onStatus) {
      call.on("status", (grpcStatus) => {
        onStatus?.(new Status(grpcStatus.code, grpcStatus.details));
      });
    }

    return {
      call,
      sendMetadata: (metadata: synapse.IPackageMetadata) => {
        call.write({ metadata });
      },
      sendChunk: (fileChunk: Uint8Array) => {
        call.write({ fileChunk });
      },
      end: () => {
        call.end();
      },
    };
  }

  async deploy(
    debPackagePath: string,
    callbacks?: {
      onProgress?: (bytesTransferred: number, totalBytes: number) => void;
      onStatus?: (message: string) => void;
    }
  ): Promise<Status> {
    const fileName = path.basename(debPackagePath);
    const fileSize = fs.statSync(debPackagePath).size;
    const sha256Sum = await calculateSha256(debPackagePath);
    const version = extractVersion(fileName);

    const metadata: synapse.IPackageMetadata = {
      name: fileName,
      version,
      size: Long.fromNumber(fileSize),
      sha256Sum,
    };

    return new Promise((resolve, reject) => {
      let bytesTransferred = 0;

      const { sendMetadata, sendChunk, end } = this.deployApp({}, {
        onData: (response) => {
          callbacks?.onStatus?.(response.message || "");
          if (response.status !== synapse.StatusCode.kOk) {
            reject(new Error(response.message || "Deployment failed"));
          }
        },
        onEnd: () => {
          resolve(new Status());
        },
        onError: (err) => {
          reject(err);
        },
      });

      sendMetadata(metadata);

      const stream = fs.createReadStream(debPackagePath, {
        highWaterMark: FILE_CHUNK_SIZE,
      });

      stream.on("data", (chunk: Buffer) => {
        sendChunk(chunk);
        bytesTransferred += chunk.length;
        callbacks?.onProgress?.(bytesTransferred, fileSize);
      });

      stream.on("end", () => {
        end();
      });

      stream.on("error", (err) => {
        reject(err);
      });
    });
  }

  _handleStatusResponse(status: synapse.IStatus): Status {
    const { code, message } = status;
    if (code !== synapse.StatusCode.kOk) {
      return fromDeviceStatus({ code, message });
    } else {
      return new Status();
    }
  }
}

export default Device;
