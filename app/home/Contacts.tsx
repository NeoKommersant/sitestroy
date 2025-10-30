"use client";

import Image from "next/image";
import type { ContactChannel, ContactPerson } from "./Data";
import { CONTACT_CHANNELS, CONTACT_PERSONS } from "./Data";
import { EmailCopyLink } from "@/components/ui/EmailCopyLink";

/**
 * Контактная секция: десктопная версия показывает сетку, мобильная — отдельный экран со снап‑скроллом.
 */
export default function Contacts({
  sectionRef,
}: {
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  const contactPersons: ContactPerson[] = CONTACT_PERSONS;
  const contactChannels: ContactChannel[] = CONTACT_CHANNELS;
  const officeAddress = "123022, Москва, ул. Строителей, д. 15, оф. 402";
  const officeSchedule = "пн–пт, 09:00–19:00";
  const officePhone = "+7 (495) 123-45-67";
  const officeEmail = "info@stroyalliance.ru";

  return (
    <section
      ref={sectionRef}
      id="contacts"
      className="relative flex min-h-[100vh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950 max-md:h-dvh max-md:min-h-dvh max-md:flex-none max-md:scroll-mt-0 max-md:snap-start"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="relative z-10 mx-auto flex h-[85vh] w-[85vw] max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-12 text-white shadow-[0_30px_90px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10 lg:py-16 max-md:h-full max-md:w-full max-md:gap-6 max-md:rounded-none max-md:border-none max-md:bg-transparent max-md:px-4 max-md:py-6 max-md:shadow-none">
        <div className="hidden h-full w-full flex-col gap-10 md:flex md:flex-1 lg:flex-row">
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">Контакты</span>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Свяжитесь с нашей командой</h2>
              <p className="mt-4 max-w-xl text-sm text-white/70">
                Выберите специалиста или удобный канал связи. Команда отвечает в рабочее время и держит вас в курсе
                статуса проекта.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {contactPersons.map((person) => (
                <div
                  key={person.email}
                  className="rounded-3xl border border-white/15 bg-white/12 p-5 shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-lg"
                >
                  <p className="text-lg font-semibold text-white">{person.name}</p>
                  <p className="text-sm text-white/70">{person.role}</p>
                  <div className="mt-4 space-y-2 text-sm text-white/75">
                    <a
                      href={`tel:${person.phone.replace(/[^\d+]/g, "")}`}
                      className="block font-semibold text-white hover:text-white/80"
                    >
                      {person.phone}
                    </a>
                    <EmailCopyLink email={person.email} className="font-semibold text-white/80 hover:text-white">
                      {person.email}
                    </EmailCopyLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="flex w-full max-w-md flex-col gap-6">
            <div className="rounded-3xl border border-white/15 bg-white/12 p-6 shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-lg">
              <h3 className="text-xl font-semibold text-white">Мессенджеры</h3>
              <p className="mt-2 text-sm text-white/70">
                Общаемся в популярных каналах, быстро отправляем документы и согласования.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {contactChannels.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                    title={channel.tooltip}
                  >
                    <Image src={channel.icon} alt={channel.label} width={20} height={20} className="h-5 w-5 object-contain" />
                    {channel.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/12 p-6 shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-lg">
              <h3 className="text-xl font-semibold text-white">Офис и реквизиты</h3>
              <p className="mt-3 text-sm text-white/70">
                {officeAddress}. Режим работы: {officeSchedule}.
              </p>
              <div className="mt-4 space-y-2 text-sm font-semibold text-white">
                <a href={`tel:${officePhone.replace(/[^\d+]/g, "")}`} className="block hover:text-white/80">
                  {officePhone}
                </a>
                <EmailCopyLink email={officeEmail}>{officeEmail}</EmailCopyLink>
              </div>
            </div>
          </aside>
        </div>

        <div className="flex h-full flex-col gap-6 md:hidden">
          <header className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">Контакты</span>
            <h2 className="text-2xl font-semibold text-white">Свяжитесь с нашей командой</h2>
            <p className="text-sm text-white/70">
              На мобильном экране мы собрали быстрые действия: позвоните, напишите или откройте карту в один тап.
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${officePhone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
            >
              Позвонить
            </a>
            <EmailCopyLink
              email={officeEmail}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
            >
              Написать
            </EmailCopyLink>
            <a
              href="https://yandex.ru/maps/?text=123022%2C%20%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%A1%D1%82%D1%80%D0%BE%D0%B8%D1%82%D0%B5%D0%BB%D0%B5%D0%B9%2C%20%D0%B4.%2015"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
            >
              Адрес
            </a>
            <a
              href="#mobile-messengers"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
            >
              Мессенджеры
            </a>
          </div>

          <div id="mobile-messengers" className="flex snap-x gap-3 overflow-x-auto pb-1">
            {contactChannels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                title={channel.tooltip}
              >
                <Image src={channel.icon} alt={channel.label} width={18} height={18} className="h-4 w-4 object-contain" />
                {channel.label}
              </a>
            ))}
          </div>

          <div className="space-y-3">
            <details className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white/80 transition">
              <summary className="cursor-pointer text-base font-semibold text-white">Команда</summary>
              <div className="mt-3 space-y-3 text-sm">
                {contactPersons.map((person) => (
                  <div key={person.email} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-base font-semibold text-white">{person.name}</p>
                    <p className="text-xs text-white/70">{person.role}</p>
                    <div className="mt-3 space-y-1.5">
                      <a href={`tel:${person.phone.replace(/[^\d+]/g, "")}`} className="block text-sm font-semibold text-white/90">
                        {person.phone}
                      </a>
                      <EmailCopyLink email={person.email} className="text-sm font-semibold text-white/80">
                        {person.email}
                      </EmailCopyLink>
                    </div>
                  </div>
                ))}
              </div>
            </details>
            <details className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white/80 transition">
              <summary className="cursor-pointer text-base font-semibold text-white">Реквизиты и режим</summary>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-white/80">{officeAddress}</p>
                <p className="text-white/70">Режим работы: {officeSchedule}</p>
                <a href={`tel:${officePhone.replace(/[^\d+]/g, "")}`} className="block font-semibold text-white">
                  {officePhone}
                </a>
                <EmailCopyLink email={officeEmail} className="font-semibold text-white/80">
                  {officeEmail}
                </EmailCopyLink>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
