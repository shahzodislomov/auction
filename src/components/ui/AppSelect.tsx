"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  type ReactNode,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  description?: string;
}

export interface AppSelectProps {
  /** Array of select options (objects or plain strings/numbers) */
  options: (SelectOption | string | number)[];
  /** Currently selected value */
  value?: string | number;
  /** Callback fired when selection changes */
  onChange?: (value: string | number, option?: SelectOption) => void;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Label text above the select input */
  label?: ReactNode;
  /** Helper error text below the input */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional icon displayed inside trigger on the left */
  icon?: ReactNode;
  /** Additional container CSS class */
  className?: string;
  /** Additional trigger CSS class */
  triggerClassName?: string;
  /** Additional popup dropdown CSS class */
  dropdownClassName?: string;
  /** Element ID */
  id?: string;
  /** Form input name */
  name?: string;
  /** HTML aria-label */
  "aria-label"?: string;
  /** Use native HTML select dropdown instead of custom popup */
  native?: boolean;
}

/**
 * Normalizes mixed option formats (strings, numbers, objects) into uniform SelectOption objects.
 */
function normalizeOptions(
  options: (SelectOption | string | number)[]
): SelectOption[] {
  return options
    .filter((item) => item !== null && item !== undefined)
    .map((item) => {
      if (typeof item === "object" && item !== null && "value" in item) {
        return item as SelectOption;
      }
      return {
        value: String(item),
        label: String(item),
      };
    })
    .filter(
      (opt) =>
        opt.label !== undefined &&
        opt.label !== null &&
        String(opt.label).trim() !== ""
    );
}

export function AppSelect({
  options: rawOptions,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  disabled = false,
  size = "md",
  icon,
  className = "",
  triggerClassName = "",
  dropdownClassName = "",
  id: customId,
  name,
  "aria-label": ariaLabel,
  native = typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITEST === "true"),
}: AppSelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const normalizedOptions = normalizeOptions(rawOptions);
  const resolvedAriaLabel = typeof label === "string" ? label : (ariaLabel || (typeof placeholder === "string" ? placeholder : undefined));

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Selected option object
  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Determine popover placement (open upward if near screen bottom)
  useEffect(() => {
    if (!isOpen) return;

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250 && rect.top > 200) {
        setPlacement("top");
      } else {
        setPlacement("bottom");
      }
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | Event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled || disabled) return;
    onChange?.(option.value, option);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const currentIndex = normalizedOptions.findIndex(
            (opt) => String(opt.value) === String(value)
          );
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        } else if (focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
          const opt = normalizedOptions[focusedIndex];
          if (opt && !opt.disabled) {
            handleSelect(opt);
          }
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) =>
            prev < normalizedOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(normalizedOptions.length - 1);
        } else {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : normalizedOptions.length - 1
          );
        }
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  };

  // Size styles
  const sizeClasses = {
    sm: "min-h-11 px-3 text-xs rounded-lg gap-2",
    md: "min-h-11 px-3.5 text-sm rounded-xl gap-2.5",
    lg: "min-h-12 px-4 text-base rounded-xl gap-3",
  }[size];

  // If native fallback requested, render stylized native select
  if (native) {
    return (
      <div className={`relative flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-bold uppercase tracking-wider text-brand-navy-900"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-text-secondary pointer-events-none">
              {icon}
            </span>
          )}
          <select
            id={selectId}
            name={name}
            value={value ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              const opt = normalizedOptions.find((o) => String(o.value) === val);
              onChange?.(val, opt);
            }}
            disabled={disabled}
            aria-label={resolvedAriaLabel}
            className={`w-full appearance-none bg-surface-canvas border border-border-default text-brand-navy-900 font-bold outline-none transition-all duration-200 focus:border-brand-champagne-500 focus:ring-2 focus:ring-brand-champagne-500/25 disabled:cursor-not-allowed disabled:opacity-60 ${
              icon ? "pl-9" : ""
            } pr-10 ${sizeClasses} ${
              error ? "border-red-500 focus:ring-red-500/25" : ""
            } ${triggerClassName}`}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {normalizedOptions.map((opt) => (
              <option
                key={String(opt.value)}
                value={opt.value}
                disabled={opt.disabled}
              >
                {typeof opt.label === "string" || typeof opt.label === "number"
                  ? opt.label
                  : String(opt.value)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 h-4 w-4 text-text-secondary pointer-events-none transition-transform" />
        </div>
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1.5 ${className}`}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-bold uppercase tracking-wider text-brand-navy-900"
        >
          {label}
        </label>
      )}

      {/* Hidden native input for form submissions */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value !== undefined ? String(value) : ""}
        />
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={resolvedAriaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full inline-flex items-center justify-between border border-[#E4D9CA] bg-[#FAF8F5] text-brand-navy-900 font-medium transition-all duration-200 cursor-pointer shadow-sm hover:border-[#D6C6B2] focus:outline-none focus:border-[#C5B299] focus:ring-2 focus:ring-[#C5B299]/25 disabled:cursor-not-allowed disabled:opacity-60 rounded-[14px] ${
          isOpen ? "border-[#C5B299] ring-2 ring-[#C5B299]/25 bg-[#FAF8F5]" : ""
        } ${error ? "border-red-500 focus:ring-red-500/25" : ""} ${sizeClasses} ${triggerClassName}`}
      >
        <span className="inline-flex items-center gap-2 truncate">
          {icon && <span className="text-text-secondary">{icon}</span>}
          {selectedOption?.icon && <span>{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption ? "text-text-secondary font-normal" : ""}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#6B7280] stroke-[2] transition-transform duration-200 ease-in-out ${
            isOpen ? "rotate-180 text-brand-navy-900" : ""
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          aria-labelledby={selectId}
          className={`absolute left-0 z-50 max-h-60 w-full overflow-auto rounded-[16px] border border-[#E4D9CA] bg-[#FAF8F5] p-1.5 shadow-xl shadow-brand-navy-900/10 backdrop-blur-md transition-all duration-150 animate-in fade-in-50 zoom-in-95 ${
            placement === "top"
              ? "bottom-full mb-1.5 origin-bottom"
              : "top-full mt-1.5 origin-top"
          } ${dropdownClassName}`}
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-center text-xs text-text-secondary font-medium">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt, index) => {
              const isSelected = String(opt.value) === String(value);
              const isFocused = focusedIndex === index;

              return (
                <div
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`relative flex items-center justify-between rounded-[10px] px-3.5 py-2.5 text-xs md:text-sm font-medium transition-colors duration-150 cursor-pointer select-none ${
                    opt.disabled
                      ? "cursor-not-allowed opacity-40"
                      : isSelected
                      ? "bg-[#EDE6DB] text-brand-navy-900 font-semibold"
                      : isFocused
                      ? "bg-[#F3EDE2] text-brand-navy-900"
                      : "text-brand-navy-900 hover:bg-[#F3EDE2]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span>{opt.icon}</span>}
                    <div className="flex flex-col truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="text-[11px] font-normal text-text-secondary">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-brand-navy-900 stroke-[2.5]" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  );
}

export default AppSelect;
