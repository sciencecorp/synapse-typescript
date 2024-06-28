import dgram from "dgram";

interface DiscoverArgs {
  host: string;
  port: number;
  auth_code?: string;
}

export const discover = (args: DiscoverArgs) => {
  const socket = dgram.createSocket("udp4");

  socket.on("message", (msg: Buffer, rinfo: any) => {
    const server = `${rinfo.address}:${rinfo.port}`;
    const message = msg.toString("ascii");
    const split = message.split(" ");

    if (split.length < 5) {
      console.error(`invalid response from ${server}`);
      return;
    }

    if (split[0] !== "ID") {
      console.error(`invalid response from ${server}`);
      return;
    }

    const host = rinfo.address;
    const [_, serial, capability, port, name] = split;

    const service = capability.split(/(\d+)/)[0];
    if (service !== "SYN") {
      return;
    }

    console.log(`${host}:${port}   ${capability}   ${name} (${serial})`);
    return;
  });

  const payload = Buffer.from(`DISCOVER ${args.auth_code || 0}`, "ascii");

  console.log("Announcing...");
  socket.send(payload, 0, payload.length, args.port, args.host);
};
