"use client";

import Image from "next/image";
import type { ContactChannel, ContactPerson } from "./Data";
import { CONTACT_CHANNELS, CONTACT_PERSONS } from "./Data";
import { EmailCopyLink } from "@/components/ui/EmailCopyLink";

/**
 * Компонент секции «Контакты». Отображает контактных лиц,
 * каналы связи и отдельную карточку для связи с руководством.
 */
export default function Contacts({
  sectionRef,
}: {
  sectionRef?: (node: HTMLElement | null) => void;
}) {
  const contactPersons: ContactPerson[] = CONTACT_PERSONS;
  const contactChannels: ContactChannel[] = CONTACT_CHANNELS;
  return (
    <section
      ref={sectionRef}
      id="contacts"
      className="relative flex min-h-[100vh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="relative z-10 mx-auto flex h-[85vh] w-[85vw] max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-12 text-white shadow-[0_30px_90px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10 lg:py-16">
        <div className="flex flex-1 flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">Контакты</span>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Свяжитесь с нашей командой</h2>
              <p className="mt-4 max-w-xl text-sm text-white/70">
                Выберите профильного менеджера или удобный канал связи. Мы ответим в рабочее время и подключим инженеров по вашему вопросу.
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
              <h3 className="text-xl font-semibold text-white">Мы в мессенджерах</h3>
              <p className="mt-2 text-sm text-white/70">Ответим в течение рабочего часа.</p>
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
              <h3 className="text-xl font-semibold text-white">Прямая связь с директором</h3>
              <p className="mt-3 text-sm text-white/70">По вопросам сотрудничества и стратегических проектов.</p>
              <div className="mt-4 space-y-2 text-sm font-semibold text-white">
                <a href="tel:+74951234567" className="block hover:text-white/80">
                  +7 (495) 123-45-67
                </a>
                <EmailCopyLink email="info@stroyalliance.ru">info@stroyalliance.ru</EmailCopyLink>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}