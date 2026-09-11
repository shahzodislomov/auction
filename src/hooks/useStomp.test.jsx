import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSocket } from "@/hooks/useStomp";

const socketState = vi.hoisted(() => ({
  config: null,
  client: {
    activate: vi.fn(),
    connected: false,
    deactivate: vi.fn(() => Promise.resolve()),
    publish: vi.fn(),
    subscribe: vi.fn(),
  },
}));

vi.mock("@stomp/stompjs", () => ({
  Client: class MockClient {
    constructor(config) {
      socketState.config = config;
      return socketState.client;
    }
  },
}));

vi.mock("sockjs-client", () => ({ default: vi.fn() }));

describe("useSocket", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WS_URL", "https://socket.example.test/ws");
    socketState.config = null;
    socketState.client.activate.mockClear();
    socketState.client.deactivate.mockClear();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("moves an initial configured transport failure into REST-backed reconnecting state", () => {
    const { result } = renderHook(() => useSocket({ pollingAvailable: true }));
    expect(result.current.connectionState).toBe("connecting");

    act(() => socketState.config?.onWebSocketClose?.());

    expect(result.current.connectionState).toBe("reconnecting");
  });
});
