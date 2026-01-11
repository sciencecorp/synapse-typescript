import dgram from "dgram";
import { discover } from "../../src/utils/discover";
import { MockSocket } from "../mocks/udp";

const mockSocket = new MockSocket();

jest.mock("dgram", () => ({
  __esModule: true,
  default: {
    createSocket: jest.fn(() => mockSocket),
  },
}));

describe("discover", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should discover devices correctly", async () => {
    const mockDevices = [
      {
        host: "192.168.1.100",
        port: 6470,
        serial: "ABC123",
        capability: "SYN1.2.345",
        name: "test-device-123",
      },
    ];

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "message") {
        const message = Buffer.from("ID ABC123 SYN1.2.345 6470 test-device-123", "ascii");
        // Use setImmediate to trigger callback in next tick (works with fake timers)
        setImmediate(() => callback(message, { address: "192.168.1.100" }));
      } else if (event === "close") {
        // This will be triggered when timeout completes
        setImmediate(() => callback());
      }
    });

    const discoverPromise = discover(500);

    // Advance timers to trigger the timeout
    jest.advanceTimersByTime(500);

    const devices = await discoverPromise;

    expect(dgram.createSocket).toHaveBeenCalledWith({ type: "udp4", reuseAddr: true });
    expect(mockSocket.bind).toHaveBeenCalledWith(6470);
    expect(devices).toEqual(mockDevices);
  });

  it("should handle invalid messages", async () => {
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "message") {
        // Send invalid message format
        const message = Buffer.from("INVALID MESSAGE", "ascii");
        callback(message, { address: "192.168.1.100" });
      } else if (event === "close") {
        setImmediate(() => callback());
      }
    });

    const discoverPromise = discover(500);
    jest.advanceTimersByTime(500);

    const devices = await discoverPromise;
    expect(devices).toEqual([]);
  });

  it("should handle socket errors", async () => {
    const error = new Error("Socket error");

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "error") {
        callback(error);
      }
    });

    await expect(discover(500)).rejects.toThrow("Socket error");
  });
});
