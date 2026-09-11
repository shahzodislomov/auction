export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type TokenRefreshManagerOptions = {
  getRefreshToken: () => string | null | undefined;
  requestRefresh: (refreshToken: string) => Promise<AuthTokens>;
  setTokens: (tokens: AuthTokens) => void;
  clearAuthState: () => void;
};

export type TokenRefreshManager = {
  refreshAccessToken: () => Promise<AuthTokens>;
  clearAuthState: () => void;
};

export const createTokenRefreshManager = (
  options: TokenRefreshManagerOptions,
): TokenRefreshManager => {
  let inFlightRefresh: Promise<AuthTokens> | null = null;

  const refreshAccessToken = async (): Promise<AuthTokens> => {
    if (inFlightRefresh) {
      return inFlightRefresh;
    }

    const refreshToken = options.getRefreshToken();

    if (!refreshToken) {
      throw new Error("auth.refresh.missingRefreshToken");
    }

    inFlightRefresh = options
      .requestRefresh(refreshToken)
      .then((tokens) => {
        options.setTokens(tokens);
        return tokens;
      })
      .catch((error) => {
        options.clearAuthState();
        throw error;
      })
      .finally(() => {
        inFlightRefresh = null;
      });

    return inFlightRefresh;
  };

  return {
    refreshAccessToken,
    clearAuthState: options.clearAuthState,
  };
};
