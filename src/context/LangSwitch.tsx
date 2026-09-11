import { createContext } from "react";

export type Lang = "uz" | "en" | "ru";

export interface LangContextType {
  currentLang: Lang;
  setCurrentLang: React.Dispatch<React.SetStateAction<Lang>>;
}

export const LangSwitch = createContext<LangContextType>({
  currentLang: "uz",
  setCurrentLang: () => {},
});