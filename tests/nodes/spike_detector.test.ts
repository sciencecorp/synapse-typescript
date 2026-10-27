import { synapse } from "../../src/api/api";
import SpikeDetector from "../../src/nodes/spike_detector";

describe("SpikeDetector", () => {
  // threshold_uV is int32 (synapse-api 2.6.1): the sign is the crossing direction.
  // Under the old uint32 type a negative value decoded back as 4294966896.
  it("round-trips a negative threshold through the wire", () => {
    const node = new SpikeDetector({ thresholder: { thresholdUV: -400 }, samplesPerSpike: 32 });
    const wire = synapse.NodeConfig.encode(node.toProto()).finish();
    const back = SpikeDetector.fromProto(synapse.NodeConfig.decode(wire));
    expect(back.config.thresholder?.thresholdUV).toBe(-400);
  });
});
