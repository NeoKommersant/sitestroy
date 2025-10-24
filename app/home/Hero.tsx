"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, useRef } from "react";
import type { HeroSlide } from "./Data";
import { HERO_SLIDES } from "./Data";

/**
 * Компонент секции «Герой».
 * Содержит полноэкранный слайдер с четырьмя слайдами и навигацией.
 * Состояние активного слайда и обработчики свайпов/кликов локальные,
 * что позволяет использовать компонент независимо от страницы.
 */
export default function Hero({
  sectionRef,
}: {
  /**
   * Функция для передачи ссылки наружу (например, в родительский компонент
   * для навигации по якорям). Не обязательна.
   */
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  // Используем заранее определённые слайды
  const slides: HeroSlide[] = HERO_SLIDES;
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Локальная реализация переключения слайдов
  const handleHeroSelect = useCallback(
    (index: number) => {
      if (!slides.length) return;
      const safeIndex = (index + slides.length) % slides.length;
      setActiveHeroIndex(safeIndex);
    },
    [slides.length],
  );

  // Состояние для обработки свайпов мышью/тачем
  const swipeState = useRef<{ pointerId: number; startX: number; lastX: number } | null>(null);

  const finalizeSwipe = useCallback(
    (pointerId: number, clientX: number) => {
      const state = swipeState.current;
      if (!state || state.pointerId !== pointerId) {
        return;
      }
      const deltaX = (Number.isFinite(clientX) ? clientX : state.lastX) - state.startX;
      if (Math.abs(deltaX) > 60) {
        handleHeroSelect(activeHeroIndex + (deltaX < 0 ? 1 : -1));
      }
      swipeState.current = null;
    },
    [activeHeroIndex, handleHeroSelect],
  );

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    // Если кликнули по интерактивному элементу (ссылка или кнопка),
    // свайп не нужен
    if (target?.closest("a, button")) {
      swipeState.current = null;
      return;
    }
    swipeState.current = { pointerId: event.pointerId, startX: event.clientX, lastX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const state = swipeState.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }
    swipeState.current = { ...state, lastX: event.clientX };
  }, []);

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      finalizeSwipe(event.pointerId, event.clientX);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [finalizeSwipe],
  );

  const handlePointerCancel = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    swipeState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  /**
   * Перехват кликов по якорным ссылкам внутри слайдов.
   * При клике на ссылку с href="#anchor" плавно скроллим до элемента.
   */
  const handleAnchorNavigation = useCallback((event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative isolate flex h-[100dvh] w-screen min-h-[640px] flex-col overflow-hidden select-none -mt-[60px] pt-[60px] md:-mt-[96px] md:pt-[96px]"
    >
      <div
        className="relative h-full w-full touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {slides.map((slide, index) => {
          const { primaryCta, secondaryCta } = slide;
          const offset = (index - activeHeroIndex) * 100;
          const isActive = index === activeHeroIndex;
          return (
            <div
              key={slide.id}
              className="absolute inset-0 flex h-full w-full transform transition-transform duration-500 ease-in-out will-change-transform"
              style={{ transform: `translateX(${offset}%)` }}
              aria-hidden={!isActive}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} из ${slides.length}`}
            >
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-slate-950/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/20 to-slate-950/70" />
              </div>
              <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-6 px-6 py-24 text-white sm:px-10 lg:px-16">
                <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
                  <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">Строительная организация</span>
                  <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="max-w-2xl text-lg text-white/85 sm:text-xl">{slide.subtitle}</p>
                </div>
                <p className="mx-auto max-w-3xl text-base leading-relaxed text-white/75 sm:mx-0 sm:text-lg">
                  {slide.description}
                </p>
                <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:items-center">
                  {primaryCta && (
                    <Link
                      href={primaryCta.href}
                      onClick={(event) => handleAnchorNavigation(event, primaryCta.href)}
                      className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-white/90 px-8 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 hover:shadow-slate-900/20"
                    >
                      {primaryCta.label}
                    </Link>
                  )}
                  {secondaryCta && (
                    <Link
                      href={secondaryCta.href}
                      onClick={(event) => handleAnchorNavigation(event, secondaryCta.href)}
                      className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 hover:text-white"
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => handleHeroSelect(activeHeroIndex - 1)}
            aria-label="Предыдущий слайд"
            className="group absolute left-6 bottom-[20%] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-8 sm:bottom-[18%] sm:h-14 sm:w-14 md:bottom-auto md:left-10 md:top-1/2 md:h-16 md:w-16 md:-translate-y-1/2 lg:left-16"
          >
            <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleHeroSelect(activeHeroIndex + 1)}
            aria-label="Следующий слайд"
            className="group absolute right-6 bottom-[20%] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-8 sm:bottom-[18%] sm:h-14 sm:w-14 md:bottom-auto md:right-10 md:top-1/2 md:h-16 md:w-16 md:-translate-y-1/2 lg:right-16"
          >
            <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <div className="pointer-events-none absolute left-1/2 top-[88px] flex -translate-x-1/2 items-center gap-2 sm:top-[100px] md:top-auto md:bottom-16 md:gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleHeroSelect(index)}
                className={`pointer-events-auto h-1.5 w-8 rounded-full border border-white/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:h-2 sm:w-9 ${activeHeroIndex === index ? "bg-white/90" : "bg-white/20"}`}
                aria-label={`Перейти к слайду: ${slide.title}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}