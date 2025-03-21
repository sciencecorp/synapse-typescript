# Synapse Node client

This repo contains the Node client for the [Synapse API](https://science.xyz/technologies/synapse). More information about the API can be found in the [docs](https://science.xyz/docs/d/synapse/index).

## Installation

```sh
npm i @science-corporation/synapse
```

```typescript
import { Config, Device, StreamOut, BroadbandSource } from "@science-corporation/synapse";
```

This repo wraps a gRPC client and so is not compatible with browser environments. However, utils and types may still be used in browser contexts with the `browser` export.

```typescript
import { Status, StatusCode, BroadbandSource, StreamOut } from "@science-corporation/synapse/browser";
```

## Building

### Prerequisites

- Node, npm ([nvm](https://github.com/nvm-sh/nvm) recommended)

To build:

    git submodule update --init
    npm i
    npm run generate
    npm run build

## Writing clients

```typescript
import { Config, Device, StreamOut, BroadbandSource } from "@science-corporation/synapse";

const device = new Device("127.0.0.1:647");
const info = await device.info();

console.log("Device info: ", info);

const streamOut = new StreamOut(
  {
    udpUnicast: {
      destinationPort: 50038,
    },
  },
  (msg: Buffer) => {
    console.log("StreamOut | recv: ", msg);
  }
);

const broadband = new BroadbandSource({
  peripheralId: 100,
  sampleRateHz: 30000,
  bitWidth: 12,
  gain: 20.0,
  signal: {
    electrode: {
      channels: [
        { id: 0, electrodeId: 0, referenceId: 1 },
        { id: 1, electrodeId: 2, referenceId: 3 },
        { id: 2, electrodeId: 4, referenceId: 5 },
        // ...
      ],
      lowCutoffHz: 500.0,
      highCutoffHz: 6000.0,
    },
  },
});

const config = new Config();
config.addNode(streamOut);
config.addNode(broadband);
config.connect(broadband, streamOut);

await device.configure(config);
await device.start();
```
