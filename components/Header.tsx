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

const DESKTOP_HEADER_HEIGHT = 88;
const MOBILE_BAR_HEIGHT = 60;

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
    setIsScrolled(current > 12);

    // меню всегда раскрывает хедер
    if (isMenuOpen) {
      setIsCollapsed(false);
      return;
    }

    // у самого верха страницы держим раскрытым
    if (current < DESKTOP_HEADER_HEIGHT) {
      setIsCollapsed(false);
      return;
    }

    // ВАЖНО: ниже порога — ВСЕГДА свёрнут, независимо от
    // направления скролла (вверх/вниз)
    setIsCollapsed(true);
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
    }, 1000);
  }, [isMenuOpen]);

  const revealZone = useMemo(
    () =>
      isCollapsed && !isMenuOpen ? (
        <div className="pointer-events-auto fixed top-0 left-0 right-0 z-40 hidden justify-center md:flex" onMouseEnter={handleHeaderEnter}>
          <div className="mt-0.5 flex h-10 items-center rounded-b-full border border-white/20 border-t-transparent bg-slate-950/85 px-6 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/70 shadow-[0_10px_30px_rgba(10,20,40,0.45)] backdrop-blur">
            ГК «Строй Альянс»
          </div>
        </div>
      ) : null,
    [handleHeaderEnter, isCollapsed, isMenuOpen],
  );

  const headerBackground = isScrolled ? "bg-slate-950 shadow-[0_8px_40px_rgba(8,18,40,0.5)]" : "bg-slate-950";
  const headerStyle = isCollapsed
    ? { transform: "translateY(-100%)" }
    : { transform: "translateY(0)" };

  const mobileTopBar = useMemo(
    () => (
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center border-b border-transparent bg-slate-950/85 px-4 py-2 text-white backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2 text-white">
          <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={40} height={40} className="h-10 w-10" priority />
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">ГК «Строй Альянс»</span>
        </Link>
      </div>
    ),
    [],
  );

  return (
    <>
      {mobileTopBar}
      {revealZone}
      <header
        className={`pointer-events-auto fixed top-0 left-0 right-0 z-50 hidden border-b border-transparent text-white transition-transform duration-300 ease-out md:block ${headerBackground}`}
        style={headerStyle}
        onMouseEnter={handleHeaderEnter}
        onMouseLeave={scheduleCollapse}
      >
        <div className="relative mx-auto flex w-full max-w-none items-center px-6 py-3 lg:px-10">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <a
              className="inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-white/25 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-white transition hover:border-teal-400 hover:bg-slate-900/80"
              href="tel:+74951234567"
              title="Позвонить менеджеру"
            >
              <svg className="h-4 w-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 7.455 5.295 12.75 12.75 12.75h1.086c.621 0 1.167-.42 1.314-1.022l.72-2.878a1.125 1.125 0 0 0-.578-1.257l-2.07-1.035a1.125 1.125 0 0 0-1.257.21l-.906.906a.218.218 0 0 1-.28.028 8.316 8.316 0 0 1-2.544-2.544.218.218 0 0 1 .028-.28l.906-.906a1.125 1.125 0 0 0 .21-1.257L9.657 6.26A1.125 1.125 0 0 0 8.4 5.682l-2.878.72A1.312 1.312 0 0 0 4.5 7.716v1.284" />
              </svg>
              <span className="text-sm font-semibold tracking-wide">+7 (495) 123-45-67</span>
            </a>
            <div className="hidden items-center gap-2 md:flex lg:hidden">
              {SOCIALS.slice(0, 3).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  title={social.tooltip}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900/60 text-white/80 transition hover:border-teal-400 hover:bg-slate-900/80 hover:text-white"
                  aria-label={social.label}
                >
                  <Image src={social.icon} alt={social.label} width={18} height={18} className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  title={social.tooltip}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-900/60 text-white/80 transition hover:border-teal-400 hover:bg-slate-900/80 hover:text-white"
                  aria-label={social.label}
                >
                  <Image src={social.icon} alt={social.label} width={18} height={18} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <Link href="/" className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 text-white">
            <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={60} height={60} priority className="h-14 w-14" />
            <span className="text-base font-semibold uppercase tracking-[0.2em]">ГК «Строй Альянс»</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-4 pl-4">
            <nav className="hidden flex-wrap items-center gap-4 text-sm font-medium text-white/80 md:flex md:justify-end lg:gap-6">
              {MENU.map((item) => (
                <Link key={item.href} href={item.href} className="whitespace-nowrap transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/catalog/request"
              className="hidden shrink-0 whitespace-nowrap rounded-full border border-white/30 bg-slate-900/60 px-6 py-2 text-sm font-semibold text-white transition hover:border-teal-400 hover:bg-slate-900/80 md:inline-flex"
            >
              Оставить запрос
            </Link>
          </div>
        </div>
      </header>

      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        className="fixed bottom-6 left-1/2 z-40 flex w-[min(92vw,340px)] -translate-x-1/2 items-center justify-center gap-3 rounded-full border border-white/20 bg-slate-950/85 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/40 backdrop-blur md:hidden"
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
            className={`absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-white/10 bg-slate-950 text-white shadow-[0_-30px_80px_rgba(8,15,40,0.45)] transition-transform duration-300 ease-out ${isMenuOpen ? "translate-y-0" : "translate-y-full"}`}
            style={{ minHeight: `calc(100vh - ${MOBILE_BAR_HEIGHT + 24}px)` }}
          >
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between pb-4">
                <Link href="/" onClick={closeMenu} className="flex items-center gap-2 text-white">
                  <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={44} height={44} className="h-11 w-11" />
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">ГК «Строй Альянс»</span>
                </Link>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                  aria-label="Закрыть меню"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="h-px w-full bg-white/10" />
            </div>

            <div className="px-6 pb-10 pt-6">
              <div className="space-y-3 text-lg font-semibold">
                {MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30 hover:bg-white/10"
                  >
                    {item.label}
                    <svg className="h-5 w-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>

              <div className="mt-6 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-white">
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
