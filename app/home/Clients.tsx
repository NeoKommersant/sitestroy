"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { ClientCase } from "./Data";
import { CLIENT_CASES } from "./Data";

/**
 * Вспомогательный модальный компонент для показа подробностей кейса.
 * Принимает заголовок, тело и функцию для закрытия. Используется внутри Clients.
 */
function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          aria-label="Закрыть модальное окно"
        >
          ×
        </button>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
}

/**
 * Компонент секции «Клиенты». Отображает сетку кейсов B2B/B2G и позволяет
 * открывать подробности в модальном окне.
 */
export default function Clients({
  sectionRef,
}: {
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  const cases: ClientCase[] = CLIENT_CASES;
  const [selectedCase, setSelectedCase] = useState<ClientCase | null>(null);

  const handleOpenCase = useCallback((clientCase: ClientCase) => {
    setSelectedCase(clientCase);
  }, []);
  const handleClose = useCallback(() => {
    setSelectedCase(null);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clients"
      className="relative flex min-h-[100vh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950 max-md:h-dvh max-md:min-h-dvh max-md:flex-none max-md:scroll-mt-0 max-md:snap-start"
    >
      {/* Фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950" />
      {/* Контейнер */}
      <div
        className="relative z-10 mx-auto w-full max-w-[96rem] rounded-[32px] border border-white/12 bg-white/10 px-4 sm:px-8 lg:px-10 xl:px-12 py-8 lg:py-12 xl:py-16 text-white shadow-[0_30px_90px_rgba(10,20,45,0.45)] backdrop-blur-xl max-md:flex max-md:h-full max-md:flex-col max-md:justify-between max-md:rounded-none max-md:border-none max-md:bg-transparent max-md:px-4 max-md:py-20 max-md:shadow-none"
      >
        {/* Заголовок */}
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left max-md:flex-none max-md:gap-1">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">Кейсы</span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl max-md:text-2xl">Опыт для B2B и B2G</h2>
          </div>
          <p className="max-w-xl text-sm text-white/70 max-md:text-xs">
            Реализуем проекты различного масштаба: инженерные сети, энергообъекты и модернизация инфраструктуры по всей стране.
          </p>
        </header>
        {/* Сетка карточек */}
        <div className="mt-8 lg:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5 max-md:mt-5 max-md:flex-1 max-md:grid-cols-2 max-md:grid-rows-2 max-md:gap-4">
          {cases.map((clientCase) => (
            <button
              key={clientCase.id}
              type="button"
              onClick={() => handleOpenCase(clientCase)}
              aria-label={`Подробнее о кейсе ${clientCase.name}`}
              className="group relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/5 transition hover:-translate-y-1 hover:border-white/45 aspect-[16/9] max-md:h-full max-md:w-[180px] max-md:rounded-2xl max-md:border-white/15 max-md:bg-white/10"
            >
              <Image
                src={clientCase.image}
                alt={clientCase.alt}
                fill
                className="object-cover object-center opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                sizes="(min-width:1024px) 50vw, (min-width:640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-slate-950/55 transition group-hover:bg-slate-950/35" />
              <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
                <span className="text-xl font-bold uppercase tracking-[0.18em] text-white drop-shadow-lg sm:text-3xl max-md:text-xs max-md:tracking-[0.10em]">
                  {clientCase.name}
                </span>
                <span className="rounded-full border border-white/40 bg-white/20 px-1 py-0 text-[9px] font-semibold uppercase tracking-[0.10em] text-white/85">
                  {clientCase.sector}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Модальное окно с информацией о выбранном кейсе */}
      {selectedCase && (
        <Modal title={selectedCase.name} onClose={handleClose}>
          <p className="text-sm font-semibold text-slate-500">{selectedCase.sector}</p>
          <p className="text-sm text-slate-600">{selectedCase.summary}</p>
          <ul className="list-disc space-y-2 pl-5 pt-3 text-sm text-slate-600">
            {selectedCase.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          {selectedCase.link && (
            <a
              href={selectedCase.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 pt-4 text-sm font-semibold text-blue-700 transition hover:text-blue-600"
            >
              Посетить
            </a>
          )}
        </Modal>
      )}
    </section>
  );
}