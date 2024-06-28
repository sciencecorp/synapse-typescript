import { synapse } from "api/synapse";

class Config {
  nodes = [];
  connections = [];

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

  connect(fromNode, toNode) {
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
    const c = new synapse.DeviceConfiguration();
    for (const node of this.nodes) {
      c.nodes.push(node.toProto());
    }
    for (const connection of this.connections) {
      const x = new synapse.NodeConnection();
      x.srcNodeId = connection[0];
      x.dstNodeId = connection[1];
      c.connections.push(x);
    }
    return c;
  }
}

export default Config;
