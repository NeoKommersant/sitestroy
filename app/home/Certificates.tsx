"use client";

// -----------------------------------------------------------------------------
// Компонент секции «Сертификаты» для домашней страницы.
// Этот компонент отображает список сертификатов и допусков и позволяет
// просматривать подробности в модальном окне. Данные загружаются из
// Data.tsx. Вы можете передать колбэк sectionRef, чтобы установить ref на
// секцию для реализации якорной навигации.
// -----------------------------------------------------------------------------

import Image from "next/image";
import { useCallback, useState } from "react";
import type { CertificateCard } from "./Data";
import { CERTIFICATES } from "./Data";

/**
 * Внутренний модальный компонент для показа подробностей сертификата.
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
 * Основная секция для отображения сертификатов. Рендерит сетку карточек и
 * открывает модальное окно при выборе.
 */
export default function Certificates({
  sectionRef,
}: {
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  const certificates: CertificateCard[] = CERTIFICATES;
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateCard | null>(null);

  const handleOpen = useCallback((certificate: CertificateCard) => {
    setSelectedCertificate(certificate);
  }, []);
  const handleClose = useCallback(() => {
    setSelectedCertificate(null);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="certificates"
      className="relative flex min-h-[100vh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* Фон градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      {/* Каркас блока */}
      <div className="relative z-10 mx-auto flex h-[85vh] w-[85vw] max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-12 text-white shadow-[0_30px_90px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10 lg:py-16">
        {/* Заголовок */}
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">Компетенции</span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Допуски и Сертификаты</h2>
          </div>
          <p className="max-w-xl text-sm text-white/70">
            Сертификаты ISO, Ростехнадзора и СРО подтверждают компетенции команды и допуск к работам на сложных объектах.
          </p>
        </header>
        {/* Сетка карточек */}
        <div className="mt-10 grid flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate, index) => (
            <button
              key={certificate.id}
              type="button"
              onClick={() => handleOpen(certificate)}
              aria-label={`Подробнее о сертификате ${certificate.title}`}
              className="group relative flex h-full items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/5 transition hover:-translate-y-1 hover:border-white/45"
              style={{ aspectRatio: "4 / 3" }}
            >
              <Image
                src={certificate.image}
                alt={certificate.alt}
                fill
                className="object-cover object-center opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-slate-950/55 transition group-hover:bg-slate-950/65" />
              <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
                <span className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/85">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-semibold uppercase tracking-[0.18em] text-white drop-shadow-lg sm:text-xl">
                  {certificate.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Модальное окно */}
      {selectedCertificate && (
        <Modal title={selectedCertificate.title} onClose={handleClose}>
          <p className="text-sm font-semibold text-slate-500">{selectedCertificate.number}</p>
          <p className="text-sm text-slate-600">Выдан: {selectedCertificate.issuedBy}</p>
          <p className="text-sm text-slate-600">Действует: {selectedCertificate.validTill}</p>
          <ul className="list-disc space-y-2 pl-5 pt-3 text-sm text-slate-600">
            {selectedCertificate.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Modal>
      )}
    </section>
  );
}