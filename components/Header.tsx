import Image from "next/image";
import Link from "next/link";

// Социальные сети компании + тултипы с контактами
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

// Основные разделы сайта
const MENU = [
  { label: "Каталог", href: "/catalog" },
  { label: "Услуги", href: "/services" },
  { label: "Клиенты", href: "/clients" },
  { label: "Сертификаты", href: "/certificates" },
  { label: "Контакты", href: "/contacts" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm sm:px-6 lg:px-8">
        {/* Левая часть: телефон и соцсети */}
        <div className="flex flex-1 items-center gap-4">
          <a className="font-semibold text-slate-900 transition hover:text-blue-700" href="tel:+74951234567" title="Позвонить менеджеру">
            +7 (495) 123-45-67
          </a>
          <div className="hidden items-center gap-2 lg:flex">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                title={social.tooltip}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
                aria-label={social.label}
              >
                <Image src={social.icon} alt={social.label} width={18} height={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Центр: логотип и название */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-3">
          <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={44} height={44} priority />
          <span className="text-base font-semibold uppercase tracking-wide text-slate-900 sm:text-lg">
            ГК «Строй Альянс»
          </span>
        </Link>

        {/* Правая часть: меню + соцсети в мобильной версии */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 xl:flex">
            {MENU.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-blue-700">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 xl:hidden">
            {SOCIALS.slice(0, 3).map((social) => (
              <a
                key={social.label}
                href={social.href}
                title={social.tooltip}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-blue-500 hover:bg-blue-50"
                aria-label={social.label}
              >
                <Image src={social.icon} alt={social.label} width={18} height={18} />
              </a>
            ))}
          </div>
          <Link
            href="/catalog"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-blue-500 hover:text-blue-700 xl:hidden"
          >
            Меню
          </Link>
        </div>
      </div>
    </header>
  );
}
