import { status as StatusCode } from "@grpc/grpc-js";
import { synapse } from "../api/api";

class Status {
  constructor(public code: StatusCode = StatusCode.OK, public message: string = "") {}

  static fromProto(proto: any) {
    return new Status(proto.code, proto.message);
  }

  ok() {
    return this.code === StatusCode.OK;
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
