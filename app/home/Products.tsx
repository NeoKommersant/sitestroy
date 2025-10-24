"use client";

import Image from "next/image";
import Link from "next/link";
import type { DirectionCard } from "./Data";
import { PRODUCT_DIRECTIONS } from "./Data";

/**
 * Компонент секции «Продукты» (категории строительных материалов).
 * Выводит сетку карточек направлений с изображениями, описаниями и ссылками.
 */
export default function Products({
  sectionRef,
}: {
  /**
   * Callback для передачи ссылки наружу. Используется для навигации к секции.
   */
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  const directions: DirectionCard[] = PRODUCT_DIRECTIONS;
  return (
    <section
      ref={sectionRef}
      id="product-directions"
      className="relative flex min-h-[100vh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* Фон секции */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-900 to-slate-950" />

      {/* Широкий центрированный контейнер-блок */}
      <div
        className="relative z-10 mx-auto w-full max-w-[96rem] rounded-[32px] border border-white/12 bg-white/10 px-4 sm:px-8 lg:px-10 xl:px-12 py-8 lg:py-12 xl:py-16 text-white shadow-[0_30px_90px_rgba(10,20,45,0.45)] backdrop-blur-xl"
      >
        {/* Шапка блока */}
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-teal-200/80">Продукты</span>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Строительные материалы</h2>
          </div>
          <p className="max-w-xl text-sm text-white/70">
            Категории подобраны под инфраструктурные проекты: вода, тепло, газ, электрика и общестрой.
          </p>
        </header>

        {/* Сетка карточек */}
        <div className="mt-8 lg:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
          {directions.map((direction) => (
            <Link
              key={direction.slug}
              href={direction.href}
              className="group relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/5 transition hover:-translate-y-1 hover:border-white/45 aspect-[16/9]"
            >
              <Image
                src={direction.image}
                alt={direction.alt}
                fill
                className="object-cover object-center opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-slate-950/60 transition group-hover:bg-slate-950/35" />
              <span className="relative z-10 px-4 text-center text-xl font-bold uppercase tracking-[0.24em] text-white drop-shadow-lg sm:text-2xl">
                {direction.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}