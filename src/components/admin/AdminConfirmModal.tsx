"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import React, { useEffect, useRef } from "react";

export interface AdminConfirmModalProps {
  isOpen: boolean;
  type: "approve" | "reject" | "decline";
  title: string;
  description?: string;
  reason?: string;
  onReasonChange?: (reason: string) => void;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  closeLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdminConfirmModal({
  isOpen,
  type,
  title,
  description,
  reason = "",
  onReasonChange,
  reasonLabel = "Rad etish sababi",
  reasonPlaceholder = "Aniq sababni yozing",
  cancelLabel = "Bekor qilish",
  confirmLabel = "Tasdiqlash",
  closeLabel = "Yopish",
  pending = false,
  onConfirm,
  onCancel,
}: AdminConfirmModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && (type === "reject" || type === "decline")) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const isReject = type === "reject" || type === "decline";
  const canConfirm = !pending && (!isReject || Boolean(reason.trim()));

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-brand-navy-950/75 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
      role="presentation"
    >
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-border-default bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`grid size-11 shrink-0 place-items-center rounded-full ${
              type === "approve"
                ? "bg-semantic-success/15 text-semantic-success"
                : "bg-semantic-danger/15 text-semantic-danger"
            }`}
          >
            {type === "approve" ? <Check size={22} strokeWidth={2.5} /> : <AlertTriangle size={22} strokeWidth={2.5} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-brand-navy-900 leading-snug">{title}</h3>
            {description ? <p className="mt-1 text-xs text-text-secondary">{description}</p> : null}
            {isReject ? (
              <label className="mt-4 block text-xs font-bold text-text-secondary">
                {reasonLabel}
                <textarea
                  ref={textareaRef}
                  className="mt-1.5 min-h-24 w-full rounded-md border border-border-default bg-surface-canvas p-3 text-sm font-normal text-text-primary outline-none focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25"
                  placeholder={reasonPlaceholder}
                  value={reason}
                  onChange={(e) => onReasonChange?.(e.target.value)}
                />
              </label>
            ) : null}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            disabled={pending}
            onClick={onCancel}
            className="grid size-8 shrink-0 place-items-center rounded-md text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2.5 border-t border-border-default pt-4">
          <button
            type="button"
            className="min-h-11 rounded-md border border-border-default bg-white px-4 text-sm font-bold text-text-primary hover:bg-surface-muted transition-colors disabled:opacity-50"
            disabled={pending}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`min-h-11 rounded-md px-5 text-sm font-extrabold text-white transition-colors disabled:opacity-50 ${
              type === "approve"
                ? "bg-semantic-success hover:bg-semantic-success/90"
                : "bg-semantic-danger hover:bg-semantic-danger/90"
            }`}
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
