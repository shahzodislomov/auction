export type EnvironmentSource = Partial<Record<string, string | undefined>>;

export type AppEnvironment = {
  apiBaseUrl: string;
  v2ApiBaseUrl: string;
  webSocketUrl: string;
  googleOAuthClientId: string;
  authRefreshPath: string;
  phoneRegisterPath: string;
  phoneResendOtpPath: string;
  phoneVerifyOtpPath: string;
  sessionsPath: string;
  revokeOtherSessionsPath: string;
};

const DEFAULT_API_BASE_URL = "https://api.tezauksion.uz";
const DEFAULT_GOOGLE_OAUTH_CLIENT_ID =
  "714963113012-n65327u5f8kjhuoq1oecj3ast2rt17oj.apps.googleusercontent.com";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const readEnv = (source: EnvironmentSource, key: string): string => {
  return source[key]?.trim() ?? "";
};

export const appendPath = (baseUrl: string, path: string): string => {
  const normalizedBase = trimTrailingSlash(baseUrl.trim());
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!normalizedBase) {
    return normalizedPath;
  }

  return `${normalizedBase}${normalizedPath}`;
};

export const resolveAppEnvironment = (
  source: EnvironmentSource = process.env,
): AppEnvironment => {
  const apiBaseUrl = trimTrailingSlash(
    readEnv(source, "NEXT_PUBLIC_API_BASE_URL") || DEFAULT_API_BASE_URL,
  );
  const explicitV2ApiBaseUrl = trimTrailingSlash(
    readEnv(source, "NEXT_PUBLIC_API_V2_BASE_URL"),
  );
  const webSocketUrl = trimTrailingSlash(readEnv(source, "NEXT_PUBLIC_WS_URL"));
  const googleOAuthClientId =
    readEnv(source, "NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID") ||
    DEFAULT_GOOGLE_OAUTH_CLIENT_ID;
  const authRefreshPath =
    readEnv(source, "NEXT_PUBLIC_AUTH_REFRESH_PATH") || "/auth/refresh";
  const phoneRegisterPath = readEnv(source, "NEXT_PUBLIC_AUTH_PHONE_REGISTER_PATH");
  const phoneResendOtpPath = readEnv(source, "NEXT_PUBLIC_AUTH_PHONE_RESEND_OTP_PATH");
  const phoneVerifyOtpPath = readEnv(source, "NEXT_PUBLIC_AUTH_PHONE_VERIFY_OTP_PATH");
  const sessionsPath =
    readEnv(source, "NEXT_PUBLIC_AUTH_SESSIONS_PATH") || "/auth/sessions";
  const revokeOtherSessionsPath =
    readEnv(source, "NEXT_PUBLIC_AUTH_REVOKE_OTHER_SESSIONS_PATH") ||
    "/auth/sessions/other";

  return {
    apiBaseUrl,
    v2ApiBaseUrl: explicitV2ApiBaseUrl || appendPath(apiBaseUrl, "/api/v1"),
    webSocketUrl,
    googleOAuthClientId,
    authRefreshPath,
    phoneRegisterPath,
    phoneResendOtpPath,
    phoneVerifyOtpPath,
    sessionsPath,
    revokeOtherSessionsPath,
  };
};

export const resolveApiBaseUrl = (
  environment: AppEnvironment = resolveAppEnvironment(),
): string => environment.apiBaseUrl;

export const resolveV2ApiBaseUrl = (
  environment: AppEnvironment = resolveAppEnvironment(),
): string => environment.v2ApiBaseUrl;

export const resolveWebSocketUrl = (
  environment: AppEnvironment = resolveAppEnvironment(),
): string => environment.webSocketUrl;

export const resolveAuthRefreshPath = (
  environment: AppEnvironment = resolveAppEnvironment(),
): string => environment.authRefreshPath;

export const appEnvironment = resolveAppEnvironment();
