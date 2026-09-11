import axios from "axios";
import {
  resolveApiBaseUrl,
  resolveAuthRefreshPath,
} from "../config/environment";
import { normalizeRequestError } from "./errors";
import { createTokenRefreshManager } from "../auth/refresh";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  storeAuthTokens,
} from "../auth/storage";
import { readPreferredAcceptLanguage } from "../lib/i18n/locale";

const getAuthToken = () => {
  return getStoredAccessToken();
};

const refreshClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});



const applyCommonRequestHeaders = (config) => {
  config.headers = config.headers ?? {};
  config.headers["Accept-Language"] = readPreferredAcceptLanguage();
  return config;
};

refreshClient.interceptors.request.use(applyCommonRequestHeaders);

export const tokenRefreshManager = createTokenRefreshManager({
  getRefreshToken: getStoredRefreshToken,
  requestRefresh: async (refreshToken) => {
    const refreshPath = resolveAuthRefreshPath();

    if (!refreshPath) {
      throw new Error("auth.refresh.contractUnavailable");
    }

    const response = await refreshClient.post(refreshPath, { refreshToken });
    const data = response.data?.data ?? response.data;
    const accessToken = data?.accessToken ?? data?.token;
    const nextRefreshToken = data?.refreshToken ?? data?.refresh_token;

    if (!accessToken) {
      throw new Error("auth.refresh.invalidResponse");
    }

    return {
      accessToken,
      refreshToken: nextRefreshToken,
    };
  },
  setTokens: storeAuthTokens,
  clearAuthState: clearStoredAuth,
});

export const legacyApiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});
export const FileSending = axios.create({
    baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "multipart/form-data",
  },
})

FileSending.interceptors.request.use((config) => {
  applyCommonRequestHeaders(config);
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
legacyApiClient.interceptors.request.use((config) => {
  applyCommonRequestHeaders(config);
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
FileSending.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true;

      try {
        const tokens = await tokenRefreshManager.refreshAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return FileSending(originalRequest);
      } catch (refreshError) {
        return Promise.reject(normalizeRequestError(refreshError));
      }
    }

    return Promise.reject(normalizeRequestError(error));
  },
);

legacyApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._authRetry) {
      originalRequest._authRetry = true;

      try {
        const tokens = await tokenRefreshManager.refreshAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return legacyApiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(normalizeRequestError(refreshError));
      }
    }

    return Promise.reject(normalizeRequestError(error));
  },
);

export const api = legacyApiClient;
export const fileSend = FileSending
