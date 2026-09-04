import { synapse } from "../api/api";
import Node from "../node";

class Application extends Node {
  type = synapse.NodeType.kApplication;
  config: synapse.IApplicationNodeConfig;

  constructor(config: synapse.IApplicationNodeConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      application: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): Application {
    const { application } = proto;
    if (!application) {
      throw new Error("Invalid config, missing application");
    }

    return new Application(proto.application);
  }
}

export default Application;
