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
  sockets: synapse.INodeSocket[] = [];

  constructor(public uri: string) {
    const { status, client } = create(protos, kSynapseService)(uri, credentials.createInsecure());
    if (!status.ok() || !client) {
      throw new Error(`Failed to create client for ${uri}: ${status.message}`);
    }
    this.rpc = client;
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
          const { sockets } = res.status;
          this.sockets = sockets || [];
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

  _handleStatusResponse(status: synapse.IStatus): Status {
    const { code, message, sockets } = status;
    if (code !== synapse.StatusCode.kOk) {
      return fromDeviceStatus({ code, message });
    } else {
      this.sockets = sockets || [];
      return new Status();
    }
  }
}

export default Device;
