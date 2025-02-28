import Long from "long";
import { science } from "../../src/api-science-device/api";
import DeviceManager from "../../src/utils/device-management";

describe("DeviceManager", () => {
  let deviceManager: DeviceManager;

  beforeEach(() => {
    deviceManager = new DeviceManager("localhost:647");
  });

  describe("constructor", () => {
    it("should create device manager with uri", () => {
      expect(deviceManager.uri).toBe("localhost:647");
    });

    it("should throw error for invalid uri", () => {
      expect(() => new DeviceManager("")).toThrow();
    });
  });

  describe("authenticateDevice", () => {
    it("should authenticate device successfully", async () => {
      const response = new science.DeviceAuthenticationResponse({
        key: {
          keyId: "test-key",
          publicKey: "public-key",
          privateKey: "private-key",
          creationTimeNs: Long.fromNumber(Date.now() * 1e6),
          userEmail: "test@example.com",
          deviceSerial: "test-serial",
          organizationId: "test-org",
          authMethod: "oauth",
        },
      });

      deviceManager.rpc.authenticateDevice = jest.fn((req, callback) => {
        callback(null, response);
      });

      const request: science.DeviceAuthenticationRequest = new science.DeviceAuthenticationRequest({
        userEmail: "test@example.com",
        organizationId: "test-org",
        oauth: {
          token: "test-token",
          authServerUrl: "https://test.com",
        },
      });

      const result = await deviceManager.authenticateDevice(request);
      expect(result.status.ok()).toBe(true);
      expect(result.response).toEqual(response);
    });

    it("should handle authentication error", async () => {
      deviceManager.rpc.authenticateDevice = jest.fn((req, callback) => {
        callback(new Error("Authentication failed"));
      });

      const request: science.DeviceAuthenticationRequest = new science.DeviceAuthenticationRequest({
        userEmail: "test@example.com",
        organizationId: "test-org",
        oauth: {
          token: "test-token",
          authServerUrl: "https://test.com",
        },
      });

      await expect(deviceManager.authenticateDevice(request)).rejects.toThrow("Authentication failed");
    });
  });

  describe("listKeys", () => {
    it("should list keys successfully", async () => {
      const response = new science.ListKeysResponse({
        keys: [
          {
            keyId: "test-key",
            publicKey: "public-key",
            privateKey: "private-key",
            creationTimeNs: Long.fromNumber(Date.now() * 1e6),
            userEmail: "test@example.com",
            deviceSerial: "test-serial",
            organizationId: "test-org",
            authMethod: "oauth",
          },
        ],
      });

      deviceManager.rpc.listKeys = jest.fn((req, callback) => {
        callback(null, response);
      });

      const request = new science.ListKeysRequest({
        userEmail: "test@example.com",
      });

      const result = await deviceManager.listKeys(request);
      expect(result.status.ok()).toBe(true);
      expect(result.response).toEqual(response);
    });

    it("should handle list keys error", async () => {
      deviceManager.rpc.listKeys = jest.fn((req, callback) => {
        callback(new Error("List keys failed"));
      });

      const request = new science.ListKeysRequest({
        userEmail: "test@example.com",
      });

      await expect(deviceManager.listKeys(request)).rejects.toThrow("List keys failed");
    });
  });

  describe("revokeKey", () => {
    it("should revoke key successfully", async () => {
      const response = new science.RevokeKeyResponse({
        keyId: "test-key",
      });

      deviceManager.rpc.revokeKey = jest.fn((req, callback) => {
        callback(null, response);
      });

      const request = new science.RevokeKeyRequest({
        keyId: "test-key",
      });

      const result = await deviceManager.revokeKey(request);
      expect(result.status.ok()).toBe(true);
      expect(result.response).toEqual(response);
    });

    it("should handle revoke key error", async () => {
      deviceManager.rpc.revokeKey = jest.fn((req, callback) => {
        callback(new Error("Revoke key failed"));
      });

      const request = new science.RevokeKeyRequest({
        keyId: "test-key",
      });

      await expect(deviceManager.revokeKey(request)).rejects.toThrow("Revoke key failed");
    });
  });
});
