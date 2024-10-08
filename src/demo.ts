import fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { synapse } from "./api/api";
import Config from "./config";
import Device from "./device";
import ElectricalBroadband from "./nodes/electrical_broadband";
import OpticalStimulation from "./nodes/optical_stimulation";
import StreamIn from "./nodes/stream_in";
import StreamOut from "./nodes/stream_out";
import { discover } from "./utils/discover";
import { getName } from "./utils/enum";

const cli = yargs(hideBin(process.argv))
  .help()
  .command("discover", "Discover synapse devices")
  .command("read", "Read from StreamOut node", {
    "multicast-group": {
      alias: "m",
      type: "string",
      description: "Multicast group",
    },
    output: {
      alias: "o",
      type: "string",
      description: "Output file",
    },
    uri: {
      alias: "u",
      type: "string",
      demandOption: true,
    },
  })
  .command("write", "Write to StreamIn node", {
    input: {
      alias: "i",
      type: "string",
      description: "Input file",
    },
    uri: {
      alias: "u",
      type: "string",
      demandOption: true,
    },
  });

const info = async (device: Device) => {
  console.log("Info()");

  const info = await device.info();
  const { serial, name, status, synapseVersion, firmwareVersion, peripherals, configuration } = info;

  console.log(` - serial:                         ${serial}`);
  console.log(` - name:                           ${name}`);
  console.log(` - synapse version:                ${synapseVersion || "<unknown>"}`);
  console.log(` - firmware version:               ${firmwareVersion || "<unknown>"}`);

  console.log(
    ` - status:                         ${status.code} (${getName(synapse.StatusCode, status.code)})${
      status.message ? `: "${status.message}"` : ""
    }`
  );
  console.log(`   - state:                          ${getName(synapse.DeviceState, status.state)}`);

  console.log(`   - sockets:                        ${status.sockets?.length || 0}`);
  status.sockets?.forEach(({ nodeId, bind }) => {
    console.log(`     - node [${nodeId}] ${bind}`);
  });

  console.log(` - peripherals:                    ${peripherals?.length || 0}`);
  peripherals?.forEach(({ name, peripheralId: id, vendor }) => {
    console.log(`   - [${id}] ${name} (${vendor})`);
  });

  if (configuration) {
    const { nodes } = configuration;
    console.log(` - configuration:`);
    console.log(`   - nodes:                        ${nodes?.length || 0}`);
    nodes?.forEach(({ id, type }) => {
      console.log(`     - [${id}] (${getName(synapse.NodeType, type)})`);
    });
  }

  return true;
};

const read = async (device: Device, argv: any) => {
  console.log("Reading from device's StreamOut node...");

  const { multicastGroup, output } = argv;
  let ok = true;
  let stream = null;
  if (output) {
    console.log(`Writing to file: ${output}`);
    stream = fs.createWriteStream(output);
  }

  const onMessage = (msg: Buffer) => {
    const value = msg.readUInt32BE();
    console.log(`StreamOut | recv: ${value}`);
    if (stream) {
      stream.write(msg);
    }
  };

  const config = new Config();
  const nodeEphys = new ElectricalBroadband({
    peripheralId: 3,
    channels: [{ id: 0, referenceId: 0, electrodeId: 1 }],
    bitWidth: 12,
    sampleRate: 16000,
  });
  const nodeStreamOut = new StreamOut(
    {
      multicastGroup,
    },
    onMessage
  );

  ok = config.add([nodeEphys, nodeStreamOut]);
  ok = config.connect(nodeEphys, nodeStreamOut);
  if (!ok) {
    console.error("Failed to connect nodes");
    return;
  }

  console.log("Configuring device...");
  try {
    ok = await device.configure(config);
  } catch (e) {
    console.error(e);
    return;
  }

  console.log("Starting device...");
  try {
    ok = await device.start();
  } catch (e) {
    console.error(e);
    return;
  }

  nodeStreamOut.start();

  let running = true;
  process.on("SIGINT", function () {
    if (!running) {
      return;
    }

    running = false;
    nodeStreamOut.stop();
    device.stop();
  });
};

const write = async (device: Device, argv: any) => {
  const { input } = argv;

  if (input && !fs.existsSync(input)) {
    console.error(`File not found: ${input}`);
    return;
  }

  console.log("Writing to device's StreamOut node...");
  let ok = true;

  const config = new Config();
  const nodeStreamIn = new StreamIn({
    dataType: synapse.DataType.kBroadband,
  });
  const nodeOptical = new OpticalStimulation();

  ok = config.add([nodeStreamIn, nodeOptical]);
  ok = config.connect(nodeStreamIn, nodeOptical);
  if (!ok) {
    console.error("Failed to connect nodes");
    return;
  }

  console.log("Configuring device...");
  try {
    ok = await device.configure(config);
  } catch (e) {
    console.error(e);
    return;
  }

  console.log("Starting device...");
  try {
    ok = await device.start();
  } catch (e) {
    console.error(e);
    return;
  }

  let running = true;
  process.on("SIGINT", function () {
    console.log("SIGINT", running);
    if (!running) return;
    console.log("stopping...");

    running = false;
    device.stop();

    process.exit();
  });

  if (input) {
    console.log(`Reading from file: ${input}`);
    fs.open(input, "r", (err, fd) => {
      console.log("Opened file");
      const kBufSize = 4;
      const buffer = Buffer.alloc(kBufSize);

      if (err) {
        console.error(err);
        return;
      }

      const read = () => {
        if (!running) {
          fs.close(fd, () => {});
          return;
        }

        fs.read(fd, buffer, 0, kBufSize, null, (err, n) => {
          if (err) {
            console.error(err);
            return;
          }

          if (n === 0) {
            return;
          }

          console.log(`StreamIn | send: ${buffer.readUInt32BE()}`);
          nodeStreamIn.write(buffer.slice(0, n));
          read();
        });
      };

      read();
    });

    return;
  }

  let i = 0;
  const kInterval = 1;
  const buffer = Buffer.alloc(4);
  const write = () => {
    if (!running) {
      device.stop();
      return;
    }

    buffer.writeUInt32BE(i++);
    nodeStreamIn.write(buffer);

    setTimeout(write, kInterval);
  };
  setTimeout(write, kInterval);
};

const main = async () => {
  const argv = cli.parseSync();

  if (argv._.includes("discover")) {
    const devices = await discover();
    for (const device of devices) {
      console.log(`${device.host}:${device.port}   ${device.capability}   ${device.name} (${device.serial})`);
    }
    return;
  }

  const { uri } = argv;
  if (!uri) {
    console.error("Missing URI");
    return;
  }

  console.log(`Connecting to device @ ${uri}`);
  const device = new Device(uri as string);

  try {
    await info(device);
  } catch (e) {
    console.error(e);
    return;
  }

  if (argv._.includes("read")) {
    return read(device, argv);
  }

  if (argv._.includes("write")) {
    return write(device, argv);
  }
};

main();
