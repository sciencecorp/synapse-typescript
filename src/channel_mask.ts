class ChannelMask {
  mask: number[];

  constructor(mask: number[]) {
    this.mask = mask;
  }

  *iterChannels() {
    for (let i = 0; i < this.mask.length; i++) {
      yield this.mask[i];
    }
  }
}

export default ChannelMask;
