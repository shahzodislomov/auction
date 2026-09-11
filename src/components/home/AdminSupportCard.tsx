"use client";

import { ArrowRight, Headphones, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminSupportCard() {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = question.trim();
    if (trimmed) {
      router.push(`/support?message=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/support");
    }
  }

  return (
    <section
      aria-label="Admin bilan aloqa"
      className="mx-auto w-full max-w-[91.125rem] px-4 pt-4 sm:px-6 sm:pt-6"
    >
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 p-5 sm:p-6 md:p-8 shadow-[0_4px_20px_rgb(0_0_0_/_0.03)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {/* Left Title & Description */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="flex shrink-0 items-center justify-center pt-0.5">
              <Headphones className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-600" strokeWidth={2.2} aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold tracking-tight text-brand-navy-900 sm:text-xl md:text-2xl">
                  Savolllaringiz bo’lsa (admin)
                </h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary sm:text-sm md:max-w-xl">
                Auksion, to‘lovlar yoki avtomobil sotish bo‘yicha savollaringiz bormi? Adminlarimiz sizga tezkor yordam beradi.
              </p>
            </div>
          </div>

          {/* Right Input / Quick Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center gap-2 rounded-2xl border border-border-default/80 bg-white p-1.5 shadow-sm transition-focus md:max-w-md"
          >
            <div className="flex flex-1 items-center gap-2 pl-3">
              <MessageSquare className="h-4 w-4 shrink-0 text-text-secondary/70" aria-hidden="true" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Savolingizni yozing..."
                className="w-full bg-transparent text-sm text-brand-navy-900 placeholder:text-text-secondary/70 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              aria-label="Adminga yuborish yoki aloqaga chiqish"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-brand-navy-900 shrink-0"
            >
              <span>Bog‘lanish</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
