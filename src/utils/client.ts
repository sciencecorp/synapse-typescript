import { ChannelCredentials, ChannelOptions, loadPackageDefinition } from "@grpc/grpc-js";
import { fromJSON } from "@grpc/proto-loader";
import { Status, StatusCode } from "./status";

export interface CallOptions {
  deadline?: Date;
}

const pick = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => (acc && acc[part]) || null, obj);
};

const loadClient = (protoJson: object, serviceName: string): { status: Status; factory?: any } => {
  try {
    const definition = fromJSON(protoJson as any, {
      keepCase: false,
      arrays: true,
      enums: Number,
      defaults: true,
      oneofs: true,
    });

    const descriptor = loadPackageDefinition(definition as any);

    const service = pick(descriptor, serviceName);
    if (!service) {
      return { status: new Status(StatusCode.INTERNAL, `service ${serviceName} not found in proto definition`) };
    }

    return { status: new Status(StatusCode.OK), factory: service };
  } catch (error) {
    return { status: new Status(StatusCode.INTERNAL, "failed to load proto definition: " + error) };
  }
};

export const create =
  (protoJson: object, serviceName: string) =>
  (address: string, credentials: ChannelCredentials, options?: ChannelOptions): { status: Status; client?: any } => {
    const { status, factory } = loadClient(protoJson, serviceName);
    if (!status.ok()) {
      return { status };
    }
    const client = new factory(address, credentials, options);
    return { status, client };
  };
