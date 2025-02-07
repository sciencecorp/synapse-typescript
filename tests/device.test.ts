import { synapse } from "../src/api/api";
import Device from "../src/device";
import Config from "../src/config";
import BroadbandSource from "../src/nodes/broadband_source";

describe("Device", () => {
  let device: Device;

  beforeEach(() => {
    device = new Device("localhost:50051");
  });

  describe("constructor", () => {
    it("should create device with uri", () => {
      expect(device.uri).toBe("localhost:50051");
      expect(device.rpc).toBeTruthy();
    });

    it("should throw error for invalid uri", () => {
      expect(() => new Device("")).toThrow();
    });
  });

  describe("configure", () => {
    it("should configure device with config", async () => {
      const config = new Config();
      const node = new BroadbandSource();
      config.addNode(node);

      // Mock RPC response
      device.rpc.configure = jest.fn((proto, options, callback) => {
        callback(null, { code: synapse.StatusCode.kOk });
      });

      await expect(device.configure(config)).resolves.toBe(true);
      expect(device.rpc.configure).toHaveBeenCalled();
      expect(node.device).toBe(device);
    });

    it("should reject on configure error", async () => {
      const config = new Config();
      device.rpc.configure = jest.fn((proto, options, callback) => {
        callback(new Error("Configure failed"));
      });

      await expect(device.configure(config)).rejects.toThrow("Configure failed");
    });
  });

  describe("info", () => {
    it("should get device info", async () => {
      const mockInfo = {
        status: { code: synapse.StatusCode.kOk },
        capability: "test",
        name: "test-device",
      };

      device.rpc.info = jest.fn((req, options, callback) => {
        callback(null, mockInfo);
      });

      const info = await device.info();
      expect(info).toEqual(mockInfo);
    });

    it("should reject on info error", async () => {
      device.rpc.info = jest.fn((req, options, callback) => {
        callback(new Error("Info failed"));
      });

      await expect(device.info()).rejects.toThrow("Info failed");
    });
  });

  describe("start/stop", () => {
    it("should start device", async () => {
      device.rpc.start = jest.fn((req, options, callback) => {
        callback(null, { code: synapse.StatusCode.kOk });
      });

      await expect(device.start()).resolves.toBe(true);
    });

    it("should stop device", async () => {
      device.rpc.stop = jest.fn((req, options, callback) => {
        callback(null, { code: synapse.StatusCode.kOk });
      });

      await expect(device.stop()).resolves.toBe(true);
    });
  });

  describe("_handleStatusResponse", () => {
    it("should handle successful status", () => {
      const status: synapse.IStatus = {
        code: synapse.StatusCode.kOk,
        sockets: [],
        message: "",
        state: synapse.DeviceState.kInitializing,
      };
      expect(device._handleStatusResponse(status)).toBe(true);
      expect(device.sockets).toEqual([]);
    });

    it("should handle error status", () => {
      const status: synapse.IStatus = {
        code: synapse.StatusCode.kUndefinedError,
        message: "some error",
        state: synapse.DeviceState.kInitializing,
      };
      expect(device._handleStatusResponse(status)).toBe(false);
    });
  });
});
