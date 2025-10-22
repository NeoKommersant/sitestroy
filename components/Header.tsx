"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SOCIALS = [
  {
    label: "Telegram",
    href: "https://t.me/stroyalliance",
    icon: "/img/icons/telegram.svg",
    tooltip: "Telegram: @stroyalliance",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/79991234567",
    icon: "/img/icons/whatsapp.svg",
    tooltip: "WhatsApp: +7 (999) 123-45-67",
  },
  {
    label: "Viber",
    href: "viber://chat?number=+79991234567",
    icon: "/img/icons/viber.svg",
    tooltip: "Viber: +7 (999) 123-45-67",
  },
  {
    label: "VK",
    href: "https://vk.com/stroyalliance",
    icon: "/img/icons/vk.svg",
    tooltip: "VK: vk.com/stroyalliance",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@stroyalliance",
    icon: "/img/icons/youtube.svg",
    tooltip: "YouTube: @stroyalliance",
  },
];

const MENU = [
  { label: "Каталог", href: "/catalog" },
  { label: "Услуги", href: "/services" },
  { label: "Клиенты", href: "/clients" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Контакты", href: "/contacts" },
];

const DESKTOP_HEADER_HEIGHT = 92;
const MOBILE_TRIGGER_HEIGHT = 76;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuRendered, setIsMenuRendered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastScrollYRef = useRef(0);
  const collapseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollYRef.current;
      lastScrollYRef.current = current;
      setIsScrolled(current > 16);

      if (isMenuOpen) {
        setIsCollapsed(false);
        return;
      }

      if (current < DESKTOP_HEADER_HEIGHT) {
        setIsCollapsed(false);
        return;
      }

      if (delta > 6 && current > DESKTOP_HEADER_HEIGHT + 20) {
        setIsCollapsed(true);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuRendered(true);
      setIsCollapsed(false);
      return;
    }

    if (!isMenuRendered) return;
    const timer = window.setTimeout(() => setIsMenuRendered(false), 260);
    return () => window.clearTimeout(timer);
  }, [isMenuOpen, isMenuRendered]);

  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        window.clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleHeaderEnter = useCallback(() => {
    if (collapseTimeoutRef.current) {
      window.clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
    setIsCollapsed(false);
  }, []);

  const scheduleCollapse = useCallback(() => {
    if (window.scrollY < DESKTOP_HEADER_HEIGHT || isMenuOpen) return;
    collapseTimeoutRef.current = window.setTimeout(() => {
      setIsCollapsed(true);
    }, 200);
  }, [isMenuOpen]);

  const revealZone = useMemo(
    () =>
      isCollapsed && !isMenuOpen ? (
        <div
          className="pointer-events-auto fixed top-0 left-0 right-0 z-40 hidden h-4 md:block"
          onMouseEnter={handleHeaderEnter}
        >
          <div className="mx-auto h-full w-40 rounded-b-full bg-white/20 blur-sm" />
        </div>
      ) : null,
    [handleHeaderEnter, isCollapsed, isMenuOpen],
  );

  const headerBackground = isScrolled ? "bg-slate-950/85 backdrop-blur-xl" : "bg-slate-950/55 backdrop-blur-md";
  const headerStyle = isCollapsed
    ? { transform: "translateY(calc(-100% + 12px))" }
    : { transform: "translateY(0)" };

  return (
    <>
      {revealZone}
      <header
  className={`pointer-events-auto fixed top-0 left-0 right-0 z-50 border-b border-white/10 text-white transition-colors duration-300 ease-out ${headerBackground}`}
  style={headerStyle}
  onMouseEnter={handleHeaderEnter}
  onMouseLeave={scheduleCollapse}
>
  {/* Контейнер на всю ширину */}
  <div className="w-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4">
    {/* Адаптивная сетка: слева контакты, по центру бренд, справа меню+CTA */}
    <div
      className="
        grid items-center gap-x-4 gap-y-3
        grid-cols-12
      "
    >
      {/* ЛЕВАЯ ЗОНА: телефон + соцсети */}
      <div className="col-span-12 md:col-span-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <a
            className="inline-flex items-center gap-2 sm:gap-3 whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-3 sm:px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/20"
            href="tel:+74951234567"
            title="Позвонить менеджеру"
          >
            <svg className="h-4 w-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 7.455 5.295 12.75 12.75 12.75h1.086c.621 0 1.167-.42 1.314-1.022l.72-2.878a1.125 1.125 0 0 0-.578-1.257l-2.07-1.035a1.125 1.125 0 0 0-1.257.21l-.906.906a.218.218 0 0 1-.28.028 8.316 8.316 0 0 1-2.544-2.544.218.218 0 0 1 .028-.28l.906-.906a1.125 1.125 0 0 0 .21-1.257L9.657 6.26A1.125 1.125 0 0 0 8.4 5.682l-2.878.72A1.312 1.312 0 0 0 4.5 7.716v1.284" />
            </svg>
            <span className="text-sm font-semibold tracking-wide">+7 (495) 123-45-67</span>
          </a>

          {/* Соцсети: на десктопе все, на меньших ширинах — часть, но без налепания */}
          <div className="flex items-center gap-2">
            {SOCIALS.map((social, i) => (
              <a
                key={social.label}
                href={social.href}
                title={social.tooltip}
                className={`
                  inline-flex h-10 w-10 items-center justify-center rounded-full
                  border border-white/20 bg-white/15 text-white/80 transition
                  hover:border-white/40 hover:bg-white/25 hover:text-white
                  ${i > 2 ? 'hidden xl:inline-flex' : ''}  /* первые 3 иконки видны везде, остальные — с xl */
                `}
                aria-label={social.label}
              >
                <Image src={social.icon} alt={social.label} width={18} height={18} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ЦЕНТР: логотип + название (всегда по центру колонки) */}
      <div className="col-span-12 md:col-span-4 md:justify-self-center">
        <Link href="/" className="flex items-center gap-3 text-white justify-center md:justify-start min-w-0">
          <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={56} height={56} priority className="h-12 w-12 sm:h-14 sm:w-14 shrink-0" />
          <span className="truncate text-base sm:text-lg font-semibold uppercase tracking-[0.18em] sm:tracking-[0.2em]">
            ГК «Строй Альянс»
          </span>
        </Link>
      </div>

      {/* ПРАВАЯ ЗОНА: меню + CTA, уезжает влево если не хватает места */}
      <div className="col-span-12 md:col-span-4 md:justify-self-end">
        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4">
          {/* Навигация — только с lg, чтобы не слипалось */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-white/85">
            {MENU.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white whitespace-nowrap">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA всегда видна на md+, на малых — можно скрыть или перенести вниз по желанию */}
          <Link
            href="/catalog/request"
            className="hidden md:inline-flex whitespace-nowrap rounded-full border border-white/35 bg-white/10 px-5 sm:px-6 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/20"
          >
            Оставить запрос
          </Link>
        </div>
      </div>
    </div>
  </div>
</header>


      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        className="fixed bottom-6 left-1/2 z-40 flex w-[min(92vw,340px)] -translate-x-1/2 items-center justify-center gap-3 rounded-full border border-slate-100/25 bg-slate-950/90 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/40 backdrop-blur md:hidden"
      >
        {isMenuOpen ? "Закрыть меню" : "Меню"}
        {isMenuOpen ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isMenuRendered && (
        <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true" id="mobile-navigation">
          <div
            className={`absolute inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            onClick={closeMenu}
          />
          <div
            className={`absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-slate-100/15 bg-slate-950 text-white shadow-[0_-30px_80px_rgba(8,15,40,0.45)] transition-transform duration-300 ease-out ${isMenuOpen ? "translate-y-0" : "translate-y-full"}`}
            style={{ minHeight: `calc(100vh - ${MOBILE_TRIGGER_HEIGHT}px)` }}
          >
            <div className="flex items-center justify-between px-6 pb-2 pt-6">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-3 text-white">
                <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={48} height={48} className="h-12 w-12" />
                <span className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">ГК «Строй Альянс»</span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                aria-label="Закрыть меню"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="h-[1px] w-full bg-white/10" />

            <div className="px-6 pb-10 pt-6">
              <div className="space-y-4 text-lg font-semibold">
                {MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:border-white/30 hover:bg-white/10"
                  >
                    {item.label}
                    <svg className="h-5 w-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>

              <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-white">
                <p className="text-sm text-white/70">Свяжитесь с нами</p>
                <a href="tel:+74951234567" className="block text-2xl font-semibold text-white transition hover:text-white/80" onClick={closeMenu}>
                  +7 (495) 123-45-67
                </a>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      title={social.tooltip}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                    >
                      <Image src={social.icon} alt={social.label} width={18} height={18} className="h-4 w-4" />
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
