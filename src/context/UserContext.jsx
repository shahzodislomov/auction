"use client";
import { getStorageItem } from "@/utils/storage";
import {
  clearStoredAuth,
  extractAuthTokens,
  storeAuthTokens,
} from "@/auth/storage";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';
import { deleteToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { resolveProfileIdentity } from "@/lib/auth/profileIdentity";

// Create Context
const UserContext = createContext(null);

// Fetch the current authenticated user from backend session state
const fetchCurrentUser = async () => {
  const response = await api.get("/auth/me");
  const body = response.data;
  const status = typeof body?.status === "string" ? body.status.trim().toUpperCase() : null;

  if (status && status !== "OK" && status !== "SUCCESS") {
    const error = new Error(body?.message || "Authenticated profile was rejected.");
    error.response = response;
    throw error;
  }

  const profile = body?.data ?? body ?? null;

  if (resolveProfileIdentity(profile) === null) {
    const error = new Error("Authenticated profile identity is invalid.");
    error.response = { status: 401, data: body };
    throw error;
  }

  return profile;
};

const isAuthoritativeAuthRejection = (error) => {
  const status = error?.response?.status;
  return status === 401 || status === 403;
};

// User Provider Component
export const UserProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const authGeneration = useRef(0);
  const [token, setToken] = useState(() =>
    typeof window !== "undefined" ? getStorageItem('token') : null
  );

  // React Query for user data
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["currentUser", token],
    queryFn: fetchCurrentUser,
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const clearUserCache = useCallback(() => {
    void queryClient.cancelQueries({ queryKey: ["currentUser"] });
    queryClient.removeQueries({ queryKey: ["currentUser"] });
  }, [queryClient]);

  // Login function
  const login = useCallback(async (newToken) => {
    const generation = ++authGeneration.current;
    const tokens = extractAuthTokens(newToken);
    const accessToken = tokens?.accessToken || newToken;

    clearUserCache();
    localStorage.removeItem('userId');

    if (tokens) {
      storeAuthTokens(tokens);
    } else {
      localStorage.setItem('token', accessToken);
    }

    setToken(accessToken);
    try {
      const newUser = await fetchCurrentUser();
      queryClient.setQueryData(["currentUser", accessToken], newUser);
      queryClient.setQueryData(["userByToken", accessToken], newUser);
      return newUser;
    } catch (error) {
      if (
        authGeneration.current === generation &&
        localStorage.getItem('token') === accessToken
      ) {
        clearStoredAuth();
        setToken((current) => (current === accessToken ? null : current));
        queryClient.removeQueries({ queryKey: ["currentUser", accessToken] });
      }
      console.error('Login error:', error);
      throw error;
    }
  }, [clearUserCache, queryClient]);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('userId');
      return;
    }

    if (error) {
      localStorage.removeItem('userId');
      if (
        isAuthoritativeAuthRejection(error) &&
        localStorage.getItem('token') === token
      ) {
        authGeneration.current += 1;
        clearStoredAuth();
        queryClient.removeQueries({ queryKey: ["currentUser", token] });
        window.setTimeout(() => {
          setToken((current) => (current === token ? null : current));
        }, 0);
      }
      return;
    }

    const profileId = resolveProfileIdentity(user);
    if (profileId !== null) {
      localStorage.setItem('userId', String(profileId));
    }
  }, [error, queryClient, token, user]);

  // Logout function
  const logout = useCallback(async () => {
    authGeneration.current += 1;
    clearStoredAuth();
    setToken(null);
    clearUserCache();

    try {
        // Remove stored FCM token
        const fcmToken = getStorageItem("fcmToken");
        if (fcmToken && messaging) {
            await deleteToken(messaging);
        }

        // Clear user query data
        queryClient.setQueryData(["currentUser", null], null);
        queryClient.clear();
    } catch (error) {
        console.error("❌ Error during logout:", error);
    } finally {
        localStorage.removeItem("fcmToken");
        localStorage.removeItem("notificationsEnabled");
    }
}, [clearUserCache, queryClient]);


  // Sync token state with localStorage (for multi-tabs)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key && event.key !== 'token') return;
      const nextToken = getStorageItem('token');
      if (nextToken === token) return;
      clearUserCache();
      authGeneration.current += 1;
      localStorage.removeItem('userId');
      setToken(nextToken);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearUserCache, token]);

  return (
      <UserContext.Provider value={{ user, isLoading, error, isAuthenticated: !!user, login, logout, refetch }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to Use User Context
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserContext must be used within a UserProvider');
  return context;
};
