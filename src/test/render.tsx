import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { useState, type ReactElement, type ReactNode } from "react";
import { IntlProvider } from "react-intl";

import AlertProvider from "@/context/AlertProvider";
import { LangSwitch } from "@/context/LangSwitch";
import { UserProvider } from "@/context/UserContext";
import { champagneTheme } from "@/design-system/theme";
import { messages } from "@/locales";
import type { ChampagneLocale } from "@/locales/champagne";

export function renderWithAppProviders(
  ui: ReactElement,
  options?: { locale?: ChampagneLocale },
): ReturnType<typeof render> {
  const initialLocale = options?.locale ?? "uz";
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    const [currentLang, setCurrentLang] = useState(initialLocale);

    return (
      <ThemeProvider theme={champagneTheme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <AlertProvider>
            <UserProvider>
              <LangSwitch.Provider value={{ currentLang, setCurrentLang }}>
                <IntlProvider
                  locale={currentLang}
                  messages={messages[currentLang]}
                >
                  {children}
                </IntlProvider>
              </LangSwitch.Provider>
            </UserProvider>
          </AlertProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
