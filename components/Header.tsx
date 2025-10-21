"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const headerClasses = isScrolled
    ? "bg-slate-950/80 backdrop-blur-xl"
    : "bg-slate-950/50 backdrop-blur-md";

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 border-b border-white/10 text-white transition-colors ${headerClasses}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-sm sm:px-6 lg:px-10">
          <div className="flex flex-1 items-center gap-4">
            <a
              className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20 hover:text-white"
              href="tel:+74951234567"
              title="Позвонить менеджеру"
            >
              <svg className="h-4 w-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 7.455 5.295 12.75 12.75 12.75h1.086c.621 0 1.167-.42 1.314-1.022l.72-2.878a1.125 1.125 0 0 0-.578-1.257l-2.07-1.035a1.125 1.125 0 0 0-1.257.21l-.906.906a.218.218 0 0 1-.28.028 8.316 8.316 0 0 1-2.544-2.544.218.218 0 0 1 .028-.28l.906-.906a1.125 1.125 0 0 0 .21-1.257L9.657 6.26A1.125 1.125 0 0 0 8.4 5.682l-2.878.72A1.312 1.312 0 0 0 4.5 7.716v1.284" />
              </svg>
              <span className="text-sm font-semibold tracking-wide text-white">+7 (495) 123-45-67</span>
            </a>
            <div className="hidden items-center gap-2 lg:flex">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  title={social.tooltip}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                  aria-label={social.label}
                >
                  <Image src={social.icon} alt={social.label} width={18} height={18} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <Link href="/" className="flex flex-shrink-0 items-center gap-3 text-white">
            <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={56} height={56} priority className="h-14 w-14" />
            <span className="text-base font-semibold uppercase tracking-wide text-white sm:text-lg">ГК «Строй Альянс»</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-3">
            <nav className="hidden items-center gap-6 text-sm font-medium text-white/80 xl:flex">
              {MENU.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 lg:hidden">
              {SOCIALS.slice(0, 3).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  title={social.tooltip}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                  aria-label={social.label}
                >
                  <Image src={social.icon} alt={social.label} width={18} height={18} className="h-4 w-4" />
                </a>
              ))}
            </div>
            <Link
              href="/catalog/request"
              className="ml-8 hidden rounded-full border border-white/30 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/20 hover:text-white lg:inline-flex whitespace-nowrap"
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
        className="fixed bottom-6 left-1/2 z-50 flex w-[min(90vw,320px)] -translate-x-1/2 items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 backdrop-blur transition hover:border-white/40 hover:bg-white/15 hover:text-white sm:hidden"
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

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 sm:hidden" role="dialog" aria-modal="true" id="mobile-navigation">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeMenu} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-white/10 bg-slate-950/95 px-6 pb-10 pt-8 shadow-[0_-20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between text-white/70">
              <span className="text-xs font-semibold uppercase tracking-[0.3em]">Навигация</span>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                aria-label="Закрыть меню"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 space-y-4 text-lg font-semibold text-white">
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
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 text-white">
              <p className="text-sm text-white/70">Свяжитесь с нами</p>
              <a
                href="tel:+74951234567"
                className="mt-2 block text-2xl font-semibold text-white transition hover:text-white/80"
                onClick={closeMenu}
              >
                +7 (495) 123-45-67
              </a>
              <div className="mt-4 flex flex-wrap gap-3">
                {SOCIALS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    title={social.tooltip}
                    className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                  >
                    <Image src={social.icon} alt={social.label} width={18} height={18} className="h-4 w-4" />
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
