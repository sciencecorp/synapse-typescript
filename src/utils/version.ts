// Decode a Synapse API version uint32 into a "major.minor.patch" string.
//
// Encoding (see synapse-api device.proto, DeviceInfo.synapse_version):
//   bits [31:24] major (0-255)
//   bits [23:16] minor (0-255)
//   bits [15:0]  patch (0-65535)
export function decodeSynapseVersion(v: number): string {
  const major = (v >>> 24) & 0xff;
  const minor = (v >>> 16) & 0xff;
  const patch = v & 0xffff;
  return `${major}.${minor}.${patch}`;
}
