import axios from "axios";

import { normalizeRequestError } from "@/api/errors";
import { resolveV2ApiBaseUrl } from "@/config/environment";
import { readPreferredAcceptLanguage } from "@/lib/i18n/locale";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("token");
};

export const apiV2 = axios.create({
  baseURL: resolveV2ApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});



apiV2.interceptors.request.use((config) => {
  const token = getAuthToken();
  config.headers = config.headers ?? {};
  config.headers["Accept-Language"] = readPreferredAcceptLanguage();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiV2.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeRequestError(error)),
);
