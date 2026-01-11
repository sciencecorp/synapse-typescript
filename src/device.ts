import { Channel, credentials, ServiceError } from "@grpc/grpc-js";

import protos from "./api/proto.json";
import { synapse } from "./api/api";
import Config from "./config";
import { CallOptions, create } from "./utils/client";
import { fromDeviceStatus, Status } from "./utils/status";

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
