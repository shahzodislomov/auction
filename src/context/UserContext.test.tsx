import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserProvider, useUserContext } from "./UserContext";

const authSpies = vi.hoisted(() => ({
  deleteToken: vi.fn(),
  get: vi.fn(),
}));

vi.mock("@/api/api", () => ({
  api: { get: authSpies.get },
}));

vi.mock("firebase/messaging", () => ({
  deleteToken: authSpies.deleteToken,
}));

vi.mock("@/lib/firebase", () => ({
  messaging: { app: "test" },
}));

function UserProbe() {
  const { isAuthenticated, login, logout, user } = useUserContext() as unknown as {
    isAuthenticated: boolean;
    login: (token: string) => Promise<{ id?: string | number }>;
    logout: () => Promise<void>;
    user?: { firstname?: string } | null;
  };

  return (
    <div>
      <output data-testid="identity">
        {isAuthenticated ? user?.firstname : "Guest"}
      </output>
      <button
        type="button"
        onClick={() =>
          void login("beta")
            .then((profile) => {
              if (profile.id !== undefined) {
                window.localStorage.setItem(
                  "returnedProfileId",
                  String(profile.id),
                );
              }
            })
            .catch(() => undefined)
        }
      >
        Switch account
      </button>
      <button
        type="button"
        onClick={() => void login("alpha").catch(() => undefined)}
      >
        Start alpha login
      </button>
      <button type="button" onClick={() => logout()}>
        Log out
      </button>
    </div>
  );
}

function renderProvider(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <UserProbe />
      </UserProvider>
    </QueryClientProvider>,
  );
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("UserProvider token isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    document.cookie = "token=; Max-Age=0; path=/";
    authSpies.deleteToken.mockResolvedValue(true);
    authSpies.get.mockImplementation(
      () =>
        Promise.resolve({
          data: {
            data:
              window.localStorage.getItem("token") === "alpha"
                ? { id: 1, firstname: "Alice" }
                : { id: 2, firstname: "Bob" },
          },
        }),
    );
  });

  it("keys user data by token and removes the previous account on login", async () => {
    const user = userEvent.setup();
    const queryClient = createQueryClient();
    window.localStorage.setItem("token", "alpha");

    renderProvider(queryClient);
    expect(await screen.findByText("Alice")).toBeVisible();
    await waitFor(() => expect(window.localStorage.getItem("userId")).toBe("1"));

    await user.click(screen.getByRole("button", { name: "Switch account" }));

    expect(await screen.findByText("Bob")).toBeVisible();
    expect(queryClient.getQueryData(["currentUser", "alpha"])).toBeUndefined();
    expect(queryClient.getQueryData(["currentUser", "beta"])).toMatchObject({
      firstname: "Bob",
    });
    expect(window.localStorage.getItem("userId")).toBe("2");
    expect(window.localStorage.getItem("returnedProfileId")).toBe("2");
    expect(document.cookie).toContain("token=beta");
  });

  it("clears local and cached authentication even when FCM deletion fails", async () => {
    const user = userEvent.setup();
    const queryClient = createQueryClient();
    window.localStorage.setItem("token", "alpha");
    window.localStorage.setItem("fcmToken", "push-token");
    window.localStorage.setItem("userId", "1");
    authSpies.deleteToken.mockRejectedValueOnce(new Error("FCM unavailable"));

    renderProvider(queryClient);
    expect(await screen.findByText("Alice")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(screen.getByTestId("identity")).toHaveTextContent("Guest"));
    expect(window.localStorage.getItem("token")).toBeNull();
    expect(window.localStorage.getItem("userId")).toBeNull();
    expect(document.cookie).not.toContain("token=");
    expect(queryClient.getQueryData(["currentUser", "alpha"])).toBeUndefined();
    expect(queryClient.getQueryData(["currentUser", null])).toBeUndefined();
  });

  it("clears a stale user id when a replacement login cannot load its profile", async () => {
    const user = userEvent.setup();
    const queryClient = createQueryClient();
    window.localStorage.setItem("userId", "99");
    authSpies.get.mockRejectedValueOnce(new Error("profile unavailable"));

    renderProvider(queryClient);
    await user.click(screen.getByRole("button", { name: "Switch account" }));

    await waitFor(() => expect(window.localStorage.getItem("token")).toBeNull());
    expect(window.localStorage.getItem("userId")).toBeNull();
    expect(screen.getByTestId("identity")).toHaveTextContent("Guest");
  });

  it.each([
    {
      label: "an explicit ERROR envelope",
      payload: { status: "ERROR", message: "Profile rejected", data: { id: 9 } },
    },
    { label: "a null profile", payload: { status: "OK", data: null } },
    {
      label: "a profile without identity",
      payload: { status: "OK", data: { roles: [{ name: "ADMIN" }] } },
    },
    {
      label: "an anonymous sentinel identity",
      payload: { status: "OK", data: { id: 0, roles: [{ name: "ADMIN" }] } },
    },
    {
      label: "conflicting identity aliases",
      payload: {
        status: "OK",
        data: { id: 41, userId: 99, roles: [{ name: "ADMIN" }] },
      },
    },
  ])("does not authenticate from $label", async ({ payload }) => {
    const user = userEvent.setup();
    const queryClient = createQueryClient();
    window.localStorage.setItem("userId", "99");
    authSpies.get.mockResolvedValueOnce({ data: payload });

    renderProvider(queryClient);
    await user.click(screen.getByRole("button", { name: "Switch account" }));

    await waitFor(() => expect(window.localStorage.getItem("token")).toBeNull());
    expect(window.localStorage.getItem("userId")).toBeNull();
    expect(screen.getByTestId("identity")).toHaveTextContent("Guest");
    expect(queryClient.getQueryData(["currentUser", "beta"])).toBeUndefined();
  });

  it("drops the prior account when another tab swaps or removes the token", async () => {
    const queryClient = createQueryClient();
    window.localStorage.setItem("token", "alpha");
    renderProvider(queryClient);
    expect(await screen.findByText("Alice")).toBeVisible();

    window.localStorage.setItem("token", "beta");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "token", newValue: "beta" }),
      );
    });

    expect(await screen.findByText("Bob")).toBeVisible();
    expect(queryClient.getQueryData(["currentUser", "alpha"])).toBeUndefined();

    window.localStorage.removeItem("token");
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "token", newValue: null }),
      );
    });

    await waitFor(() => expect(screen.getByTestId("identity")).toHaveTextContent("Guest"));
    expect(queryClient.getQueryData(["currentUser", "alpha"])).toBeUndefined();
    expect(queryClient.getQueryData(["currentUser", "beta"])).toBeUndefined();
    expect(queryClient.getQueryData(["currentUser", null])).toBeUndefined();
  });

  it("does not let a superseded login clear or overwrite the newer account", async () => {
    const user = userEvent.setup();
    const queryClient = createQueryClient();
    let resolveAlpha!: (value: {
      data: { data: { firstname: string; id: number } };
    }) => void;
    const alphaResponse = new Promise<{
      data: { data: { firstname: string; id: number } };
    }>((resolve) => {
      resolveAlpha = resolve;
    });
    authSpies.get.mockImplementation(
      () =>
        window.localStorage.getItem("token") === "alpha"
          ? alphaResponse
          : Promise.resolve({
              data: { data: { id: 2, firstname: "Bob" } },
            }),
    );

    renderProvider(queryClient);
    await user.click(screen.getByRole("button", { name: "Start alpha login" }));
    await user.click(screen.getByRole("button", { name: "Switch account" }));

    expect(await screen.findByText("Bob")).toBeVisible();
    expect(window.localStorage.getItem("token")).toBe("beta");
    expect(window.localStorage.getItem("userId")).toBe("2");

    resolveAlpha({ data: { data: { id: 1, firstname: "Alice" } } });
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Bob")).toBeVisible();
    expect(window.localStorage.getItem("token")).toBe("beta");
    expect(window.localStorage.getItem("userId")).toBe("2");
  });

  it("clears an expired token after an authoritative profile rejection", async () => {
    const queryClient = createQueryClient();
    window.localStorage.setItem("token", "expired");
    window.localStorage.setItem("userId", "99");
    authSpies.get.mockRejectedValueOnce({ response: { status: 401 } });

    renderProvider(queryClient);

    await waitFor(() => {
      expect(window.localStorage.getItem("token")).toBeNull();
    });
    expect(window.localStorage.getItem("userId")).toBeNull();
    expect(screen.getByTestId("identity")).toHaveTextContent("Guest");
  });

  it("keeps a token available for retry after a transient profile failure", async () => {
    const queryClient = createQueryClient();
    window.localStorage.setItem("token", "offline");
    window.localStorage.setItem("userId", "99");
    authSpies.get.mockRejectedValueOnce(new Error("network unavailable"));

    renderProvider(queryClient);

    await waitFor(() => {
      expect(window.localStorage.getItem("userId")).toBeNull();
    });
    expect(window.localStorage.getItem("token")).toBe("offline");
    expect(screen.getByTestId("identity")).toHaveTextContent("Guest");
  });
});
