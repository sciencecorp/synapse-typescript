export class MockSocket {
  private handlers: { [event: string]: any[] } = {};
  private recvBufferSize = 1024;

  address = jest.fn().mockReturnValue({ address: "192.168.0.1" });

  on = jest.fn().mockImplementation((event: string, callback: any) => {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(callback);
  });

  send = jest.fn();

  close = jest.fn().mockImplementation(() => {
    if (this.handlers["close"]) {
      this.handlers["close"].forEach((cb) => cb());
    }
  });

  bind = jest.fn();

  emit(event: string, ...args: any[]) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((cb) => cb(...args));
    }
  }

  getRecvBufferSize = jest.fn().mockReturnValue(this.recvBufferSize);
  setRecvBufferSize = jest.fn((size: number) => {
    this.recvBufferSize = size;
  });
}
