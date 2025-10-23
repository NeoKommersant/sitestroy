"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRequest } from "@/components/providers/RequestProvider";

type ContactState = {
  name: string;
  email: string;
  phone: string;
  company: string;
};

type SubmitStatus =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

const CONTACT_STORAGE_KEY = "sitestroy-request-contact";

const initialContactState: ContactState = {
  name: "",
  email: "",
  phone: "",
  company: "",
};

export default function RequestPage() {
  const {
    items,
    units,
    updateItem,
    removeItem,
    addCustomItem,
    projectNote,
    setProjectNote,
    clear,
    getUnitPrecision,
  } = useRequest();
  const [contact, setContact] = useState<ContactState>(initialContactState);
  const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });

  const isEmpty = items.length === 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(CONTACT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ContactState;
        setContact({
          name: parsed.name ?? "",
          email: parsed.email ?? "",
          phone: parsed.phone ?? "",
          company: parsed.company ?? "",
        });
      }
    } catch (error) {
      console.warn("Failed to restore contact details", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contact));
  }, [contact]);

  const totalsByUnit = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.unit] = (acc[item.unit] ?? 0) + item.quantity;
      return acc;
    }, {});
  }, [items]);

  const customItemsCount = useMemo(() => items.filter((item) => item.custom).length, [items]);

  const handleQuantityChange = (id: string, value: string) => {
    const parsed = Number(value.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    updateItem(id, { quantity: parsed });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEmpty) {
      setStatus({ state: "error", message: "\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0445\u043e\u0442\u044f \u0431\u044b \u043e\u0434\u043d\u0443 \u043f\u043e\u0437\u0438\u0446\u0438\u044e \u0432 \u0437\u0430\u044f\u0432\u043a\u0443." });
      return;
    }
    if (!contact.name || !contact.email || !contact.phone) {
      setStatus({ state: "error", message: "\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u043a\u043e\u043d\u0442\u0430\u043a\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435." });
      return;
    }
    if (items.some((item) => item.quantity <= 0)) {
      setStatus({ state: "error", message: "\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043b\u044f \u0432\u0441\u0435\u0445 \u043f\u043e\u0437\u0438\u0446\u0438\u0439." });
      return;
    }

    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/request/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          projectNote,
          requester: contact,
        }),
      });
      const json = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !json.ok) {
        throw new Error(json.message ?? "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443.");
      }
      setStatus({
        state: "success",
        message: "\u0417\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430. \u041c\u044b \u0441\u0432\u044f\u0436\u0435\u043c\u0441\u044f \u0441 \u0432\u0430\u043c\u0438 \u0432 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043c\u044f.",
      });
    } catch (error) {
      console.error(error);
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443.",
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (isEmpty) {
      setStatus({ state: "error", message: "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043f\u043e\u0437\u0438\u0446\u0438\u0438 \u0432 \u0437\u0430\u044f\u0432\u043a\u0443." });
      return;
    }
    try {
      const { downloadRequestPdf } = await import("@/lib/requestPdf");
      await downloadRequestPdf({
        items,
        projectNote,
        requester: contact,
      });
    } catch (error) {
      console.error(error);
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u0442\u044c PDF.",
      });
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-teal-900 to-slate-950 px-4 pb-24 pt-20 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/3 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />
        <div className="absolute right-[-160px] top-1/4 h-[420px] w-[420px] rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute bottom-[-220px] left-[-120px] h-[360px] w-[360px] rounded-full bg-slate-900/70 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(10,20,45,0.45)] backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">{"\u0417\u0430\u044f\u0432\u043a\u0430"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              {"\u0421\u043e\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u0437\u0438\u0446\u0438\u0438 \u0438\u0437 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0430, \u0443\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0438 \u043f\u0435\u0440\u0435\u0434\u0430\u0439\u0442\u0435 \u0438\u0445 \u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0443. \u0427\u0435\u0440\u043d\u043e\u0432\u0438\u043a \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442\u0441\u044f \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435."}
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
          >
            {"\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433"}
          </Link>
        </div>

        {isEmpty ? (
          <div className="rounded-3xl border border-white/15 bg-white/10 p-10 text-center text-sm text-white/80 shadow-[0_20px_60px_rgba(10,20,45,0.45)] backdrop-blur-xl">
            <p>
              {"\u0412 \u0437\u0430\u044f\u0432\u043a\u0435 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u043f\u043e\u0437\u0438\u0446\u0438\u0439. \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435"}
              {" "}
              <Link href="/catalog" className="font-semibold text-white hover:text-teal-200">
                {"\u043a\u0430\u0442\u0430\u043b\u043e\u0433"}
              </Link>
              {" "}
              {"\u0438\u043b\u0438 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u0443\u044e \u043f\u043e\u0437\u0438\u0446\u0438\u044e."}
            </p>
            <button
              type="button"
              onClick={addCustomItem}
              className="mt-5 inline-flex items-center justify-center rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
            >
              {"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043d\u0443\u044e \u043f\u043e\u0437\u0438\u0446\u0438\u044e"}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="space-y-5 rounded-3xl border border-white/12 bg-white/8 p-6 shadow-[0_20px_60px_rgba(8,18,40,0.45)] backdrop-blur-xl">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">{"\u041f\u043e\u0437\u0438\u0446\u0438\u0438"}</h2>
                  <p className="text-sm text-white/70">
                    {`\u0412\u0441\u0435\u0433\u043e: ${items.length} \u00b7 \u0414\u043e\u043f. \u043f\u043e\u0437\u0438\u0446\u0438\u0438: ${customItemsCount || "\u2014"}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={addCustomItem}
                    className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
                  >
                    {"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043d\u0443\u044e \u043f\u043e\u0437\u0438\u0446\u0438\u044e"}
                  </button>
                  <button
                    type="button"
                    onClick={clear}
                    className="inline-flex items-center justify-center rounded-full border border-red-300/40 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-200/60 hover:bg-red-400/20"
                  >
                    {"\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c"}
                  </button>
                </div>
              </header>

              <div className="space-y-4">
                {items.map((item) => {
                  const precision = getUnitPrecision(item.unit);
                  const step = precision === 0 ? 1 : 1 / 10 ** precision;
                  const min = step;
                  const inputValue =
                    precision === 0
                      ? Math.round(item.quantity).toString()
                      : item.quantity.toFixed(precision);
                  return (
                    <div
                      key={item.id}
                      className="space-y-4 rounded-3xl border border-white/10 bg-white/10 p-5 shadow-[0_20px_60px_rgba(8,18,40,0.45)] backdrop-blur-xl transition hover:border-white/25"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          {item.custom ? (
                            <div className="space-y-2">
                              <input
                                value={item.title}
                                onChange={(event) => updateItem(item.id, { title: event.target.value })}
                                className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-base font-semibold text-white placeholder-white/60 shadow-sm outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                                placeholder="\u041d\u043e\u0432\u0430\u044f \u043f\u043e\u0437\u0438\u0446\u0438\u044f"
                                required
                              />
                              <p className="text-[11px] text-white/60">{"\u041d\u0430\u043f\u0440\u0438\u043c\u0435\u0440: \u0421\u043e\u043f\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0449\u0430\u044f \u0443\u0441\u043b\u0443\u0433\u0430 \u0438\u043b\u0438 \u0432\u0441\u043f\u043e\u043c\u043e\u0433\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u0442\u043e\u0432\u0430\u0440"}</p>
                            </div>
                          ) : (
                            <div className="text-base font-semibold text-white">{item.title}</div>
                          )}
                          <div
                            className={
                              item.custom
                                ? "mt-3 text-[11px] font-medium text-white/60"
                                : "text-xs uppercase tracking-[0.25em] text-white/60"
                            }
                          >
                            {item.custom
                              ? "\u041f\u043e\u0437\u0438\u0446\u0438\u044f \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0430 \u0432\u0440\u0443\u0447\u043d\u0443\u044e"
                              : `${item.category} / ${item.subcategory}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-red-300/60 hover:text-red-200"
                        >
                          {"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-[repeat(6,minmax(0,1fr))]">
                        <label className="md:col-span-2">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/60">{"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e"}</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={min}
                            step={step}
                            value={inputValue}
                            onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                            className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                          />
                        </label>
                        <label>
                          <span className="text-xs uppercase tracking-[0.3em] text-white/60">{"\u0415\u0434. \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f"}</span>
                          <select
                            value={item.unit}
                            onChange={(event) => updateItem(item.id, { unit: event.target.value })}
                            className="mt-1 w-full rounded-2xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                          >
                            {units.map((unitOption) => (
                              <option key={unitOption} value={unitOption}>
                                {unitOption}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="md:col-span-3">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/60">{"\u041f\u0440\u0438\u043c\u0435\u0447\u0430\u043d\u0438\u0435"}</span>
                            <input
                              value={item.comment ?? ""}
                              onChange={(event) => updateItem(item.id, { comment: event.target.value })}
                            placeholder="\u0414\u0435\u0442\u0430\u043b\u0438 \u043f\u043e \u043f\u043e\u0441\u0442\u0430\u0432\u043a\u0435"
                            className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="space-y-6 rounded-3xl border border-white/12 bg-white/8 p-6 shadow-[0_20px_60px_rgba(8,18,40,0.45)] backdrop-blur-xl">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">{"\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b"}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/60">{"\u0418\u043c\u044f"}</span>
                      <input
                        value={contact.name}
                        onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                        required
                      />
                    </label>
                    <label>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/60">{"\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f"}</span>
                      <input
                        value={contact.company}
                        onChange={(event) => setContact((prev) => ({ ...prev, company: event.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                      />
                    </label>
                    <label>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/60">{"\u0422\u0435\u043b\u0435\u0444\u043e\u043d"}</span>
                      <input
                        value={contact.phone}
                        onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                        required
                      />
                    </label>
                    <label>
                      <span className="text-xs uppercase tracking-[0.3em] text-white/60">Email</span>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                        className="mt-1 w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                        required
                      />
                    </label>
                  </div>
                </div>

                <details className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75 backdrop-blur">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    {"\u0414\u0435\u0442\u0430\u043b\u0438 \u043f\u0440\u043e\u0435\u043a\u0442\u0430"}
                  </summary>
                  <label className="mt-3 block">
                    <span className="sr-only">{"\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438 \u043e \u0437\u0430\u0434\u0430\u0447\u0435"}</span>
                    <textarea
                      rows={4}
                      value={projectNote}
                      onChange={(event) => setProjectNote(event.target.value)}
                      placeholder="\u041e\u043f\u0438\u0448\u0438\u0442\u0435 \u0441\u0440\u043e\u043a\u0438, \u0430\u0434\u0440\u0435\u0441 \u0438 \u043e\u0441\u043e\u0431\u0435\u043d\u043d\u043e\u0441\u0442\u0438 \u043f\u044f\u0442\u044c\u0438 \u0437\u0430\u0434\u0430\u0447\u0438"
                      className="w-full rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/50 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/40"
                    />
                  </label>
                </details>
              </div>

              <aside className="space-y-4 rounded-3xl border border-white/12 bg-white/8 p-6 shadow-[0_20px_60px_rgba(8,18,40,0.45)] backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-white">{"\u0418\u0442\u043e\u0433\u0438"}</h2>
                <div className="space-y-3 text-sm text-white/75">
                  <div className="flex items-center justify-between">
                    <span>{"\u041f\u043e\u0437\u0438\u0446\u0438\u0439"}</span>
                    <span className="font-semibold text-white">{items.length}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/60">{"\u0418\u0442\u043e\u0433\u043e \u043f\u043e \u0435\u0434\u0438\u043d\u0438\u0446\u0430\u043c"}</div>
                    {Object.keys(totalsByUnit).length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-3 py-2 text-xs text-white/70">
                        {"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0430 \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u043f\u043e\u0437\u0438\u0446\u0438\u0439."}
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {Object.entries(totalsByUnit).map(([unit, qty]) => {
                          const precision = getUnitPrecision(unit);
                          return (
                            <li
                              key={unit}
                              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                            >
                              <span>{unit}</span>
                              <span className="font-semibold text-white">
                                {formatQuantityDisplay(qty, precision)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={status.state === "sending"}
                    className="inline-flex items-center justify-center rounded-full bg-white/90 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status.state === "sending" ? "\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u043c..." : "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u044f\u0432\u043a\u0443"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center justify-center rounded-full border border-white/60 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/80 hover:bg-white/15"
                  >
                    {"PDF \u043a\u043e\u043c\u043c\u0435\u0440\u0447\u0435\u0441\u043a\u043e\u0435"}
                  </button>
                </div>
                {status.state === "success" && (
                  <div className="rounded-2xl border border-emerald-300/60 bg-emerald-400/15 px-4 py-3 text-xs font-medium text-emerald-100">
                    {status.message}
                  </div>
                )}
                {status.state === "error" && (
                  <div className="rounded-2xl border border-red-400/60 bg-red-500/15 px-4 py-3 text-xs font-medium text-red-100">
                    {status.message}
                  </div>
                )}
              </aside>
            </section>
          </form>
        )}
      </div>
    </section>
  );
}

const formatQuantityDisplay = (quantity: number, precision: number) => {
  if (precision === 0) return Math.round(quantity).toString();
  const factor = 10 ** precision;
  const normalized = Math.round(quantity * factor) / factor;
  return normalized.toFixed(precision).replace(/\.?0+$/, "");
};

