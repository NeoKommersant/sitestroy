import Image from "next/image";
import Link from "next/link";
import { EmailCopyLink } from "@/components/ui/EmailCopyLink";

const LEGAL_LINKS = [
  { href: "/policy", label: "Политика обработки персональных данных" },
  { href: "/sitemap", label: "Карта сайта" },
  { href: "/docs", label: "Документы и реквизиты" },
];

const CONTACTS = [
  { role: "Коммерческий директор", phone: "+7 (495) 123-45-67" },
  { role: "Отдел снабжения", phone: "+7 (985) 222-33-44" },
  { role: "Директор по проектам", phone: "+7 (916) 555-77-99" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 text-sm text-slate-700">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {/* Верхняя строка: логотип и пресс-служба */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo.svg" alt="Логотип ГК «Строй Альянс»" width={40} height={40} />
            <div>
              <div className="text-base font-semibold text-slate-900">ГК «Строй Альянс»</div>
              <div className="text-xs uppercase tracking-wide text-slate-500">Комплексные решения для инфраструктурных проектов</div>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm md:justify-end">
            <span className="font-semibold text-slate-900">Пресс-служба:</span>
            <EmailCopyLink email="press@stroyalliance.ru" className="font-medium">
              press@stroyalliance.ru
            </EmailCopyLink>
            <span>·</span>
            <Link href="/media" className="text-blue-700 hover:text-blue-800">
              Медиа-центр
            </Link>
          </div>
        </div>

        {/* Контакты, документы и соцсети */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Контакты</div>
            <div className="space-y-1">
              {CONTACTS.map(({ role, phone }) => (
                <div key={role} className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-slate-500">{role}</span>
                  <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="text-slate-900 hover:text-blue-700">
                    {phone}
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <div>Юр. адрес: 123022, Москва, ул. Строителей, д. 15</div>
              <div>ИНН 7701234567 · КПП 770101001 · ОГРН 1234567890123</div>
              <div>График работы: пн–пт, 09:00–19:00</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Документы</div>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-blue-700">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Социальные сети</div>
            <ul className="space-y-2">
              <li>
                <a href="https://t.me/stroyalliance" className="hover:text-blue-700" title="Telegram: @stroyalliance">
                  Telegram
                </a>
              </li>
              <li>
                <a href="https://vk.com/stroyalliance" className="hover:text-blue-700" title="VK: vk.com/stroyalliance">
                  ВКонтакте
                </a>
              </li>
              <li>
                <a href="https://rutube.ru/channel/stroyalliance" className="hover:text-blue-700" title="RuTube: stroyalliance">
                  RuTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 text-xs text-slate-500">
          © 2025 Группа компаний «Строй Альянс». Все права защищены.
        </div>
      </div>
    </footer>
  );
}
