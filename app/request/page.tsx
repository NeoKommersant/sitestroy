"use client";

import { useEffect, useMemo, useState } from "react";
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEmpty) {
      setStatus({ state: "error", message: "Добавьте хотя бы одну позицию в заявку." });
      return;
    }
    if (!contact.name || !contact.email || !contact.phone) {
      setStatus({ state: "error", message: "Заполните контактные данные." });
      return;
    }
    if (items.some((item) => item.quantity <= 0)) {
      setStatus({ state: "error", message: "Укажите количество для всех позиций." });
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
        throw new Error(json.message ?? "Не удалось отправить заявку.");
      }
      setStatus({
        state: "success",
        message: "Заявка отправлена. Мы свяжемся с вами в ближайшее время.",
      });
    } catch (error) {
      console.error(error);
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Не удалось отправить заявку.",
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (isEmpty) {
      setStatus({ state: "error", message: "Сначала добавьте позиции в заявку." });
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
        message: error instanceof Error ? error.message : "Не удалось сформировать PDF.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Заявка</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Соберите позиции из каталога, укажите количество и отправьте их менеджеру. Черновик сохраняется в браузере.
          </p>
        </div>
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-600"
        >
          Вернуться в каталог
        </Link>
      </div>

      {isEmpty ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          В заявке пока нет позиций. Откройте{" "}
          <Link href="/catalog" className="font-semibold text-teal-600 hover:text-teal-500">
            каталог
          </Link>{" "}
          и добавьте нужные материалы.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10">
          <section className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Позиции</h2>
                <p className="text-sm text-slate-500">
                  Всего: {items.length} · Доп. позиции: {customItemsCount || "—"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-teal-500 hover:text-teal-600"
                >
                  Добавить свою позицию
                </button>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
                >
                  Очистить
                </button>
              </div>
            </header>

            <div className="space-y-4">
              {items.map((item) => {
                const precision = getUnitPrecision(item.unit);
                const step = precision === 0 ? 1 : 1;
                const min = step;
                const inputValue =
                  precision === 0
                    ? Math.round(item.quantity).toString()
                    : item.quantity.toFixed(precision);
                return (
                <div
                  key={item.id}
                  className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {item.custom ? (
                        <input
                          value={item.title}
                          onChange={(event) => updateItem(item.id, { title: event.target.value })}
                          className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-base font-semibold text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                          placeholder="Наименование"
                          required
                        />
                      ) : (
                        <div className="text-base font-semibold text-slate-900">{item.title}</div>
                      )}
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                        {item.category} / {item.subcategory}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:border-red-300 hover:text-red-600"
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-[repeat(6,minmax(0,1fr))]">
                    <label className="md:col-span-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Количество</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={min}
                        step={step}
                        value={inputValue}
                        onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                    </label>
                    <label>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Ед. измерения</span>
                      <select
                        value={item.unit}
                        onChange={(event) => updateItem(item.id, { unit: event.target.value })}
                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      >
                        {units.map((unitOption) => (
                          <option key={unitOption} value={unitOption}>
                            {unitOption}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="md:col-span-3">
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Комментарий</span>
                      <textarea
                        rows={2}
                        value={item.comment ?? ""}
                        onChange={(event) => updateItem(item.id, { comment: event.target.value })}
                        placeholder="Дополнительные пожелания (необязательно)"
                        className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      />
                    </label>
                  </div>
                </div>
              );
              })}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Контакты</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Имя</span>
                  <input
                    value={contact.name}
                    onChange={(event) => setContact((prev) => ({ ...prev, name: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                </label>
                <label>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Компания</span>
                  <input
                    value={contact.company}
                    onChange={(event) => setContact((prev) => ({ ...prev, company: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
                <label>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Телефон</span>
                  <input
                    value={contact.phone}
                    onChange={(event) => setContact((prev) => ({ ...prev, phone: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                </label>
                <label>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</span>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(event) => setContact((prev) => ({ ...prev, email: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                </label>
              </div>
              <details className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Дополнительные сведения
                </summary>
                <label className="mt-3 block">
                  <span className="sr-only">Комментарий к проекту</span>
                  <textarea
                    rows={4}
                    value={projectNote}
                    onChange={(event) => setProjectNote(event.target.value)}
                    placeholder="Опишите проект целиком, особенности логистики или условия оплаты (необязательно)"
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
              </details>
            </div>

            <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Итоги</h2>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Позиций</span>
                  <span className="font-semibold text-slate-900">{items.length}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Сумма по единицам</div>
                  {Object.keys(totalsByUnit).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      Укажите количество, чтобы увидеть итоги.
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {Object.entries(totalsByUnit).map(([unit, qty]) => {
                        const precision = getUnitPrecision(unit);
                        return (
                          <li
                            key={unit}
                            className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"
                          >
                            <span>{unit}</span>
                            <span className="font-semibold text-slate-900">
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
                  className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status.state === "sending" ? "Отправляем…" : "Отправить заявку"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center justify-center rounded-full border border-teal-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 transition hover:bg-teal-50"
                >
                  Скачать PDF
                </button>
              </div>
              {status.state === "success" && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs font-medium text-green-700">
                  {status.message}
                </div>
              )}
              {status.state === "error" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                  {status.message}
                </div>
              )}
            </aside>
          </section>
        </form>
      )}
    </div>
  );
}

const formatQuantityDisplay = (quantity: number, precision: number) => {
  if (precision === 0) return Math.round(quantity).toString();
  const factor = 10 ** precision;
  const normalized = Math.round(quantity * factor) / factor;
  return normalized.toFixed(precision).replace(/\.?0+$/, "");
};


