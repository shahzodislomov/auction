import { Client } from "@stomp/stompjs";
import { useEffect, useMemo, useState } from "react";
import SockJS from "sockjs-client";
import { resolveWebSocketUrl } from "../config/environment";

export function getSocketUrl() {
  const configuredUrl = resolveWebSocketUrl();
  if (configuredUrl) return configuredUrl;
  return process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_WS_URL : "https://api.tezauksion.uz/ws";
}

export function useSocket({ pollingAvailable = false } = {}) {
  const socketUrl = getSocketUrl();
  const logPrefix = "[WS]";
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const [transportState, setTransportState] = useState("connecting");

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const stompClient = useMemo(() => {
    if (!online || !socketUrl) {
      console.warn(logPrefix, "STOMP client not created", { online, socketUrl });
      return null;
    }

    const client = new Client({
      webSocketFactory: () => {
        console.debug(logPrefix, "Creating SockJS transport", { socketUrl });
        return new SockJS(socketUrl);
      },
      reconnectDelay: 5000,
      beforeConnect: () => {
        console.debug(logPrefix, "Before connect", { socketUrl });
        setTransportState((state) =>
          state === "connecting" ? "connecting" : "reconnecting",
        );
      },
      onConnect: (frame) => {
        console.info(logPrefix, "Connected", {
          socketUrl,
          headers: frame?.headers,
        });
        setTransportState("connected");
      },
      onDisconnect: (frame) => {
        console.warn(logPrefix, "Disconnected", { headers: frame?.headers });
        setTransportState("reconnecting");
      },
      onWebSocketClose: (event) => {
        console.warn(logPrefix, "WebSocket closed", {
          code: event?.code,
          reason: event?.reason,
          wasClean: event?.wasClean,
        });
        setTransportState("reconnecting");
      },
      onStompError: (frame) => {
        console.error(logPrefix, "STOMP error", {
          headers: frame?.headers,
          body: frame?.body,
        });
        setTransportState("reconnecting");
      },
    });

    return client;
  }, [online, socketUrl]);

  useEffect(() => {
    if (!stompClient) return undefined;
    console.debug(logPrefix, "Activating STOMP client");
    stompClient.activate();

    return () => {
      console.debug(logPrefix, "Deactivating STOMP client");
      void stompClient.deactivate();
    };
  }, [stompClient]);

  const connectionState = !online
    ? "offline"
    : !socketUrl
      ? pollingAvailable
        ? "polling"
        : "unavailable"
      : transportState;

  return useMemo(
    () => ({
      connected: Boolean(stompClient?.connected),
      connectionState,
      transportAvailable: Boolean(socketUrl),
      isPollingFallback: connectionState === "polling",
      publish: (...args) => {
        console.debug(logPrefix, "Publish", args[0]);
        return stompClient?.publish(...args);
      },
      subscribe: (...args) => {
        console.debug(logPrefix, "Subscribe", { destination: args[0] });
        return stompClient?.subscribe(...args);
      },
      client: stompClient,
    }),
    [connectionState, socketUrl, stompClient],
  );
}
