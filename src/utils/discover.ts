import dgram from "dgram";

const kDefaultTimeout = 3000;

interface DiscoverArgs {
  host: string;
  port: number;
  timeoutMs?: number;
}

class DeviceAdvertisement {
  host: string;
  port: number;
  serial: string;
  capability: string;
  name: string;
}

const kDefaultDiscoverArgs: DiscoverArgs = {
  host: "224.0.0.245",
  port: 6470,
  timeoutMs: kDefaultTimeout,
};

export const discover = (args = kDefaultDiscoverArgs): Promise<DeviceAdvertisement[]> => {
  return new Promise((resolve, reject) => {
    const devices: DeviceAdvertisement[] = [];

    const socket = dgram.createSocket("udp4");

    socket.on("message", (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      const message = msg.toString("ascii");
      const split = message.split(" ");

      if (split.length < 5) {
        return;
      }

      if (split[0] !== "ID") {
        return;
      }

      const host = rinfo.address;
      const [, serial, capability, portstr, name] = split;
      const port = parseInt(portstr);
      if (isNaN(port)) {
        return;
      }

      const service = capability.split(/(\d+)/)[0];
      if (service !== "SYN") {
        return;
      }

      devices.push({
        host,
        port,
        serial,
        capability,
        name,
      });
    });

    const payload = Buffer.from(`DISCOVER`, "ascii");

    socket.send(payload, 0, payload.length, args.port, args.host, () => {
      if (!args.timeoutMs) {
        return;
      }
      setTimeout(() => socket.close(), kDefaultTimeout);
    });

    socket.on("error", (err: Error) => {
      reject(err);
    });

    socket.on("close", () => {
      resolve(devices);
    });
  });
};
