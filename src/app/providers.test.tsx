import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LangSwitch } from "@/context/LangSwitch";
import {
  CHAMPAGNE_LOCALE_STORAGE_KEY,
  type ChampagneLocale,
} from "@/locales/champagne";

import Providers from "./providers";

const searchParamsState = vi.hoisted(() => ({ value: "" }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(searchParamsState.value),
}));

function LocaleProbe() {
  const { currentLang, setCurrentLang } = useContext(LangSwitch);

  return (
    <>
      <output data-testid="locale">{currentLang}</output>
      <button
        type="button"
        onClick={() => setCurrentLang("ru" as ChampagneLocale)}
      >
        switch to ru
      </button>
    </>
  );
}

describe("Providers locale runtime", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
    document.cookie = `${CHAMPAGNE_LOCALE_STORAGE_KEY}=; Path=/; Max-Age=0`;
    document.documentElement.lang = "uz";
    searchParamsState.value = "";
  });

  it("restores a saved locale and persists later locale changes", async () => {
    window.localStorage.setItem(CHAMPAGNE_LOCALE_STORAGE_KEY, "en");

    render(
      <Providers>
        <LocaleProbe />
      </Providers>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("en");
      expect(document.documentElement).toHaveAttribute("lang", "en");
      expect(document.cookie).toContain(`${CHAMPAGNE_LOCALE_STORAGE_KEY}=en`);
    });

    fireEvent.click(screen.getByRole("button", { name: "switch to ru" }));

    await waitFor(() => {
      expect(window.localStorage.getItem(CHAMPAGNE_LOCALE_STORAGE_KEY)).toBe(
        "ru",
      );
      expect(document.documentElement).toHaveAttribute("lang", "ru");
      expect(document.cookie).toContain(`${CHAMPAGNE_LOCALE_STORAGE_KEY}=ru`);
    });
  });

  it("renders the server-selected locale on the initial pass", () => {
    render(
      <Providers initialLocale="ru">
        <LocaleProbe />
      </Providers>,
    );

    expect(screen.getByTestId("locale")).toHaveTextContent("ru");
  });

  it("prioritizes query locale and reacts to client-side query changes", async () => {
    window.localStorage.setItem(CHAMPAGNE_LOCALE_STORAGE_KEY, "uz");
    window.history.replaceState(null, "", "/?lang=ru");
    searchParamsState.value = "lang=ru";

    const { rerender } = render(
      <Providers>
        <LocaleProbe />
      </Providers>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("locale")).toHaveTextContent("ru");
    });

    window.history.pushState(null, "", "/?lang=en");
    searchParamsState.value = "lang=en";
    rerender(
      <Providers>
        <LocaleProbe />
      </Providers>,
    );

    await waitFor(() => {
      expect(window.localStorage.getItem(CHAMPAGNE_LOCALE_STORAGE_KEY)).toBe("en");
      expect(document.documentElement).toHaveAttribute("lang", "en");
    });
    expect(document.cookie).toContain(`${CHAMPAGNE_LOCALE_STORAGE_KEY}=en`);
  });

  it("does not inject a client-only global Emotion reset into the app tree", () => {
    render(
      <Providers>
        <LocaleProbe />
      </Providers>,
    );

    expect(document.querySelector('style[data-emotion*="global"]')).toBeNull();
  });
});
