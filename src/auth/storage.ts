import type { AuthTokens } from "./refresh";

export const ACCESS_TOKEN_KEY = "token";
export const REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const setAuthCookie = (name: string, value: string): void => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
};

const clearAuthCookie = (name: string): void => {
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
};

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getStoredRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const storeAuthTokens = (tokens: AuthTokens): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  setAuthCookie(ACCESS_TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
};

export const clearStoredAuth = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem("userId");
  clearAuthCookie(ACCESS_TOKEN_KEY);
};

export const extractAuthTokens = (payload: unknown): AuthTokens | null => {
  if (typeof payload === "string") {
    return { accessToken: payload };
  }

  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const nestedData =
    typeof record.data === "object" && record.data !== null
      ? (record.data as Record<string, unknown>)
      : undefined;
  const tokenSource = nestedData ?? record;
  const accessToken =
    (typeof tokenSource.accessToken === "string" && tokenSource.accessToken) ||
    (typeof tokenSource.token === "string" && tokenSource.token) ||
    (typeof record.message === "string" && record.message) ||
    "";
  const refreshToken =
    (typeof tokenSource.refreshToken === "string" && tokenSource.refreshToken) ||
    (typeof tokenSource.refresh_token === "string" && tokenSource.refresh_token) ||
    "";

  if (!accessToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken: refreshToken || undefined,
  };
};
