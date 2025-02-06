import Node from "./node";
import { synapse } from "./api/api";
import BroadbandSource from "./nodes/broadband_source";
import ElectricalStimulation from "./nodes/electrical_stimulation";
import OpticalStimulation from "./nodes/optical_stimulation";
import SpectralFilter from "./nodes/spectral_filter";
import SpikeDetect from "./nodes/spike_detect";
import SpikeSource from "./nodes/spike_source";
import StreamIn from "./nodes/stream_in";
import StreamOut from "./nodes/stream_out";

type Connection = [number, number];
const kNodeTypeObjectMap = {
  [synapse.NodeType.kBroadbandSource]: BroadbandSource,
  [synapse.NodeType.kElectricalStimulation]: ElectricalStimulation,
  [synapse.NodeType.kSpikeSource]: SpikeSource,
  [synapse.NodeType.kOpticalStimulation]: OpticalStimulation,
  [synapse.NodeType.kSpectralFilter]: SpectralFilter,
  [synapse.NodeType.kSpikeDetect]: SpikeDetect,
  [synapse.NodeType.kStreamIn]: StreamIn,
  [synapse.NodeType.kStreamOut]: StreamOut,
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

  addNode(node: Node, id?: number): boolean {
    if (node.id) {
      return false;
    }

    if (id === undefined) {
      id = this._genNodeId();
    }

    if (this.nodes.find((n) => n.id === id)) {
      return false;
    }

    node.id = id;
    this.nodes.push(node);
    return true;
  }

  setDevice(device): boolean {
    for (const node of this.nodes) {
      node.device = device;
    }
    return true;
  }

  static fromProto(proto: synapse.IDeviceConfiguration): Config {
    const { nodes = [], connections = [] } = proto;
    const config = new Config();

    for (const nodeProto of nodes) {
      const { type } = nodeProto;
      const NodeType = kNodeTypeObjectMap[type];
      if (!NodeType) {
        continue;
      }

      const node = NodeType.fromProto(nodeProto);
      if (nodeProto.id) {
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

  toProto(): synapse.DeviceConfiguration {
    return new synapse.DeviceConfiguration({
      nodes: this.nodes.map((node) => node.toProto()),
      connections: this.connections.map((connection) => {
        return {
          srcNodeId: connection[0],
          dstNodeId: connection[1],
        };
      }),
    });
  }
}

export default Config;
