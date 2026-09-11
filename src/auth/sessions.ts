export type UserSession = {
  id: string;
  current: boolean;
  deviceName?: string;
  ipAddress?: string;
  lastSeenAt?: string;
};

export type SessionAdapter = {
  listSessions: () => Promise<UserSession[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;
};

export type SessionManager = {
  list: () => Promise<UserSession[]>;
  revoke: (sessionId: string) => Promise<void>;
  revokeOthers: () => Promise<void>;
};

export const createSessionManager = (
  adapter: SessionAdapter,
): SessionManager => ({
  list: () => adapter.listSessions(),
  revoke: (sessionId: string) => adapter.revokeSession(sessionId),
  revokeOthers: () => adapter.revokeOtherSessions(),
});

export const createUnavailableSessionManager = (): SessionManager => ({
  list: async () => {
    throw new Error("auth.sessions.contractUnavailable");
  },
  revoke: async () => {
    throw new Error("auth.sessions.contractUnavailable");
  },
  revokeOthers: async () => {
    throw new Error("auth.sessions.contractUnavailable");
  },
});
