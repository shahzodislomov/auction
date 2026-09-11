"use client";

import { AlertCircle, CheckCircle2, LogIn, Send } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { api } from "@/api/api";
import { InformationPage } from "@/components/marketing/InformationPage";
import { Surface } from "@/components/ui/Surface";
import { useUserContext } from "@/context/UserContext";
import { useTask6Copy } from "@/locales/task6";

const inputClass =
  "mt-2 min-h-12 w-full rounded-md border border-border-default bg-surface-primary px-3.5 text-base text-text-primary outline-none focus:border-focus-ring focus:ring-2 focus:ring-focus-ring/25";

export default function SupportPage() {
  const copy = useTask6Copy();
  const { isAuthenticated, user } = useUserContext() as unknown as {
    isAuthenticated: boolean;
    user: { id?: string | number } | null;
  };
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const explicitlyDisabled = process.env.NEXT_PUBLIC_SUPPORT_CHAT_ENABLED === "false";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { subject?: string; message?: string } = {};
    if (!subject.trim()) nextErrors.subject = copy.info.supportSubjectRequired;
    if (!message.trim()) nextErrors.message = copy.info.supportMessageRequired;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const senderId = typeof user?.id === "number" ? user.id : Number(user?.id);
    if (!Number.isSafeInteger(senderId) || senderId <= 0 || !isAuthenticated || explicitlyDisabled) {
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const response = await api.post("/chat/sendMessageToSupport", {
        message: `${subject.trim()}\n\n${message.trim()}`,
        senderId,
      });
      if (response.data?.status !== "OK") {
        setStatus("error");
        return;
      }
      setStatus("sent");
      setSubject("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <InformationPage kind="support">
      {explicitlyDisabled ? (
        <Surface className="mx-auto max-w-3xl border-semantic-warning/40 bg-semantic-warning-surface text-center">
          <AlertCircle className="mx-auto text-semantic-warning" aria-hidden="true" size={28} />
          <h2 className="mt-4 text-xl font-bold text-text-primary">{copy.info.supportUnavailable}</h2>
        </Surface>
      ) : !isAuthenticated ? (
        <Surface className="mx-auto max-w-3xl text-center">
          <LogIn className="mx-auto text-brand-gold-text" aria-hidden="true" size={28} />
          <h2 className="mt-4 text-xl font-bold text-text-primary">{copy.info.supportLogin}</h2>
          <Link
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md border border-brand-champagne-500 bg-brand-champagne-500 px-6 font-bold text-brand-navy-900 hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            href="/login?returnTo=/support"
          >
            {copy.auth.login}
          </Link>
        </Surface>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <Surface tone="navy">
            <Send aria-hidden="true" className="text-brand-champagne-500" size={28} />
            <h2 className="mt-5 text-2xl font-bold text-white">{copy.info.supportFormTitle}</h2>
            <p className="mt-3 leading-7 text-white/75">{copy.info.supportFormIntro}</p>
          </Surface>
          <Surface>
            <form className="space-y-5" noValidate onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-bold text-text-primary" htmlFor="support-subject">
                  {copy.info.supportSubject}
                </label>
                <input
                  aria-describedby={errors.subject ? "support-subject-error" : undefined}
                  aria-invalid={Boolean(errors.subject)}
                  className={inputClass}
                  id="support-subject"
                  onChange={(event) => {
                    setSubject(event.target.value);
                    setErrors((current) => ({ ...current, subject: undefined }));
                    setStatus("idle");
                  }}
                  value={subject}
                />
                {errors.subject ? <p className="mt-2 text-sm font-semibold text-semantic-danger" id="support-subject-error" role="alert">{errors.subject}</p> : null}
              </div>
              <div>
                <label className="text-sm font-bold text-text-primary" htmlFor="support-message">
                  {copy.info.supportMessage}
                </label>
                <textarea
                  aria-describedby={errors.message ? "support-message-error" : undefined}
                  aria-invalid={Boolean(errors.message)}
                  className={`${inputClass} min-h-40 resize-y py-3`}
                  id="support-message"
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setErrors((current) => ({ ...current, message: undefined }));
                    setStatus("idle");
                  }}
                  value={message}
                />
                {errors.message ? <p className="mt-2 text-sm font-semibold text-semantic-danger" id="support-message-error" role="alert">{errors.message}</p> : null}
              </div>
              {status === "sent" ? (
                <p className="flex items-center gap-2 rounded-md bg-semantic-success-surface p-3 text-sm font-semibold text-semantic-success" role="status">
                  <CheckCircle2 aria-hidden="true" size={18} />
                  {copy.info.supportSent}
                </p>
              ) : null}
              {status === "error" ? (
                <p className="rounded-md bg-semantic-danger-surface p-3 text-sm font-semibold text-semantic-danger" role="alert">
                  {copy.info.supportError}
                </p>
              ) : null}
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-brand-champagne-500 bg-brand-champagne-500 px-6 font-bold text-brand-navy-900 hover:bg-brand-champagne-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={status === "sending"}
                type="submit"
              >
                {status === "sending" ? copy.info.supportSending : copy.info.supportSend}
              </button>
            </form>
          </Surface>
        </div>
      )}
    </InformationPage>
  );
}
