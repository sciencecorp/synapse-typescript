import { synapse } from "../api/api";
import Node from "../node";

class DiskWriter extends Node {
  type = synapse.NodeType.kDiskWriter;
  config: synapse.IDiskWriterConfig;

  constructor(config: synapse.IDiskWriterConfig = {}) {
    super();

    this.config = config;
  }

  toProto(): synapse.NodeConfig {
    return super.toProto({
      diskWriter: this.config,
    });
  }

  static fromProto(proto: synapse.INodeConfig): DiskWriter {
    const { diskWriter } = proto;
    if (!diskWriter) {
      throw new Error("Invalid config, missing diskWriter");
    }

    return new DiskWriter(proto.diskWriter);
  }
}

export default DiskWriter;
