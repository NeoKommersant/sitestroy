import Image from "next/image";
import Link from "next/link";

const SOCIALS = [
  {
    label: "Telegram",
    href: "https://t.me/stroyalliance",
    icon: "/img/icons/telegram.svg",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/79991234567",
    icon: "/img/icons/whatsapp.svg",
  },
  {
    label: "Viber",
    href: "viber://chat?number=+79991234567",
    icon: "/img/icons/viber.svg",
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
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 py-3 sm:grid-cols-[auto,1fr,auto] sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-700">
          <a className="font-semibold text-slate-900 hover:text-blue-700" href="tel:+74951234567">
            +7 (495) 123-45-67
          </a>
          <div className="hidden items-center gap-2 md:flex">
            {SOCIALS.map((s) => (
              <a key={s.label} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-blue-500 hover:bg-blue-50" href={s.href} aria-label={s.label}>
                <Image src={s.icon} alt={s.label} width={18} height={18} />
              </a>
            ))}
          </div>
        </div>

        <Link href="/" className="flex items-center justify-center gap-3">
          <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={44} height={44} priority />
          <span className="text-base font-semibold uppercase tracking-wide text-slate-900 sm:text-lg">
            ГК «Строй Альянс»
          </span>
        </Link>

        <nav className="hidden items-center justify-end gap-6 text-sm font-medium text-slate-700 lg:flex">
          {MENU.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-blue-700">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a key={s.label} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-blue-500 hover:bg-blue-50" href={s.href} aria-label={s.label}>
                <Image src={s.icon} alt={s.label} width={18} height={18} />
              </a>
            ))}
          </div>
          <Link href="/catalog" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-blue-500 hover:text-blue-700">
            Меню
          </Link>
        </div>
      </div>
    </header>
  );
}
