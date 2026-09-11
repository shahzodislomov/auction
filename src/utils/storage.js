export const getStorageItem = (key, fallback = null) => {
  if (typeof window === "undefined") return fallback;

  const storage = window.localStorage;
  if (!storage || typeof storage.getItem !== "function") return fallback;

  try {
    return storage.getItem(key);
  } catch {
    return fallback;
  }
};
