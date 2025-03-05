import { Status as StatusCode } from "@grpc/grpc-js/build/src/constants";
import { synapse } from "../api/api";

export interface IStatus {
  code: StatusCode;
  message: string;
}

class Status implements IStatus {
  constructor(public code: StatusCode = StatusCode.OK, public message: string = "") {}

  ok() {
    return this.code === StatusCode.OK;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }

  static fromJSON(json: { code: StatusCode; message: string }) {
    return new Status(json.code, json.message);
  }

  static fromProto(proto: any) {
    return new Status(proto.code, proto.message);
  }
}

export const fromDeviceStatusCode = (status: synapse.StatusCode) => {
  switch (status) {
    case synapse.StatusCode.kOk:
      return StatusCode.OK;
    case synapse.StatusCode.kInvalidConfiguration:
      return StatusCode.INVALID_ARGUMENT;
    case synapse.StatusCode.kFailedPrecondition:
      return StatusCode.FAILED_PRECONDITION;
    case synapse.StatusCode.kUnimplemented:
      return StatusCode.UNIMPLEMENTED;
    case synapse.StatusCode.kInternalError:
      return StatusCode.INTERNAL;
    case synapse.StatusCode.kPermissionDenied:
      return StatusCode.PERMISSION_DENIED;
    case synapse.StatusCode.kUndefinedError:
    case synapse.StatusCode.kQueryFailed:
    default:
      return StatusCode.UNKNOWN;
  }
};

export const fromDeviceStatus = ({ code, message }: { code: synapse.StatusCode; message?: string }) => {
  return new Status(fromDeviceStatusCode(code), message);
};

export { Status, StatusCode };
