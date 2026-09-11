import React, { useId } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  showCancel?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = "Amalni tasdiqlaysizmi?",
  description = "Ushbu amalni bajarishga ishonchingiz komilmi? Buni ortga qaytarib bo'lmaydi.",
  confirmText = "OK",
  cancelText = "Bekor qilish",
  onConfirm,
  onCancel,
  loading = false,
  showCancel = true,
}) => {
  const titleId = useId();
  const descriptionId = useId();

  if (!open) return null;

  return (
    <div
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy-950/55 px-4"
      role="dialog"
    >
      <div
        className="w-full max-w-[380px] rounded-lg bg-[#FAF7F2] px-7 py-8 text-center shadow-overlay"
        role="document"
      >
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-champagne-500/15 text-brand-champagne-600"
        >
          <AlertTriangle aria-hidden="true" className="h-7 w-7" />
        </div>

        <h3 className="m-0 text-xl font-bold text-brand-navy-900" id={titleId}>
          {title}
        </h3>

        <p className="mb-7 mt-3 text-sm leading-6 text-text-secondary" id={descriptionId}>
          {description}
        </p>

        <div className="flex w-full gap-3">
          {showCancel ? (
            <Button
              onClick={onCancel}
              disabled={loading}
              fullWidth
              variant="outline"
            >
              {cancelText}
            </Button>
          ) : null}

          <Button
            onClick={onConfirm}
            disabled={loading}
            fullWidth
          >
            {loading ? `${confirmText}...` : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
