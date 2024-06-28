import { NodeConfig } from "./api/synapse/NodeConfig";
import { NodeType } from "./api/synapse/NodeType";
import Device from "./device";

class Node {
  id: number;
  type: NodeType = NodeType.kNodeTypeUnknown;
  device: Device | null = null;

  toProto(config: NodeConfig = {}): NodeConfig {
    return {
      ...config,
      id: this.id,
      type: this.type,
    };
  }
}

export default Node;
