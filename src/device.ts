import {
  Channel,
  ServiceClientConstructor,
  credentials,
  loadPackageDefinition,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { synapse } from "api/synapse";

import Config from "./config";

class Device {
  rpc: any;
  channel: Channel;
  sockets: any = null;

  constructor(public uri: string) {
    const definition = loadSync("src/api/synapse.js", {
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const pkg = loadPackageDefinition(definition);
    const nspace = pkg.synapse as any;
    const SynapseDevice = nspace?.SynapseDevice as ServiceClientConstructor;

    this.rpc = new SynapseDevice(this.uri, credentials.createInsecure());
  }

  async configure(config: Config) {
    try {
      config.setDevice(this);
      const res = this.rpc.configure(config.toProto());
      if (this._handleStatusResponse(res)) {
        return res;
      }
    } catch (e) {
      console.log("Error: ", e.details);
    }
    return false;
  }

  async info() {
    try {
      return this.rpc.info();
    } catch (e) {
      console.log("Error: ", e.details);
      return null;
    }
  }

  async start() {
    try {
      const res = this.rpc.start();
      if (this._handleStatusResponse(res)) {
        return res;
      }
    } catch (e) {
      console.log("Error: ", e.details);
    }
    return false;
  }

  async stop() {
    try {
      const res = this.rpc.stop();
      if (this._handleStatusResponse(res)) {
        return res;
      }
    } catch (e) {
      console.log("Error: ", e.details);
    }
    return false;
  }

  _handleStatusResponse(status: synapse.Status) {
    if (status.code !== synapse.StatusCode.kOk) {
      console.log(`Error ${status.code}: ${status.message}`);
      return false;
    } else {
      this.sockets = status.sockets;
      return true;
    }
  }
}

export default Device;
