import { synapse } from "../api/api";
import Node from "../node";

class Camera extends Node {
  type = synapse.NodeType.kCamera;
  config: synapse.ICameraConfig;

  constructor(config: synapse.ICameraConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      camera: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): Camera {
    const { camera } = proto;
    if (!camera) {
      throw new Error("Invalid config, missing camera");
    }

    return new Camera(proto.camera);
  }
}

export default Camera;
