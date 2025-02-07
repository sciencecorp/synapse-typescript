import dgram from "dgram";
import { discover } from "../../src/utils/discover";

class MockSocket {
  private handlers: { [event: string]: any[] } = {};

  on = jest.fn().mockImplementation((event: string, callback: any) => {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(callback);
  });

  send = jest.fn();

  close = jest.fn().mockImplementation(() => {
    if (this.handlers["close"]) {
      this.handlers["close"].forEach((cb) => cb());
    }
  });

  bind = jest.fn();

  emit(event: string, ...args: any[]) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((cb) => cb(...args));
    }
  }
}

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
        setTimeout(() => callback(message, { address: "192.168.1.100" }), 10);
      } else if (event === "close") {
        setTimeout(() => callback(), 500);
      }
    });

    const devices = await discover(500);

    expect(dgram.createSocket).toHaveBeenCalledWith({ type: "udp4", reuseAddr: true });
    expect(mockSocket.bind).toHaveBeenCalledWith(6470);
    expect(devices).toEqual(mockDevices);
  }, 600);

  it("should handle invalid messages", async () => {
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "message") {
        // Send invalid message format
        const message = Buffer.from("INVALID MESSAGE", "ascii");
        callback(message, { address: "192.168.1.100" });
      } else if (event === "close") {
        setTimeout(() => callback(), 100);
      }
    });

    const devices = await discover(500);
    expect(devices).toEqual([]);
  }, 600);

  it("should handle socket errors", async () => {
    const error = new Error("Socket error");

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "error") {
        callback(error);
      }
    });

    await expect(discover(500)).rejects.toThrow("Socket error");
  }, 600);
});
