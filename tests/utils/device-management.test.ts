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

  describe("Authentication", () => {
    describe("authenticateDevice", () => {
      it("should authenticate device successfully", async () => {
        const response = new science.DeviceAuthenticationResponse({
          key: {
            keyId: "test-key",
            publicKey: "public-key",
            privateKey: "private-key",
            creationTimeNs: Date.now() * 1e6,
            userEmail: "test@example.com",
            deviceSerial: "test-serial",
            organizationId: "test-org",
            authMethod: "oauth",
          },
        });

        deviceManager.rpc_auth.authenticateDevice = jest.fn((req, options, callback) => {
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
        deviceManager.rpc_auth.authenticateDevice = jest.fn((req, options, callback) => {
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
              creationTimeNs: Date.now() * 1e6,
              userEmail: "test@example.com",
              deviceSerial: "test-serial",
              organizationId: "test-org",
              authMethod: "oauth",
            },
          ],
        });

        deviceManager.rpc_auth.listKeys = jest.fn((req, options, callback) => {
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
        deviceManager.rpc_auth.listKeys = jest.fn((req, options, callback) => {
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

        deviceManager.rpc_auth.revokeKey = jest.fn((req, options, callback) => {
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
        deviceManager.rpc_auth.revokeKey = jest.fn((req, options, callback) => {
          callback(new Error("Revoke key failed"));
        });

        const request = new science.RevokeKeyRequest({
          keyId: "test-key",
        });

        await expect(deviceManager.revokeKey(request)).rejects.toThrow("Revoke key failed");
      });
    });
  });

  describe("Update", () => {
    describe("listPackages", () => {
      it("should list packages successfully", async () => {
        const response = new science.ListPackagesResponse({
          packages: [
            {
              name: "test-package",
              installedVersion: "1.0.0",
              latestVersion: "1.1.0",
            },
          ],
        });

        deviceManager.rpc_update.listPackages = jest.fn((req, options, callback) => {
          callback(null, response);
        });

        const request = new science.ListPackagesRequest({});

        const result = await deviceManager.listPackages(request);
        expect(result.status.ok()).toBe(true);
        expect(result.response).toEqual(response);
      });

      it("should handle list packages error", async () => {
        deviceManager.rpc_update.listPackages = jest.fn((req, options, callback) => {
          callback(new Error("List packages failed"));
        });

        const request = new science.ListPackagesRequest({});

        await expect(deviceManager.listPackages(request)).rejects.toThrow("List packages failed");
      });
    });

    describe("updatePackages", () => {
      it("should update packages successfully", async () => {
        const response = new science.UpdateResult({
          name: "test-package",
          success: true,
        });

        deviceManager.rpc_update.updatePackages = jest.fn((req, options, callback) => {
          callback(null, response);
        });

        const request = new science.UpdatePackagesRequest({
          packages: [
            {
              name: "test-package",
              version: "1.1.0",
            },
          ],
        });

        const result = await deviceManager.updatePackages(request);
        expect(result.status.ok()).toBe(true);
        expect(result.response).toEqual(response);
      });

      it("should handle update packages error", async () => {
        deviceManager.rpc_update.updatePackages = jest.fn((req, options, callback) => {
          callback(new Error("Update packages failed"));
        });

        const request = new science.UpdatePackagesRequest({
          packages: [
            {
              name: "test-package",
              version: "1.1.0",
            },
          ],
        });

        await expect(deviceManager.updatePackages(request)).rejects.toThrow("Update packages failed");
      });
    });

    describe("uploadPackage", () => {
      it("should upload package successfully", async () => {
        const response = new science.UpdateResult({
          name: "test-package",
          success: true,
        });

        deviceManager.rpc_update.uploadPackage = jest.fn((req, options, callback) => {
          callback(null, response);
        });

        const request = new science.UpdatePackageChunk({
          metadata: {
            name: "test-package",
            version: "1.0.0",
            size: 1024,
            sha256Sum: "abc123",
          },
        });

        const result = await deviceManager.uploadPackage(request);
        expect(result.status.ok()).toBe(true);
        expect(result.response).toEqual(response);
      });

      it("should handle upload package error", async () => {
        deviceManager.rpc_update.uploadPackage = jest.fn((req, options, callback) => {
          callback(new Error("Upload package failed"));
        });

        const request = new science.UpdatePackageChunk({
          metadata: {
            name: "test-package",
            version: "1.0.0",
            size: 1024,
            sha256Sum: "abc123",
          },
        });

        await expect(deviceManager.uploadPackage(request)).rejects.toThrow("Upload package failed");
      });
    });
  });
});
