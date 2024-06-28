import { synapse } from "api/synapse";
import Node from "./node";

type Connection = [number, number];

class Config {
  connections: Connection[] = [];
  nodes: Node[] = [];

  _genNodeId() {
    return this.nodes.length + 1;
  }

  add(nodes) {
    for (const node of nodes) {
      if (!this.addNode(node)) {
        return false;
      }
    }
    return true;
  }

  connect(fromNode: Node, toNode: Node) {
    if (fromNode.id === null || toNode.id === null) {
      return false;
    }
    this.connections.push([fromNode.id, toNode.id]);
    return true;
  }

  addNode(node) {
    if (node.id !== null) {
      return false;
    }
    node.id = this._genNodeId();
    this.nodes.push(node);
    return true;
  }

  setDevice(device) {
    for (const node of this.nodes) {
      node.device = device;
    }
  }

  toProto() {
    return synapse.DeviceConfiguration.create({
      nodes: this.nodes.map((node) => node.toProto()),
      connections: this.connections.map((connection) => {
        return synapse.NodeConnection.create({
          srcNodeId: connection[0],
          dstNodeId: connection[1],
        });
      }),
    });
  }
}

export default Config;
