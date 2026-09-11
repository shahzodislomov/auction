"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function DecisionPanel({ onClose }: { onClose?: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <aside
      aria-label="Moderatsiya qarori"
      className="rounded-lg border border-border-default bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <StatusBadge tone="warning">Qaror kutilmoqda</StatusBadge>
          <h2 className="mt-3 text-xl font-black">Lot #10245</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Chevrolet Tahoe High Country
          </p>
        </div>
        {onClose ? (
          <button
            onClick={onClose}
            type="button"
            aria-label="Qaror panelini yopish"
          >
            <X aria-hidden="true" size={20} />
          </button>
        ) : null}
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border-default py-5 text-sm">
        <div>
          <dt className="text-text-secondary">Sotuvchi</dt>
          <dd className="mt-1 font-extrabold">Premium Auto LLC</dd>
        </div>
        <div>
          <dt className="text-text-secondary">Yuborilgan</dt>
          <dd className="mt-1 font-extrabold">12:32</dd>
        </div>
        <div>
          <dt className="text-text-secondary">VIN holati</dt>
          <dd className="mt-1 font-extrabold text-semantic-success">
            Mos keladi
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Rasmlar</dt>
          <dd className="mt-1 font-extrabold">18 / 18</dd>
        </div>
      </dl>
      <label className="mt-5 block text-sm font-extrabold">
        Qaror izohi
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          placeholder="Rad etish yoki xavf qarori uchun sabab majburiy..."
          className="mt-2 w-full rounded-md border border-border-default p-3 font-normal outline-none focus:border-focus-ring"
        />
      </label>
      <div className="mt-4 flex items-start gap-2 rounded-md bg-semantic-warning-surface p-3 text-xs leading-5 text-semantic-warning">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 shrink-0"
          size={16}
        />{" "}
        Har bir qaror administrator, vaqt va sabab bilan audit jurnaliga
        yoziladi.
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button disabled={!reason.trim()} variant="outline">
          <X aria-hidden="true" size={16} /> Rad etish
        </Button>
        <Button disabled={!reason.trim()}>
          <CheckCircle2 aria-hidden="true" size={16} /> Tasdiqlash
        </Button>
      </div>
    </aside>
  );
}
