import Config from "../src/config";
import { synapse } from "../src/api/api";
import BroadbandSource from "../src/nodes/broadband_source";
import SpikeDetect from "../src/nodes/spike_detect";

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
      const node2 = new SpikeDetect();

      let status = config.addNode(node1);
      expect(status.ok()).toBe(true);

      status = config.addNode(node2);
      expect(status.ok()).toBe(true);

      status = config.connect(node1, node2);
      expect(status.ok()).toBe(true);
      expect(config.connections).toContainEqual([node1.id, node2.id]);
    });

    it("should reject connection if nodes don't have ids", () => {
      const node1 = new BroadbandSource();
      const node2 = new SpikeDetect();
      const status = config.connect(node1, node2);
      expect(status.ok()).toBe(false);
      expect(config.connections).toHaveLength(0);
    });
  });

  describe("add", () => {
    it("should add multiple nodes", () => {
      const nodes = [new BroadbandSource(), new SpikeDetect()];
      const status = config.add(nodes);
      expect(status.ok()).toBe(true);
      expect(config.nodes).toHaveLength(2);
      expect(nodes[0].id).toBe(1);
      expect(nodes[1].id).toBe(2);
    });

    it("should fail if any node already has an id", () => {
      const nodes = [new BroadbandSource(), new SpikeDetect()];
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
            type: synapse.NodeType.kSpikeDetect,
            spikeDetect: {},
          },
          {
            id: 3,
            type: synapse.NodeType.kSpikeSource,
            spikeSource: {
              peripheralId: 1,
              sampleRateHz: 1000,
              spikeWindowMs: 10,
              gain: 1,
              thresholdUV: 100,
              electrodes: {
                channels: [
                  {
                    id: 1,
                  },
                ],
                lowCutoffHz: 100,
                highCutoffHz: 1000,
              },
            },
          },
          {
            id: 4,
            type: synapse.NodeType.kStreamOut,
            streamOut: {
              label: "test-stream",
              udpUnicast: {
                destinationPort: 50058,
              },
            },
          },
        ],
        connections: [
          {
            srcNodeId: 1,
            dstNodeId: 2,
          },
          {
            srcNodeId: 3,
            dstNodeId: 4,
          },
        ],
      });

      const config = Config.fromProto(protoConfig);
      expect(config.nodes).toHaveLength(4);
      expect(config.connections).toHaveLength(2);
      expect(config.nodes[0].id).toBe(1);
      expect(config.nodes[1].id).toBe(2);
      expect(config.nodes[2].id).toBe(3);
      expect(config.nodes[3].id).toBe(4);
      expect(config.connections[0]).toEqual([1, 2]);
      expect(config.connections[1]).toEqual([3, 4]);

      const convertedProto = config.toProto();
      expect(convertedProto.nodes).toHaveLength(4);
      expect(convertedProto.connections).toHaveLength(2);
      expect(convertedProto.connections[0].srcNodeId).toBe(1);
      expect(convertedProto.connections[0].dstNodeId).toBe(2);
      expect(convertedProto.connections[1].srcNodeId).toBe(3);
      expect(convertedProto.connections[1].dstNodeId).toBe(4);
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
      const node2 = new SpikeDetect();
      config.add([node1, node2]);

      const mockDevice = { id: "test-device" };
      const status = config.setDevice(mockDevice);
      expect(status.ok()).toBe(true);

      expect(node1.device).toBe(mockDevice);
      expect(node2.device).toBe(mockDevice);
    });
  });
});
