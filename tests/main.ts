import Device from "../src/device";

const main = async () => {
  const uri = "localhost:647";
  console.log(`Connecting to device @ ${uri}`);
  const device = new Device("localhost:647");

  console.log("Info()");
  const info = await device.info();
  console.log(` - serial:           ${info.serial}`);
  console.log(` - name:             ${info.name}`);
  console.log(` - synapse version:  ${info.synapseVersion || "<unknown>"}`);
  console.log(` - firmware version: ${info.firmwareVersion || "<unknown>"}`);
};

main();
