import Node from "./node";
import { synapse } from "./api/api";
import Application from "./nodes/application";
import BroadbandSource from "./nodes/broadband_source";
import Camera from "./nodes/camera";
import DiskWriter from "./nodes/disk_writer";
import ElectricalStimulation from "./nodes/electrical_stimulation";
import OpticalStimulation from "./nodes/optical_stimulation";
import SpectralFilter from "./nodes/spectral_filter";
import SpikeBinner from "./nodes/spike_binner";
import SpikeDetector from "./nodes/spike_detector";
import SpikeSource from "./nodes/spike_source";
import { Status, StatusCode } from "./utils/status";

type Connection = [number, number];
const kNodeTypeObjectMap = {
  [synapse.NodeType.kApplication]: Application,
  [synapse.NodeType.kBroadbandSource]: BroadbandSource,
  [synapse.NodeType.kCamera]: Camera,
  [synapse.NodeType.kDiskWriter]: DiskWriter,
  [synapse.NodeType.kElectricalStimulation]: ElectricalStimulation,
  [synapse.NodeType.kSpikeSource]: SpikeSource,
  [synapse.NodeType.kOpticalStimulation]: OpticalStimulation,
  [synapse.NodeType.kSpectralFilter]: SpectralFilter,
  [synapse.NodeType.kSpikeBinner]: SpikeBinner,
  [synapse.NodeType.kSpikeDetector]: SpikeDetector
};

class Config {
  connections: Connection[] = [];
  nodes: Node[] = [];

  _genNodeId(): number {
    return this.nodes.length + 1;
  }

  add(nodes: Node[]): Status {
    for (const node of nodes) {
      const status = this.addNode(node);
      if (!status.ok()) {
        return status;
      }
    }
    return new Status();
  }

  connect(fromNode: Node, toNode: Node): Status {
    if (!fromNode.id || !toNode.id) {
      return new Status(StatusCode.INVALID_ARGUMENT, "source and destination nodes must have ids");
    }
    this.connections.push([fromNode.id, toNode.id]);
    return new Status();
  }

  addNode(node: Node, id?: number): Status {
    if (node.id) {
      return new Status(StatusCode.INVALID_ARGUMENT, "node must not have an id");
    }

    if (id === undefined) {
      id = this._genNodeId();
    }

    if (this.nodes.find((n) => n.id === id)) {
      return new Status(StatusCode.INVALID_ARGUMENT, "node id must be unique");
    }

    node.id = id;
    this.nodes.push(node);
    return new Status();
  }

  setDevice(device): Status {
    for (const node of this.nodes) {
      node.device = device;
    }
    return new Status();
  }

  static fromProto(proto: synapse.IDeviceConfiguration): Config {
    const { nodes = [], connections = [] } = proto;
    const config = new Config();

    for (const nodeProto of nodes) {
      const { type } = nodeProto;
      const NodeType = kNodeTypeObjectMap[type];
      if (!NodeType) {
        // Dropping a node here also drops every connection to it below, which
        // silently truncates the signal chain instead of failing -- a device
        // configured from the result reports success for a chain that is
        // missing nodes the caller asked for. kNodeTypeUnknown carries no
        // config and is legitimately skipped; any other type reaching here is a
        // gap in kNodeTypeObjectMap and should be visible.
        if (type !== synapse.NodeType.kNodeTypeUnknown) {
          console.warn(
            "Config.fromProto: no node class registered for node type " +
              `${synapse.NodeType[type] ?? type}; dropping the node and its connections`
          );
        }
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
