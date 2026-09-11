import { createContext } from "react";

// Create context with default values
export const LangSwitch = createContext({
  currentLang: "uz", // Default language
  setCurrentLang: () => { }, // Placeholder function
});
