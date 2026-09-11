import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

function installLocalStoragePolyfill() {
  if (
    typeof window !== "undefined" &&
    typeof window.localStorage?.clear === "function"
  ) {
    return;
  }

  const storage = new Map<string, string>();
  const localStorage = {
    get length() {
      return storage.size;
    },
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(String(key)) ?? null,
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    removeItem: (key: string) => {
      storage.delete(String(key));
    },
    setItem: (key: string, value: string) => {
      storage.set(String(key), String(value));
    },
  };

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: localStorage,
  });
}

installLocalStoragePolyfill();

vi.mock("@/lib/firebase", () => ({
  auth: null,
  generateToken: vi.fn(),
  messaging: null,
  provider: null,
  signInWithGoogle: vi.fn(),
}));

afterEach(() => cleanup());
