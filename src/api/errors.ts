import axios from "axios";

export type StandardApiError = {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
  timestamp?: string;
  path?: string;
  isNetworkError: boolean;
  raw?: unknown;
};

const hasStringProperty = (
  value: unknown,
  property: string,
): value is Record<string, string> => {
  return (
    typeof value === "object" &&
    value !== null &&
    property in value &&
    typeof (value as Record<string, unknown>)[property] === "string"
  );
};

const getResponseData = (error: unknown): unknown => {
  if (axios.isAxiosError(error)) {
    return error.response?.data;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    return (error as { response?: { data?: unknown } }).response?.data;
  }

  return undefined;
};

const getResponseStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    return (error as { response?: { status?: number } }).response?.status;
  }

  return undefined;
};

const hasRequest = (error: unknown): boolean => {
  if (axios.isAxiosError(error)) {
    return Boolean(error.request && !error.response);
  }

  return (
    typeof error === "object" &&
    error !== null &&
    "request" in error &&
    !("response" in error)
  );
};

export const normalizeRequestError = (error: unknown): StandardApiError => {
  const data = getResponseData(error);
  const status = getResponseStatus(error);

  if (typeof data === "object" && data !== null) {
    const body = data as Record<string, unknown>;
    const message =
      (typeof body.message === "string" && body.message) ||
      (typeof body.error === "string" && body.error) ||
      "Request failed";

    return {
      code:
        (typeof body.code === "string" && body.code) ||
        (status ? `HTTP_${status}` : "API_ERROR"),
      message,
      status,
      details: body.details,
      timestamp: typeof body.timestamp === "string" ? body.timestamp : undefined,
      path: typeof body.path === "string" ? body.path : undefined,
      isNetworkError: false,
      raw: data,
    };
  }

  if (hasRequest(error)) {
    return {
      code: "NETWORK_ERROR",
      message: hasStringProperty(error, "message")
        ? error.message
        : "Network request failed",
      status,
      isNetworkError: true,
      raw: error,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "Unexpected request error",
    status,
    isNetworkError: false,
    raw: error,
  };
};
