import { synapse } from "./api/api";
import Device from "./device";

class Node {
  id?: number;
  type: synapse.NodeType = synapse.NodeType.kNodeTypeUnknown;
  device: Device | null = null;

  toProto(config: synapse.INodeConfig = {}): synapse.NodeConfig {
    return new synapse.NodeConfig({
      ...config,
      id: this.id,
      type: this.type,
    });
  }
}

export default Node;
