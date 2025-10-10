import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Услуги — ГК «Строй Альянс»",
  description:
    "Комплекс услуг: проектирование, строительно-монтажные и пусконаладочные работы, технадзор, логистика и аренда спецтехники.",
  alternates: { canonical: "/services" },
};

const SERVICES = [
  {
    title: "Проектирование и инженерные изыскания",
    desc: "ПИР, BIM-координация, экспертиза и сопровождение согласований по объектам инженерной инфраструктуры.",
  },
  {
    title: "Строительно-монтажные работы",
    desc: "Монтаж инженерных сетей, строительные и общестроительные работы, внедрение комплексных решений под ключ.",
  },
  {
    title: "Пусконаладка и сервис",
    desc: "Запуск, испытания, настройка автоматизации, обучение персонала и гарантийное обслуживание.",
  },
  {
    title: "Авторский и технический надзор",
    desc: "Контроль качества, ведение исполнительной документации, аудит поставок и смет.",
  },
  {
    title: "Логистика и снабжение",
    desc: "Планирование поставок Just-in-Time, складирование, доставка на объект, управление запасами.",
  },
  {
    title: "Аренда спецтехники",
    desc: "Автокраны, экскаваторы, бетононасосы, подъемники с экипажем и сервисом 24/7.",
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Комплекс услуг</h1>
        <p className="text-base text-slate-600">
          Берем ответственность за проект от идеи до ввода в эксплуатацию. Команда инженеров, проектировщиков, ПТО и снабженцев работает в
          единой среде данных, обеспечивая контроль сроков, бюджета и качества.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {SERVICES.map((service) => (
          <div key={service.title} className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{service.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
