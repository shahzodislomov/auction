"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

// Helper for joining CSS class names
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface QuestionnaireItemConfig {
  name: string;
  required?: boolean;
  multiple?: boolean;
  title?: string;
  description?: string;
  [key: string]: unknown;
}

interface QuestionnaireContextValue {
  activeItem: string;
  setActiveItem: (name: string) => void;
  items: readonly QuestionnaireItemConfig[];
  currentIndex: number;
  totalItems: number;
  goToNext: () => boolean;
  goToPrevious: () => void;
  skip: () => void;
  shortcuts?: "letters" | "numbers" | boolean;
  errors: Record<string, string | null>;
  setFieldError: (name: string, error: string | null) => void;
  answers: Record<string, string[]>;
  setAnswerValues: (name: string, values: string[]) => void;
}

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(null);

function useQuestionnaire() {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error("Questionnaire subcomponents must be used within <Questionnaire>");
  }
  return context;
}

interface QuestionnaireItemContextValue {
  name: string;
  multiple: boolean;
  required: boolean;
  selectedValues: string[];
  toggleValue: (value: string) => void;
  error: string | null;
  choiceCountRef: { current: number };
}

const QuestionnaireItemContext = createContext<QuestionnaireItemContextValue | null>(null);

function useQuestionnaireItem() {
  const context = useContext(QuestionnaireItemContext);
  if (!context) {
    throw new Error("Questionnaire item subcomponents must be used within <QuestionnaireItem>");
  }
  return context;
}

export interface QuestionnaireProps extends React.FormHTMLAttributes<HTMLFormElement> {
  defaultItem?: string;
  items: readonly QuestionnaireItemConfig[];
  shortcuts?: "letters" | "numbers" | boolean;
  onItemChange?: (itemName: string) => void;
  onValidate?: (activeItemName: string, currentIndex: number) => boolean | string | null;
  children: React.ReactNode;
}

export function Questionnaire({
  children,
  className,
  defaultItem,
  items,
  onItemChange,
  onSubmit,
  onValidate,
  shortcuts = "letters",
  ...props
}: QuestionnaireProps) {
  const [activeItem, setActiveItemState] = useState<string>(() => {
    if (defaultItem) return defaultItem;
    return items[0]?.name ?? "";
  });

  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setActiveItem = useCallback(
    (name: string) => {
      setActiveItemState(name);
      onItemChange?.(name);
    },
    [onItemChange]
  );

  const currentIndex = useMemo(() => {
    const idx = items.findIndex((item) => item.name === activeItem);
    return idx >= 0 ? idx : 0;
  }, [items, activeItem]);

  const totalItems = items.length;

  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setAnswerValues = useCallback((name: string, values: string[]) => {
    setAnswers((prev) => ({ ...prev, [name]: values }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const validateCurrentItem = useCallback((): boolean => {
    const currentConfig = items[currentIndex];
    if (!currentConfig) return true;

    if (onValidate) {
      const res = onValidate(currentConfig.name, currentIndex);
      if (typeof res === "string") {
        setFieldError(currentConfig.name, res);
        return false;
      }
      if (res === false) return false;
      setFieldError(currentConfig.name, null);
      return true;
    }

    if (currentConfig.required) {
      const currentValues = answers[currentConfig.name] ?? [];
      if (currentValues.length === 0) {
        setFieldError(currentConfig.name, "Iltimos, ushbu savolga javob bering");
        return false;
      }
    }
    setFieldError(currentConfig.name, null);
    return true;
  }, [items, currentIndex, answers, setFieldError, onValidate]);

  const goToNext = useCallback(() => {
    if (!validateCurrentItem()) return false;
    if (currentIndex < totalItems - 1) {
      const nextName = items[currentIndex + 1].name;
      setActiveItem(nextName);
      return true;
    }
    return true;
  }, [currentIndex, totalItems, items, setActiveItem, validateCurrentItem]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevName = items[currentIndex - 1].name;
      setActiveItem(prevName);
    }
  }, [currentIndex, items, setActiveItem]);

  const skip = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      const nextName = items[currentIndex + 1].name;
      setActiveItem(nextName);
    }
  }, [currentIndex, totalItems, items, setActiveItem]);

  const contextValue = useMemo<QuestionnaireContextValue>(
    () => ({
      activeItem,
      setActiveItem,
      items,
      currentIndex,
      totalItems,
      goToNext,
      goToPrevious,
      skip,
      shortcuts,
      errors,
      setFieldError,
      answers,
      setAnswerValues,
    }),
    [
      activeItem,
      setActiveItem,
      items,
      currentIndex,
      totalItems,
      goToNext,
      goToPrevious,
      skip,
      shortcuts,
      errors,
      setFieldError,
      answers,
      setAnswerValues,
    ]
  );

  return (
    <QuestionnaireContext.Provider value={contextValue}>
      <form
        className={cn("w-full transition-all", className)}
        noValidate
        onSubmit={(e) => {
          if (!validateCurrentItem()) {
            e.preventDefault();
            return;
          }
          onSubmit?.(e);
        }}
        {...props}
      >
        {children}
      </form>
    </QuestionnaireContext.Provider>
  );
}

export interface QuestionnaireProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  showPercentage?: boolean;
}

export function QuestionnaireProgress({
  className,
  showPercentage = false,
  ...props
}: QuestionnaireProgressProps) {
  const { currentIndex, totalItems } = useQuestionnaire();
  const percentage = totalItems > 0 ? Math.round(((currentIndex + 1) / totalItems) * 100) : 0;

  return (
    <div className={cn("w-full mb-6", className)} {...props}>
      {showPercentage && (
        <div className="flex justify-between items-center text-xs font-bold text-text-secondary mb-1.5">
          <span>
            {currentIndex + 1} / {totalItems}
          </span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-brand-navy-900 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export interface QuestionnaireItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  required?: boolean;
  multiple?: boolean;
}

export function QuestionnaireItem({
  children,
  className,
  multiple = false,
  name,
  required = false,
  ...props
}: QuestionnaireItemProps) {
  const { activeItem, answers, errors, setAnswerValues } = useQuestionnaire();
  const isCurrent = activeItem === name;
  const choiceCountRef = React.useRef(0);
  choiceCountRef.current = 0;

  const selectedValues = answers[name] ?? [];
  const error = errors[name] ?? null;

  const toggleValue = useCallback(
    (value: string) => {
      if (multiple) {
        const next = selectedValues.includes(value)
          ? selectedValues.filter((v) => v !== value)
          : [...selectedValues, value];
        setAnswerValues(name, next);
      } else {
        setAnswerValues(name, [value]);
      }
    },
    [multiple, selectedValues, setAnswerValues, name]
  );

  const itemContext = useMemo<QuestionnaireItemContextValue>(
    () => ({
      name,
      multiple,
      required,
      selectedValues,
      toggleValue,
      error,
      choiceCountRef,
    }),
    [name, multiple, required, selectedValues, toggleValue, error]
  );

  if (!isCurrent) return null;

  return (
    <QuestionnaireItemContext.Provider value={itemContext}>
      <div
        className={cn(
          "animate-in fade-in-50 slide-in-from-bottom-2 duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </QuestionnaireItemContext.Provider>
  );
}

export function QuestionnaireTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function QuestionnaireDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-1.5 text-sm leading-relaxed text-text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function QuestionnaireChoices({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { multiple } = useQuestionnaireItem();

  return (
    <div
      className={cn("mt-5 grid gap-2.5", className)}
      role={multiple ? "group" : "radiogroup"}
      {...props}
    >
      {children}
    </div>
  );
}

export interface QuestionnaireChoiceProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  selected?: boolean;
  shortcut?: string;
}

export function QuestionnaireChoice({
  children,
  className,
  onClick,
  selected,
  shortcut,
  value,
  ...props
}: QuestionnaireChoiceProps) {
  const { name, multiple, selectedValues, toggleValue, choiceCountRef } = useQuestionnaireItem();
  const { shortcuts } = useQuestionnaire();
  const choiceIndex = choiceCountRef.current++;

  const isSelected = selected !== undefined ? selected : selectedValues.includes(value);

  // Derive shortcut letter (A, B, C...) or number if requested
  const derivedShortcut = useMemo(() => {
    if (shortcut) return shortcut;
    if (shortcuts === "letters" && choiceIndex < 26) {
      return String.fromCharCode(65 + choiceIndex);
    }
    if (shortcuts === "numbers" && choiceIndex < 9) {
      return String(choiceIndex + 1);
    }
    return null;
  }, [shortcut, shortcuts, choiceIndex]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!derivedShortcut) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (e.key.toUpperCase() === derivedShortcut.toUpperCase()) {
        e.preventDefault();
        toggleValue(value);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [derivedShortcut, value, toggleValue]);

  return (
    <button
      aria-checked={isSelected}
      className={cn(
        "group relative flex w-full items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand-navy-900 cursor-pointer",
        isSelected
          ? "border-brand-navy-900 bg-brand-navy-900/5 ring-1 ring-brand-navy-900 shadow-xs"
          : "border-border-default bg-surface-canvas hover:border-border-strong hover:bg-surface-muted/50",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        toggleValue(value);
      }}
      role={multiple ? "checkbox" : "radio"}
      type="button"
      {...props}
    >
      {/* Hidden real input so new FormData(form) picks up standard form values */}
      <input
        aria-hidden="true"
        checked={isSelected}
        className="sr-only"
        name={name}
        onChange={() => {}}
        tabIndex={-1}
        type={multiple ? "checkbox" : "radio"}
        value={value}
      />

      {derivedShortcut && (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md border text-xs font-black transition-colors",
            isSelected
              ? "border-brand-navy-900 bg-brand-navy-900 text-white"
              : "border-border-default bg-surface-muted text-text-secondary group-hover:border-border-strong"
          )}
        >
          {derivedShortcut}
        </span>
      )}

      <div className="flex flex-1 flex-col justify-center text-sm">{children}</div>

      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center border transition-all",
          multiple ? "rounded-md" : "rounded-full",
          isSelected
            ? "border-brand-navy-900 bg-brand-navy-900 text-white"
            : "border-border-default bg-surface-canvas"
        )}
      >
        {isSelected && (
          <svg
            className="size-3 stroke-white stroke-[2.5]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
    </button>
  );
}

export interface QuestionnaireInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function QuestionnaireInput({
  className,
  label,
  name: explicitName,
  ...props
}: QuestionnaireInputProps) {
  const { name: itemName } = useQuestionnaireItem();
  const { setAnswerValues } = useQuestionnaire();
  const inputName = explicitName ?? `${itemName}-custom`;
  const id = useId();

  return (
    <div className="mt-2">
      {label && (
        <label className="block text-xs font-bold text-text-secondary mb-1.5" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-xl border border-border-default bg-surface-canvas px-4 py-2.5 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-brand-navy-900 focus:ring-2 focus:ring-brand-navy-900/10",
          className
        )}
        id={id}
        name={inputName}
        onChange={(e) => {
          if (e.target.value.trim()) {
            setAnswerValues(itemName, [e.target.value]);
          }
        }}
        type="text"
        {...props}
      />
    </div>
  );
}

export function QuestionnaireError({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error } = useQuestionnaireItem();
  if (!error) return null;

  return (
    <p
      className={cn(
        "mt-2 text-xs font-bold text-semantic-danger flex items-center gap-1.5",
        className
      )}
      role="alert"
      {...props}
    >
      <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
      {error}
    </p>
  );
}

export function QuestionnaireActions({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-8 flex items-center justify-between gap-3 border-t border-border-default pt-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function QuestionnairePrevious({
  children = "Oldingi",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { currentIndex, goToPrevious } = useQuestionnaire();
  const isFirst = currentIndex === 0;

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl border border-border-default bg-surface-canvas px-4 py-2 text-sm font-bold text-brand-navy-900 transition hover:bg-surface-muted active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
        className
      )}
      disabled={isFirst}
      onClick={(e) => {
        e.preventDefault();
        goToPrevious();
      }}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function QuestionnaireSkip({
  children = "O'tkazib yuborish",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { currentIndex, items, skip, totalItems } = useQuestionnaire();
  const currentItem = items[currentIndex];
  const isRequired = currentItem?.required ?? false;
  const isLast = currentIndex >= totalItems - 1;

  if (isRequired || isLast) return null;

  return (
    <button
      className={cn(
        "text-xs font-bold text-text-secondary hover:text-text-primary underline-offset-4 hover:underline cursor-pointer",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        skip();
      }}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function QuestionnaireNext({
  children = "Keyingi",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { currentIndex, goToNext, totalItems } = useQuestionnaire();
  const isLast = currentIndex >= totalItems - 1;

  if (isLast) return null;

  return (
    <button
      className={cn(
        "ml-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-navy-900 px-6 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-brand-navy-800 active:scale-[0.98] cursor-pointer",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        goToNext();
      }}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export function QuestionnaireSubmit({
  children = "Saqlash",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { currentIndex, totalItems } = useQuestionnaire();
  const isLast = currentIndex >= totalItems - 1;

  if (!isLast) return null;

  return (
    <button
      className={cn(
        "ml-auto inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-navy-900 px-7 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-md transition hover:bg-brand-navy-800 active:scale-[0.98] cursor-pointer",
        className
      )}
      type="submit"
      {...props}
    >
      {children}
    </button>
  );
}
