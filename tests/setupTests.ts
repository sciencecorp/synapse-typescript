import { jest } from "@jest/globals";

export const mockSocket = {
  on: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
};

jest.mock("dgram", () => ({
  __esModule: true,
  default: {
    createSocket: jest.fn(() => mockSocket),
  },
}));
