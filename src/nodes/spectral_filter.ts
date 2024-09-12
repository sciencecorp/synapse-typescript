import { synapse } from "../api/api";
import Node from "../node";

class SpectralFilter extends Node {
  type = synapse.NodeType.kSpectralFilter;
  config: synapse.ISpectralFilterConfig;

  constructor(config: synapse.ISpectralFilterConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      spectralFilter: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): SpectralFilter {
    const { spectralFilter } = proto;
    if (!spectralFilter) {
      throw new Error("Invalid config, missing spectralFilter");
    }

    return new SpectralFilter(proto.spectralFilter);
  }
}

export default SpectralFilter;
