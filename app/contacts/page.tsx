import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты — ГК «Строй Альянс»",
  description:
    "Единый контакт-центр ГК «Строй Альянс»: телефоны отделов, электронная почта, юридический адрес, режим работы и форма обратной связи.",
  alternates: { canonical: "/contacts" },
};

const CONTACTS = [
  { role: "Коммерческий директор", name: "Антон Петров", phone: "+7 (495) 123-45-67", email: "a.petrov@stroyalliance.ru" },
  { role: "Тендерный отдел", name: "Мария Кузнецова", phone: "+7 (985) 222-33-44", email: "m.kuznetsova@stroyalliance.ru" },
  { role: "Директор по проектам", name: "Дмитрий Волков", phone: "+7 (916) 555-77-99", email: "d.volkov@stroyalliance.ru" },
];

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Связаться с нами</h1>
        <p className="text-base text-slate-600">
          Расскажите о проекте — подготовим спецификацию, коммерческое предложение и график поставок. Работаем по всей России, поддерживаем
          заказчиков в формате 24/7.
        </p>
      </div>
      <div className="mt-10 space-y-6">
        <section className="space-y-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Контакт-центр</h2>
          <p className="text-sm text-slate-600">
            Единый номер:{" "}
            <a href="tel:+74951234567" className="font-semibold text-blue-700 hover:text-blue-600">
              +7 (495) 123-45-67
            </a>
            . Эл. почта:{" "}
            <a href="mailto:info@stroyalliance.ru" className="font-semibold text-blue-700 hover:text-blue-600">
              info@stroyalliance.ru
            </a>
          </p>
          <p className="text-sm text-slate-600">
            Юридический адрес: 123022, Москва, ул. Строителей, д. 15, оф. 402. Режим работы: пн–пт, 09:00–19:00, без обеденного перерыва.
          </p>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          {CONTACTS.map((person) => (
            <div key={person.email} className="space-y-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">{person.role}</div>
              <div className="text-base font-semibold text-slate-900">{person.name}</div>
              <div className="flex flex-col text-sm text-slate-600">
                <a href={`tel:${person.phone.replace(/[^+\d]/g, "")}`} className="hover:text-blue-700">
                  {person.phone}
                </a>
                <a href={`mailto:${person.email}`} className="hover:text-blue-700">
                  {person.email}
                </a>
              </div>
            </div>
          ))}
        </section>
        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Форма обратной связи</h2>
          <form className="grid gap-3 sm:grid-cols-2" action="/contacts" method="post">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Имя и компания"
              required
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Телефон или e-mail"
              required
            />
            <textarea
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:col-span-2"
              rows={4}
              placeholder="Опишите задачу, объект, сроки. Прикрепите ссылку на документацию, если нужно."
            />
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500 sm:col-span-2"
            >
              Отправить сообщение
            </button>
          </form>
          <p className="text-xs text-slate-500">
            Отправляя форму, вы соглашаетесь с{" "}
            <a href="/policy" className="text-blue-700 hover:text-blue-800">
              политикой обработки персональных данных
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
