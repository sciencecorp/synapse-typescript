import Config from "../src/config";
import { synapse } from "../src/api/api";
import BroadbandSource from "../src/nodes/broadband_source";
import SpikeBinner from "../src/nodes/spike_binner";
import SpikeDetector from "../src/nodes/spike_detector";

describe("Config", () => {
  let config: Config;

  beforeEach(() => {
    config = new Config();
  });

  describe("addNode", () => {
    it("should add a node with auto-generated id", () => {
      const node = new BroadbandSource();
      const status = config.addNode(node);
      expect(status.ok()).toBe(true);
      expect(node.id).toBe(1);
      expect(config.nodes).toContain(node);
    });

    it("should add a node with specified id", () => {
      const node = new BroadbandSource();
      const status = config.addNode(node, 5);
      expect(status.ok()).toBe(true);
      expect(node.id).toBe(5);
      expect(config.nodes).toContain(node);
    });

    it("should reject node that already has an id", () => {
      const node = new BroadbandSource();
      node.id = 1;
      const status = config.addNode(node);
      expect(status.ok()).toBe(false);
      expect(config.nodes).not.toContain(node);
    });

    it("should reject duplicate node ids", () => {
      const node1 = new BroadbandSource();
      const node2 = new BroadbandSource();

      let status = config.addNode(node1, 1);
      expect(status.ok()).toBe(true);

      status = config.addNode(node2, 1);
      expect(status.ok()).toBe(false);
    });
  });

  describe("connect", () => {
    it("should connect two nodes", () => {
      const node1 = new BroadbandSource();
      const node2 = new SpikeDetector();
      const node3 = new SpikeBinner();

      let status = config.addNode(node1);
      expect(status.ok()).toBe(true);

      status = config.addNode(node2);
      expect(status.ok()).toBe(true);

      status = config.addNode(node3);
      expect(status.ok()).toBe(true);

      status = config.connect(node1, node2);
      expect(status.ok()).toBe(true);
      expect(config.connections).toContainEqual([node1.id, node2.id]);

      status = config.connect(node2, node3);
      expect(status.ok()).toBe(true);
      expect(config.connections).toContainEqual([node2.id, node3.id]);
    });

    it("should reject connection if nodes don't have ids", () => {
      const node1 = new BroadbandSource();
      const node2 = new SpikeDetector();
      const status = config.connect(node1, node2);
      expect(status.ok()).toBe(false);
      expect(config.connections).toHaveLength(0);
    });
  });

  describe("add", () => {
    it("should add multiple nodes", () => {
      const nodes = [new BroadbandSource(), new SpikeDetector(), new SpikeBinner()];
      const status = config.add(nodes);
      expect(status.ok()).toBe(true);
      expect(config.nodes).toHaveLength(3);
      expect(nodes[0].id).toBe(1);
      expect(nodes[1].id).toBe(2);
      expect(nodes[2].id).toBe(3);
    });

    it("should fail if any node already has an id", () => {
      const nodes = [new BroadbandSource(), new SpikeDetector()];
      nodes[1].id = 5;
      const status = config.add(nodes);
      expect(status.ok()).toBe(false);
      expect(config.nodes).toHaveLength(1);
    });
  });

  describe("fromProto and toProto", () => {
    it("should convert between proto and Config", () => {
      const protoConfig = new synapse.DeviceConfiguration({
        nodes: [
          {
            id: 1,
            type: synapse.NodeType.kBroadbandSource,
            broadbandSource: {},
          },
          {
            id: 2,
            type: synapse.NodeType.kSpikeDetector,
            spikeDetector: {},
          },
          {
            id: 3,
            type: synapse.NodeType.kSpikeBinner,
            spikeBinner: {},
          },
        ],
        connections: [
          {
            srcNodeId: 1,
            dstNodeId: 2,
          },
          {
            srcNodeId: 2,
            dstNodeId: 3,
          }
        ],
      });

      const config = Config.fromProto(protoConfig);
      expect(config.nodes).toHaveLength(3);
      expect(config.connections).toHaveLength(2);
      expect(config.nodes[0].id).toBe(1);
      expect(config.nodes[1].id).toBe(2);
      expect(config.nodes[2].id).toBe(3);
      expect(config.connections[0]).toEqual([1, 2]);
      expect(config.connections[1]).toEqual([2, 3]);

      const convertedProto = config.toProto();
      expect(convertedProto.nodes).toHaveLength(3);
      expect(convertedProto.connections).toHaveLength(2);
      expect(convertedProto.connections[0].srcNodeId).toBe(1);
      expect(convertedProto.connections[0].dstNodeId).toBe(2);
      expect(convertedProto.connections[1].srcNodeId).toBe(2);
      expect(convertedProto.connections[1].dstNodeId).toBe(3);
    });

    it("should skip invalid node types in fromProto", () => {
      const protoConfig = new synapse.DeviceConfiguration({
        nodes: [
          {
            id: 1,
            type: synapse.NodeType.kNodeTypeUnknown,
          },
        ],
      });

      const config = Config.fromProto(protoConfig);
      expect(config.nodes).toHaveLength(0);
    });
  });

  describe("setDevice", () => {
    it("should set device for all nodes", () => {
      const node1 = new BroadbandSource();
      const node2 = new SpikeDetector();
      const node3 = new SpikeBinner();
      config.add([node1, node2, node3]);

      const mockDevice = { id: "test-device" };
      const status = config.setDevice(mockDevice);
      expect(status.ok()).toBe(true);

      expect(node1.device).toBe(mockDevice);
      expect(node2.device).toBe(mockDevice);
      expect(node3.device).toBe(mockDevice);
    });
  });
});
