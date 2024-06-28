class ChannelMask {
  constructor(mask) {}

  *iterChannels() {
    for (let i = 0; i < 15; i++) {
      yield i;
    }
  }
}

export default ChannelMask;
