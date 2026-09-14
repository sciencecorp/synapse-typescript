import { Metadata } from "@grpc/grpc-js";
import Long from "long";
import { synapse } from "../src/api/api";
import Device from "../src/device";
import Config from "../src/config";
import BroadbandSource from "../src/nodes/broadband_source";
import { StatusCode } from "../src/utils/status";

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

  describe("auth token", () => {
    it("attaches the token as call metadata", () => {
      const tokenDevice = new Device("localhost:647", { token: "f3a9c1" });

      const metadata = (tokenDevice as any).callMetadata as Metadata;

      expect(metadata).toBeInstanceOf(Metadata);
      expect(metadata.get("x-scifi-auth-token")).toEqual(["f3a9c1"]);
    });

    it("attaches nothing when no token is given", () => {
      const metadata = (device as any).callMetadata as Metadata;

      expect(metadata.get("x-scifi-auth-token")).toEqual([]);
    });
  });

  describe("configure", () => {
    it("should configure device with config", async () => {
      const config = new Config();
      const node = new BroadbandSource();
      config.addNode(node);

      // Mock RPC response
      device.rpc.configure = jest.fn((proto, metadata, options, callback) => {
        callback(null, { code: synapse.StatusCode.kOk });
      });

      const status = await device.configure(config);
      expect(status.ok()).toBe(true);
      expect(device.rpc.configure).toHaveBeenCalled();
      expect(node.device).toBe(device);

      // The Metadata instance built inside the constructor must actually
      // reach the rpc call, in its correct positional slot — not just exist
      // on the Device instance. `rpc` is typed `any`, so nothing else here
      // would catch a call site that dropped this argument.
      expect(device.rpc.configure).toHaveBeenCalledWith(
        expect.anything(), // request
        device["callMetadata"], // metadata — the slot that must not be dropped
        expect.anything(), // options
        expect.any(Function) // callback
      );
    });

    it("should reject on configure error", async () => {
      const config = new Config();
      device.rpc.configure = jest.fn((proto, metadata, options, callback) => {
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

      device.rpc.info = jest.fn((req, metadata, options, callback) => {
        callback(null, mockInfo);
      });

      const { status, response } = await device.info();
      expect(status.ok()).toBe(true);
      expect(response).toEqual(mockInfo);
    });

    it("should reject on info error", async () => {
      device.rpc.info = jest.fn((req, metadata, options, callback) => {
        callback(new Error("Info failed"));
      });

      await expect(device.info()).rejects.toThrow("Info failed");
    });
  });

  describe("start/stop", () => {
    it("should start device", async () => {
      device.rpc.start = jest.fn((req, metadata, options, callback) => {
        callback(null, { code: synapse.StatusCode.kOk });
      });

      const status = await device.start();
      expect(status.ok()).toBe(true);
    });

    it("should stop device", async () => {
      device.rpc.stop = jest.fn((req, metadata, options, callback) => {
        callback(null, { code: synapse.StatusCode.kOk });
      });

      const status = await device.stop();
      expect(status.ok()).toBe(true);
    });
  });

  describe("_handleStatusResponse", () => {
    it("should handle successful status", () => {
      const deviceStatus: synapse.IStatus = {
        code: synapse.StatusCode.kOk,
        message: "",
        state: synapse.DeviceState.kInitializing,
      };
      const status = device._handleStatusResponse(deviceStatus);
      expect(status.ok()).toBe(true);
      expect(status.code).toBe(StatusCode.OK);
    });

    it("should handle error status", () => {
      const deviceStatus: synapse.IStatus = {
        code: synapse.StatusCode.kUndefinedError,
        message: "some error",
        state: synapse.DeviceState.kInitializing,
      };
      const status = device._handleStatusResponse(deviceStatus);
      expect(status.ok()).toBe(false);
      expect(status.code).toBe(StatusCode.UNKNOWN);
    });
  });

  describe("getLogs", () => {
    it("should get logs successfully", async () => {
      const mockResponse: synapse.ILogQueryResponse = {
        entries: [
          {
            timestampNs: Long.fromNumber(Date.now() * 1000000),
            level: synapse.LogLevel.LOG_LEVEL_INFO,
            source: "test",
            message: "test message",
          },
        ],
      };

      device.rpc.getLogs = jest.fn((req, metadata, options, callback) => {
        callback(null, mockResponse);
      });

      const query: synapse.ILogQueryRequest = {
        minLevel: synapse.LogLevel.LOG_LEVEL_INFO,
      };

      const { status, response } = await device.getLogs(query);
      expect(status.ok()).toBe(true);
      expect(response).toEqual(mockResponse);
    });

    it("should handle getLogs error", async () => {
      device.rpc.getLogs = jest.fn((req, metadata, options, callback) => {
        callback(new Error("GetLogs failed"));
      });

      const query: synapse.ILogQueryRequest = {
        minLevel: synapse.LogLevel.LOG_LEVEL_INFO,
      };

      await expect(device.getLogs(query)).rejects.toThrow("GetLogs failed");
    });
  });

  describe("tailLogs", () => {
    it("should tail logs successfully", async () => {
      const mockEntry: synapse.ILogEntry = {
        timestampNs: Long.fromNumber(Date.now() * 1000000),
        level: synapse.LogLevel.LOG_LEVEL_INFO,
        source: "test",
        message: "test message",
      };

      const mockStream = {
        on: jest.fn((event, callback) => {
          if (event === "data") {
            callback(mockEntry);
          }
          return mockStream;
        }),
      };

      device.rpc.tailLogs = jest.fn(() => mockStream);

      const onData = jest.fn();
      const onEnd = jest.fn();
      const onError = jest.fn();
      const onStatus = jest.fn();

      const query: synapse.ITailLogsRequest = {
        minLevel: synapse.LogLevel.LOG_LEVEL_INFO,
      };

      const stream = await device.tailLogs(
        query,
        {},
        {
          onData,
          onEnd,
          onError,
          onStatus,
        }
      );

      expect(stream).toBe(mockStream);
      expect(onData).toHaveBeenCalledWith(mockEntry);
      expect(mockStream.on).toHaveBeenCalledWith("data", onData);
      expect(mockStream.on).toHaveBeenCalledWith("end", onEnd);
      expect(mockStream.on).toHaveBeenCalledWith("error", onError);
      expect(mockStream.on).toHaveBeenCalledWith("status", expect.any(Function));

      // tailLogs is server-streaming: grpc-js's positional layout is
      // (argument, metadata, options) with no callback slot, unlike the
      // unary case above. Assert the same Metadata instance lands there too,
      // since a regression in this slot wouldn't be caught by the unary
      // assertion alone.
      expect(device.rpc.tailLogs).toHaveBeenCalledWith(query, device["callMetadata"], {});
    });

    it("should handle tailLogs with minimal callbacks", async () => {
      const mockStream = {
        on: jest.fn(() => mockStream),
      };

      device.rpc.tailLogs = jest.fn(() => mockStream);

      const query: synapse.ITailLogsRequest = {
        minLevel: synapse.LogLevel.LOG_LEVEL_INFO,
      };

      const stream = await device.tailLogs(
        query,
        {},
        {
          onData: jest.fn(),
        }
      );

      expect(stream).toBe(mockStream);
      expect(mockStream.on).toHaveBeenCalledWith("data", expect.any(Function));
    });
  });
});
