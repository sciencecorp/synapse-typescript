import dgram from "dgram";
import { discover } from "../../src/utils/discover";

jest.mock("dgram");

describe("discover", () => {
  let mockSocket: any;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
    };
    (dgram.createSocket as jest.Mock).mockImplementation(() => mockSocket);
  });

  afterEach(() => {
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

    // Simulate device response
    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "message") {
        const message = Buffer.from("ID ABC123 SYN1.2.345 6470 test-device-123", "ascii");
        callback(message, { address: "192.168.1.100" });
      } else if (event === "close") {
        setTimeout(() => callback(), 100);
      }
    });

    const devices = await discover();

    expect(dgram.createSocket).toHaveBeenCalledWith("udp4");
    expect(mockSocket.send).toHaveBeenCalled();
    expect(devices).toEqual(mockDevices);
  });

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

    const devices = await discover();
    expect(devices).toEqual([]);
  });

  it("should handle socket errors", async () => {
    const error = new Error("Socket error");

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "error") {
        callback(error);
      }
    });

    await expect(discover()).rejects.toThrow("Socket error");
  });
});
