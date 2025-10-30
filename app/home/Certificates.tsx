"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, WheelEvent as ReactWheelEvent } from "react";
import type { CertificateCard } from "./Data";
import { CERTIFICATES } from "./Data";

type SliderDirection = 1 | -1;
const DESKTOP_CARDS_PER_SLIDE = 3;
const PROGRAMMATIC_SCROLL_TIMEOUT = 520;

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: ReactNode }) {
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
          aria-label="Закрыть подробности сертификата"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
}

export default function Certificates({
  sectionRef,
}: {
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  const certificates: CertificateCard[] = CERTIFICATES;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);
  const programmaticTimeoutRef = useRef<number | null>(null);
  const cardsPerSlide = DESKTOP_CARDS_PER_SLIDE;
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateCard | null>(null);

  const handleOpen = useCallback((certificate: CertificateCard) => {
    setSelectedCertificate(certificate);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedCertificate(null);
  }, []);

  const slidesCount = Math.max(1, Math.ceil(certificates.length / cardsPerSlide));

  useEffect(() => {
    setActiveSlide((current) => (current >= slidesCount ? slidesCount - 1 : current));
  }, [slidesCount]);

  const scrollToSlide = useCallback(
    (slideIndex: number, options?: { behavior?: ScrollBehavior }) => {
      const container = trackRef.current;
      if (!container) return;
      const cards = container.querySelectorAll<HTMLButtonElement>("[data-slider-card]");
      if (!cards.length) return;
      const normalizedIndex = ((slideIndex % slidesCount) + slidesCount) % slidesCount;
      const targetCardIndex = Math.min(normalizedIndex * cardsPerSlide, cards.length - 1);
      const target = cards[targetCardIndex];
      if (!target) return;
      if (programmaticTimeoutRef.current !== null) {
        window.clearTimeout(programmaticTimeoutRef.current);
        programmaticTimeoutRef.current = null;
      }
      const behavior = options?.behavior ?? "smooth";
      programmaticScrollRef.current = true;
      container.scrollTo({ left: target.offsetLeft, behavior });
      programmaticTimeoutRef.current = window.setTimeout(() => {
        programmaticScrollRef.current = false;
        programmaticTimeoutRef.current = null;
      }, behavior === "auto" ? 0 : PROGRAMMATIC_SCROLL_TIMEOUT);
      setActiveSlide(normalizedIndex);
    },
    [cardsPerSlide, slidesCount],
  );

  const scrollByStep = useCallback(
    (direction: SliderDirection) => {
      if (!slidesCount) return;
      const nextSlide = (activeSlide + direction + slidesCount) % slidesCount;
      scrollToSlide(nextSlide);
    },
    [activeSlide, scrollToSlide, slidesCount],
  );

  const handleWheel = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    trackRef.current?.scrollBy({ left: event.deltaY, behavior: "auto" });
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (window.innerWidth < 768) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollByStep(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollByStep(-1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [scrollByStep]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      if (programmaticTimeoutRef.current !== null) {
        window.clearTimeout(programmaticTimeoutRef.current);
        programmaticTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="certificates"
      className="relative flex min-h-[100vh] w-full select-none scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950 max-md:h-dvh max-md:min-h-dvh max-md:flex-none max-md:scroll-mt-0 max-md:snap-start"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="relative z-10 mx-auto flex h-[85vh] w-[85vw] max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-12 text-white shadow-[0_30px_90px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10 lg:py-16 max-md:h-full max-md:w-full max-md:gap-6 max-md:rounded-none max-md:border-none max-md:bg-transparent max-md:px-4 max-md:pb-6 max-md:pt-14 max-md:shadow-none">
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left max-md:flex-none max-md:gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">Компетенции</span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl max-md:text-2xl">Допуски и сертификаты</h2>
          </div>
          <p className="max-w-xl text-sm text-white/70 max-md:text-xs">
            Сертификаты ISO, Ростехнадзора и СРО подтверждают компетенции команды и допускают нас к объектам повышенной сложности.
          </p>
        </header>

        <div className="relative flex-1">
          <div
            ref={trackRef}
            className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 scroll-smooth sm:gap-5 md:h-full md:gap-5 md:overflow-hidden md:px-0 md:pb-2 max-md:mt-0"
            onWheel={handleWheel}
            onScroll={() => {
              const container = trackRef.current;
              if (!container) return;
              if (scrollRafRef.current !== null) {
                cancelAnimationFrame(scrollRafRef.current);
              }
              scrollRafRef.current = window.requestAnimationFrame(() => {
                if (programmaticScrollRef.current) {
                  scrollRafRef.current = null;
                  return;
                }
                const cards = container.querySelectorAll<HTMLButtonElement>("[data-slider-card]");
                if (!cards.length) return;
                let nearestCard = activeSlide * cardsPerSlide;
                let minDistance = Number.POSITIVE_INFINITY;
                cards.forEach((card, index) => {
                  const distance = Math.abs(card.offsetLeft - container.scrollLeft);
                  if (distance < minDistance) {
                    minDistance = distance;
                    nearestCard = index;
                  }
                });
                const computedSlide = Math.min(slidesCount - 1, Math.floor(nearestCard / cardsPerSlide));
                if (computedSlide !== activeSlide) {
                  setActiveSlide(computedSlide);
                }
                scrollRafRef.current = null;
              });
            }}
          >
            {certificates.map((certificate, index) => (
              <button
                key={certificate.id}
                data-slider-card
                type="button"
                onClick={() => handleOpen(certificate)}
                aria-label={`Подробнее о сертификате ${certificate.title}`}
                className="group relative flex h-full flex-none items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/5 transition hover:-translate-y-1 hover:border-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 max-md:h-auto max-md:w-full max-md:snap-start max-md:aspect-[6/7] md:h-full md:aspect-[3/4] md:flex-[0_0_calc((100%-2.5rem)/3)] md:max-w-[calc((100%-2.5rem)/3)] md:snap-start"
              >
                <Image
                  src={certificate.image}
                  alt={certificate.alt}
                  fill
                  className="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-slate-950/35 transition group-hover:bg-slate-950/55" />
                <div className="relative z-10 flex h-full w-full flex-col items-center gap-3 px-4 pb-4 pt-3 text-center max-md:gap-1.5 max-md:pb-3 max-md:pt-2 md:pb-6 md:pt-5">
                  <span className="self-end rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-lg">
                    {String(index + 1).padStart(2, "0")}/{String(certificates.length).padStart(2, "0")}
                  </span>
                  <span className="rounded-2xl border border-white/20 bg-white/15 px-3 py-2 text-lg font-semibold uppercase tracking-[0.18em] text-white drop-shadow-lg backdrop-blur-lg sm:text-xl max-md:text-base">
                    {certificate.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col items-center gap-4 md:mt-10">
          <div className="hidden w-full items-center justify-between md:flex">
            <button
              type="button"
              onClick={() => scrollByStep(-1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white shadow-[0_12px_36px_rgba(8,15,40,0.55)] backdrop-blur-2xl transition hover:border-white/35 hover:bg-white/20"
              aria-label="Предыдущие сертификаты"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByStep(1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white shadow-[0_12px_36px_rgba(8,15,40,0.55)] backdrop-blur-2xl transition hover:border-white/35 hover:bg-white/20"
              aria-label="Следующие сертификаты"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {Array.from({ length: slidesCount }).map((_, index) => (
              <button
                key={`slide-${index}`}
                type="button"
                onClick={() => scrollToSlide(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${activeSlide === index ? "bg-white" : "bg-white/35 hover:bg-white/60"}`}
                aria-label={`Show certificate group ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-4 md:hidden">
            {Array.from({ length: slidesCount }).map((_, index) => (
              <button
                key={`mobile-slide-${index}`}
                type="button"
                onClick={() => scrollToSlide(index)}
                className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${activeSlide === index ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]" : "bg-white/45 shadow-[0_0_8px_rgba(255,255,255,0.35)]"}`}
                aria-label={`Show mobile certificate group ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedCertificate && (
        <Modal title={selectedCertificate.title} onClose={handleClose}>
          <p className="text-sm font-semibold text-slate-500">{selectedCertificate.number}</p>
          <p className="text-sm text-slate-600">Выдан: {selectedCertificate.issuedBy}</p>
          <p className="text-sm text-slate-600">Действует до: {selectedCertificate.validTill}</p>
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