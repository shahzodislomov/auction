export type RegistrationMode = "email" | "phone";

export type RegistrationInput = {
  mode: RegistrationMode;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: boolean;
};

export type RegistrationPayload =
  | {
      mode: "email";
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    }
  | {
      mode: "phone";
      phone: string;
      firstName: string;
      lastName: string;
      password: string;
    };

export type RegistrationValidationResult =
  | { isValid: true; errors: Record<string, never>; payload: RegistrationPayload }
  | { isValid: false; errors: Record<string, string>; payload?: never };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+998\d{9}$/;

const normalizeText = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

export const normalizeUzPhone = (value: unknown): string => {
  const digits = normalizeText(value).replace(/\D/g, "");

  if (digits.startsWith("998") && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.length === 9) {
    return `+998${digits}`;
  }

  return normalizeText(value);
};

export const validateRegistrationInput = (
  input: RegistrationInput,
): RegistrationValidationResult => {
  const errors: Record<string, string> = {};
  const firstName = normalizeText(input.firstName);
  const lastName = normalizeText(input.lastName);
  const password = normalizeText(input.password);
  const confirmPassword = normalizeText(input.confirmPassword);

  if (!firstName) errors.firstName = "auth.validation.firstNameRequired";
  if (!lastName) errors.lastName = "auth.validation.lastNameRequired";
  if (!input.acceptedTerms) errors.acceptedTerms = "auth.validation.termsRequired";
  if (password.length < 8) errors.password = "auth.validation.passwordMin";
  if (password !== confirmPassword) {
    errors.confirmPassword = "auth.validation.passwordMismatch";
  }

  if (input.mode === "email") {
    const email = normalizeText(input.email);
    if (!emailPattern.test(email)) {
      errors.email = "auth.validation.emailInvalid";
    }

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors: {},
      payload: {
        mode: "email",
        email,
        firstName,
        lastName,
        password,
      },
    };
  }

  const phone = normalizeUzPhone(input.phone);
  if (!phonePattern.test(phone)) {
    errors.phone = "auth.validation.phoneInvalid";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    payload: {
      mode: "phone",
      phone,
      firstName,
      lastName,
      password,
    },
  };
};
