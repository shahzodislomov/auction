"use client";

import { ThemeProvider } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { IntlProvider } from "react-intl";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import AlertProvider from "@/context/AlertProvider";
import { LangSwitch } from "@/context/LangSwitch";
import { UserProvider } from "@/context/UserContext";
import { TelegramMiniAppAutoLogin } from "@/components/auth/TelegramMiniAppAutoLogin";
import { resolveAppEnvironment } from "@/config/environment";
import { champagneTheme } from "@/design-system/theme";
import { messages } from "@/locales";
import {
  CHAMPAGNE_LOCALE_STORAGE_KEY,
  isChampagneLocale,
  type ChampagneLocale,
} from "@/locales/champagne";
import { persistBrowserLocale } from "@/lib/i18n/locale";

type Props = {
  children: ReactNode;
  initialLocale?: ChampagneLocale;
};

function readBrowserLocale(fallback: ChampagneLocale): ChampagneLocale {
  const requestedLocale = new URLSearchParams(window.location.search).get(
    "lang",
  );
  if (isChampagneLocale(requestedLocale)) return requestedLocale;

  try {
    const persistedLocale = window.localStorage.getItem(
      CHAMPAGNE_LOCALE_STORAGE_KEY,
    );
    return isChampagneLocale(persistedLocale) ? persistedLocale : fallback;
  } catch {
    return fallback;
  }
}

function LocaleQuerySync({
  setCurrentLang,
}: {
  setCurrentLang: Dispatch<SetStateAction<ChampagneLocale>>;
}) {
  const searchParams = useSearchParams();
  const requestedLocale = searchParams?.get("lang") ?? null;

  useEffect(() => {
    if (!isChampagneLocale(requestedLocale)) return undefined;

    const syncTask = window.setTimeout(() => {
      setCurrentLang(requestedLocale);
    }, 0);

    return () => window.clearTimeout(syncTask);
  }, [requestedLocale, setCurrentLang]);

  return null;
}

export default function Providers({ children, initialLocale = "uz" }: Props) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );
  const googleClientId = useMemo(
    () =>
      resolveAppEnvironment().googleOAuthClientId ||
      "714963113012-n65327u5f8kjhuoq1oecj3ast2rt17oj.apps.googleusercontent.com",
    [],
  );
  const [currentLang, setCurrentLang] =
    useState<ChampagneLocale>(initialLocale);

  useEffect(() => {
    const restoredLocale = readBrowserLocale(initialLocale);
    const restoreTask = window.setTimeout(() => {
      setCurrentLang(restoredLocale);
    }, 0);

    return () => window.clearTimeout(restoreTask);
  }, [initialLocale]);

  useEffect(() => {
    persistBrowserLocale(currentLang);
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const content = (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AlertProvider>
          <UserProvider>
            <TelegramMiniAppAutoLogin />
            <LangSwitch.Provider value={{ currentLang, setCurrentLang }}>
              <Suspense fallback={null}>
                <LocaleQuerySync setCurrentLang={setCurrentLang} />
              </Suspense>
              <IntlProvider
                locale={currentLang}
                messages={messages[currentLang]}
              >
                {children}
              </IntlProvider>
            </LangSwitch.Provider>
          </UserProvider>
        </AlertProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );

  return (
    <ThemeProvider theme={champagneTheme}>
      {googleClientId && googleClientId.trim().length > 0 ? (
        <GoogleOAuthProvider clientId={googleClientId.trim()}>
          {content}
        </GoogleOAuthProvider>
      ) : (
        content
      )}
    </ThemeProvider>
  );
}