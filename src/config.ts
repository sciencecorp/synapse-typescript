import Node from "./node";
import { DeviceConfiguration } from "./api/synapse/DeviceConfiguration";
import { NodeType } from "./api/synapse/NodeType";
import ElectricalBroadband from "./nodes/electrical_broadband";
import OpticalStimulation from "./nodes/optical_stimulation";
import StreamIn from "./nodes/stream_in";
import StreamOut from "./nodes/stream_out";

type Connection = [number, number];
const kNodeTypeObjectMap = {
  [NodeType.kElectricalBroadband]: ElectricalBroadband,
  [NodeType.kOpticalStim]: OpticalStimulation,
  [NodeType.kStreamIn]: StreamIn,
  [NodeType.kStreamOut]: StreamOut,
};

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
      return false;
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

  static fromProto(proto: DeviceConfiguration): Config {
    const { nodes = [], connections = [] } = proto;
    const config = new Config();

    for (const nodeProto of nodes) {
      const { type } = nodeProto;
      const NodeType = kNodeTypeObjectMap[type];
      if (!NodeType) {
        continue;
      }

      const node = NodeType.fromProto(nodeProto);
      if (!!nodeProto.id) {
        node.id = nodeProto.id;
        config.nodes.push(node);
      } else {
        config.addNode(node);
      }
    }

    for (const connection of connections) {
      const from = config.nodes.find((node) => node.id === connection.srcNodeId);
      const to = config.nodes.find((node) => node.id === connection.dstNodeId);
      if (!from || !to) {
        continue;
      }
      config.connect(from, to);
    }

    return config;
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
