"use client";

import Image from "next/image";
import Link from "next/link";
import type { DirectionCard } from "./Data";
import { SERVICE_DIRECTIONS } from "./Data";

/**
 * Компонент секции «Услуги». Аналогичен компоненту «Продукты», но
 * использует данные из массива SERVICE_DIRECTIONS и корректирует заголовок.
 */
export default function Services({
  sectionRef,
}: {
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  const directions: DirectionCard[] = SERVICE_DIRECTIONS;
  return (
    <section
      ref={sectionRef}
      id="service-directions"
      className="relative flex min-h-[100vh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950 max-md:h-dvh max-md:min-h-dvh max-md:flex-none max-md:scroll-mt-0 max-md:snap-start"
    >
      {/* Фон секции */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-900 to-slate-950" />
      {/* Контейнер */}
      <div
        className="relative z-10 mx-auto w-full max-w-[96rem] rounded-[32px] border border-white/12 bg-white/10 px-4 sm:px-4 lg:px-10 xl:px-12 py-8 lg:py-12 xl:py-16 text-white shadow-[0_30px_90px_rgba(10,20,45,0.45)] backdrop-blur-xl max-md:flex max-md:h-full max-md:flex-col max-md:justify-between max-md:rounded-none max-md:border-none max-md:bg-transparent max-md:px-4 max-md:pb-6 max-md:pt-10 max-md:shadow-none"
      >
        {/* Заголовок */}
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left max-md:flex-none max-md:gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-teal-200/80">Услуги</span>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl max-md:text-2xl">Строительные работы под ключ</h1>
          </div>
          <h2 className="max-w-xl text-sm text-white/70 max-md:text-xs">
            Команды под ключ: проектирование, строительно-монтажные и пусконаладочные работы, эксплуатация и сервис.
          </h2>
        </header>

        {/* Сетка карточек */}
        <div className="mt-8 lg:mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-3 max-md:mt-7 max-md:flex-1 max-md:grid-cols-1 max-md:grid-rows-12 max-md:gap-5">
          {directions.map((direction) => (
            <Link
              key={direction.slug}
              href={direction.href}
              className="group relative flex items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/5 transition hover:-translate-y-1 hover:border-white/45 aspect-[16/9] max-md:aspect-[60/9] max-md:rounded-2xl max-md:border-white/15 max-md:bg-white/10"
            >
              <Image
                src={direction.image}
                alt={direction.alt}
                fill
                className="object-cover object-center opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-slate-950/60 transition group-hover:bg-slate-950/35" />
              <span className="relative z-10 px-4 text-center text-xl font-bold uppercase tracking-[0.24em] text-white drop-shadow-lg sm:text-2xl max-md:px-2 max-md:text-sm max-md:tracking-[0.12em]">
                {direction.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
