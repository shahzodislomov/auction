import uz from "./uz";
import en from "./en";
import ru from "./ru";
import { champagneMessages } from "./champagne";

export const messages = {
  uz: { ...uz, ...champagneMessages.uz },
  en: { ...en, ...champagneMessages.en },
  ru: { ...ru, ...champagneMessages.ru },
};
