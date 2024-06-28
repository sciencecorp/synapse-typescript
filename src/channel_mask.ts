const kChannelMaskAll = "all";

class ChannelMask {
  constructor(mask: string = kChannelMaskAll) {}

  *iterChannels() {
    for (let i = 0; i < 15; i++) {
      yield i;
    }
  }
}

export default ChannelMask;
