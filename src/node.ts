import { NodeConfig } from "./api/synapse/NodeConfig";
import { NodeType } from "./api/synapse/NodeType";
import Device from "./device";

class Node {
  id?: number;
  type: NodeType = NodeType.kNodeTypeUnknown;
  device: Device | null = null;

  toProto(config: NodeConfig = {}): NodeConfig {
    return {
      ...config,
      id: this.id,
      type: this.type,
    };
  }

  static _fromProto(_: NodeConfig): Node {
    throw new Error("Not implemented");
  }

  static fromProto(proto: NodeConfig): Node {
    const node = Node._fromProto(proto);
    node.id = proto.id;
    node.type = proto.type;
    return node;
  }
}

export default Node;
