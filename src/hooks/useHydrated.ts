"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns false for server output and the first hydration pass, then true on
 * the client. Use it before reading browser-only identity or clock state.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}
