import dgram from "dgram";

const BROADCAST_PORT = 6470;

interface DeviceInfo {
  host: string;
  port: number;
  capability: string;
  name: string;
  serial: string;
}

export const discover = (timeoutMs = 1000): Promise<DeviceInfo[]> => {
  return new Promise((resolve, reject) => {
    const devices: DeviceInfo[] = [];
    const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

    socket.bind(BROADCAST_PORT);

    socket.on("message", (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      const message = msg.toString("ascii");
      const split = message.split(" ");

      if (split[0] !== "ID" || split.length !== 5) {
        return;
      }

      const [, serial, capability, portStr, name] = split;
      const port = parseInt(portStr);
      if (isNaN(port)) {
        return;
      }

      const deviceInfo: DeviceInfo = {
        host: rinfo.address,
        port,
        capability,
        name,
        serial,
      };

      if (
        !devices.find((d) => d.host === deviceInfo.host && d.port === deviceInfo.port && d.serial === deviceInfo.serial)
      ) {
        devices.push(deviceInfo);
      }
    });

    socket.on("error", (err: Error) => {
      socket.close();
      reject(err);
    });

    socket.on("close", () => {
      resolve(devices);
    });

    setTimeout(() => {
      socket.close();
    }, timeoutMs);
  });
};
