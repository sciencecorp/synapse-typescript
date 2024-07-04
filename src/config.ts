import Node from "./node";
import { DeviceConfiguration } from "./api/synapse/DeviceConfiguration";

type Connection = [number, number];

class Config {
  connections: Connection[] = [];
  nodes: Node[] = [];

  _genNodeId(): number {
    return this.nodes.length + 1;
  }

  add(nodes: Node[]) {
    for (const node of nodes) {
      if (!this.addNode(node)) {
        return false;
      }
    }
    return true;
  }

  connect(fromNode: Node, toNode: Node): boolean {
    if (fromNode.id === null || toNode.id === null) {
      return false;
    }
    this.connections.push([fromNode.id, toNode.id]);
    return true;
  }

  addNode(node: Node): boolean {
    if (!!node.id) {
      return true;
    }
    node.id = this._genNodeId();
    this.nodes.push(node);
    return true;
  }

  setDevice(device): boolean {
    for (const node of this.nodes) {
      node.device = device;
    }
    return true;
  }

  toProto(): DeviceConfiguration {
    return {
      nodes: this.nodes.map((node) => node.toProto()),
      connections: this.connections.map((connection) => {
        return {
          srcNodeId: connection[0],
          dstNodeId: connection[1],
        };
      }),
    };
  }
}

export default Config;
