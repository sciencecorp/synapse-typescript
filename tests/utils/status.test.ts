import { synapse } from "../../src/api/api";
import { fromDeviceStatusCode, StatusCode } from "../../src/utils/status";

describe("status", () => {
  describe("fromDeviceStatusCode", () => {
    const cases = [
      { input: synapse.StatusCode.kOk, expected: StatusCode.OK },
      { input: synapse.StatusCode.kInvalidConfiguration, expected: StatusCode.INVALID_ARGUMENT },
      { input: synapse.StatusCode.kFailedPrecondition, expected: StatusCode.FAILED_PRECONDITION },
      { input: synapse.StatusCode.kUnimplemented, expected: StatusCode.UNIMPLEMENTED },
      { input: synapse.StatusCode.kInternalError, expected: StatusCode.INTERNAL },
      { input: synapse.StatusCode.kPermissionDenied, expected: StatusCode.PERMISSION_DENIED },
      { input: synapse.StatusCode.kUndefinedError, expected: StatusCode.UNKNOWN },
      { input: synapse.StatusCode.kQueryFailed, expected: StatusCode.UNKNOWN },
      { input: 999 as synapse.StatusCode, expected: StatusCode.UNKNOWN },
    ];

    cases.forEach(({ input, expected }) => {
      it(`should convert ${synapse.StatusCode[input] || input} to ${StatusCode[expected]}`, () => {
        expect(fromDeviceStatusCode(input)).toBe(expected);
      });
    });
  });
});
