import { MockSocket } from "../mocks/udp";
import StreamOut from "../../src/nodes/stream_out";
import { synapse } from "../../src/api/api";

let mockSocket = new MockSocket();

jest.mock("dgram", () => ({
  __esModule: true,
  default: {
    createSocket: jest.fn(() => mockSocket),
  },
}));

describe("StreamOut", () => {
  describe("constructor", () => {
    it("should initialize with default values", () => {
      const config: synapse.IStreamOutConfig = {
        label: "test",
      };
      const node = new StreamOut(config);
      expect(node._destinationPort).toBe(50038);
      expect(node._label).toBe("test");
      expect(node._destinationAddress).toMatch(/^(\d{1,3}\.){3}\d{1,3}$/);
    });
    it("should initialize with custom UDP config", () => {
      const config: synapse.IStreamOutConfig = {
        label: "test",
        udpUnicast: {
          destinationAddress: "192.168.1.100",
          destinationPort: 12345,
        },
      };
      const node = new StreamOut(config);
      expect(node._destinationPort).toBe(12345);
      expect(node._destinationAddress).toBe("192.168.1.100");
    });
  });

  describe("start/stop", () => {
    it("should start and stop successfully", async () => {
      const config: synapse.IStreamOutConfig = {
        label: "test",
      };
      const node = new StreamOut(config);

      // Mock the bind implementation to call its callback immediately
      mockSocket.bind.mockImplementation((port: number, addr: string, callback?: () => void) => {
        if (callback) callback();
      });

      const startResult = await node.start();
      expect(startResult.ok()).toBeTruthy();

      const stopResult = await node.stop();
      expect(stopResult.ok()).toBeTruthy();
    });
  });

  describe("message handling", () => {
    beforeEach(() => {
      // Reset mock implementations before each test
      mockSocket = new MockSocket();
      mockSocket.bind.mockImplementation((port: number, addr?: string, callback?: () => void) => {
        if (callback) callback();
      });
    });

    it("should handle incoming messages via callback", async () => {
      let receivedMessage: Buffer | null = null;
      const onMessage = (msg: Buffer) => {
        receivedMessage = msg;
      };

      const config: synapse.IStreamOutConfig = {
        label: "test",
      };
      const node = new StreamOut(config, { onMessage });

      // Mock socket message handling - call callback immediately
      mockSocket.on.mockImplementation((event: string, callback: any) => {
        if (event === "message") {
          const testMessage = Buffer.from("test message", "ascii");
          callback(testMessage);
        }
      });

      await node.start();

      expect(receivedMessage?.toString()).toBe("test message");
      expect(mockSocket.bind).toHaveBeenCalledWith(50038, expect.any(String), expect.any(Function));
      expect(mockSocket.setRecvBufferSize).toHaveBeenCalledWith(5 * 1024 * 1024); // 5MB

      await node.stop();
    });

    it("should handle socket errors during message processing", async () => {
      const onMessage = jest.fn();
      const node = new StreamOut({ label: "test" }, { onMessage });

      // Mock socket error - call error callback immediately
      mockSocket.bind.mockImplementation(() => {
        // Simulate a bind error by not calling the callback
        throw new Error("Bind error");
      });

      const result = await node.start();
      expect(result.ok()).toBeFalsy();
      expect(onMessage).not.toHaveBeenCalled();
    });
  });

  describe("proto serialization", () => {
    it("should correctly serialize to proto", () => {
      const config: synapse.IStreamOutConfig = {
        label: "test",
        udpUnicast: {
          destinationAddress: "192.168.1.100",
          destinationPort: 12345,
        },
      };
      const node = new StreamOut(config);

      const proto = node.toProto();

      expect(proto.streamOut).toEqual({
        label: "test",
        udpUnicast: {
          destinationAddress: "192.168.1.100",
          destinationPort: 12345,
        },
      });
    });

    it("should correctly deserialize from proto", () => {
      const proto: synapse.INodeConfig = {
        streamOut: {
          label: "test",
          udpUnicast: {
            destinationAddress: "192.168.1.100",
            destinationPort: 12345,
          },
        },
      };

      const node = StreamOut.fromProto(proto);

      expect(node._label).toBe("test");
      expect(node._destinationAddress).toBe("192.168.1.100");
      expect(node._destinationPort).toBe(12345);
    });

    it("should throw error when deserializing invalid proto", () => {
      const proto: synapse.INodeConfig = {};

      expect(() => StreamOut.fromProto(proto)).toThrow("Invalid config, missing streamOut");
    });
  });
});
