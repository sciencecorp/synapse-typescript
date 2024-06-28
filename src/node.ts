import { synapse } from "./api/synapse";
import Device from "./device";

class Node {
  id: number | null = null;
  type: synapse.NodeType = synapse.NodeType.kNodeTypeUnknown;
  device: Device | null = null;

  toProto(config: synapse.NodeConfig | Object = {}): synapse.NodeConfig {
    return synapse.NodeConfig.create({
      ...config,
      id: this.id,
      type: this.type,
    });
  }
}

export default Node;
