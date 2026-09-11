import { useEffect, useRef, type RefObject } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (element) =>
      !element.hidden &&
      element.getAttribute("aria-hidden") !== "true" &&
      !element.closest("[inert]"),
  );
}

/**
 * Provides the keyboard and focus behavior expected from an aria-modal dialog.
 * The overlay remains responsible for its own visual treatment and close buttons.
 */
export function useModalFocus<T extends HTMLElement>({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}): RefObject<T | null> {
  const dialogRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const returnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const inertedSiblings: Array<{
      element: HTMLElement;
      wasInert: boolean;
    }> = [];

    let activeBranch: HTMLElement = dialog;
    while (activeBranch.parentElement && activeBranch.parentElement !== document.body) {
      for (const sibling of activeBranch.parentElement.children) {
        if (sibling === activeBranch || !(sibling instanceof HTMLElement)) continue;
        inertedSiblings.push({ element: sibling, wasInert: sibling.inert });
        sibling.inert = true;
      }
      activeBranch = activeBranch.parentElement;
    }

    const focusFirst = () => {
      const [first] = getFocusableElements(dialog);
      (first ?? dialog).focus();
    };

    focusFirst();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const focused = document.activeElement;

      if (event.shiftKey && (focused === first || !dialog.contains(focused))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (focused === last || !dialog.contains(focused))) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        focusFirst();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      for (const { element, wasInert } of inertedSiblings) {
        element.inert = wasInert;
      }
      if (returnFocus?.isConnected) returnFocus.focus();
    };
  }, [isOpen]);

  return dialogRef;
}
