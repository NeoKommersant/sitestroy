import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Допуски и сертификаты — ГК «Строй Альянс»",
  description:
    "СРО на строительно-монтажные и проектные работы, сертификаты ISO 9001/14001, допуски Ростехнадзора. Документы для участия в тендерах и проектных работах.",
  alternates: { canonical: "/certificates" },
};

const CERTS = [
  {
    title: "СРО на строительно-монтажные работы",
    number: "№ СРО-С-123-2025",
    details: "Разрешает выполнять работы на объектах капитального строительства, включая особо опасные и технически сложные.",
  },
  {
    title: "СРО на проектирование",
    number: "№ СРО-П-078-2025",
    details: "Проектирование инженерных систем, разработка рабочей документации, сопровождение экспертизы.",
  },
  {
    title: "ISO 9001:2015",
    number: "RU-ISO-9001-4580",
    details: "Система менеджмента качества поставок и строительно-монтажных работ.",
  },
  {
    title: "ISO 14001:2016",
    number: "RU-ISO-14001-1120",
    details: "Экологический менеджмент и контроль воздействия на окружающую среду.",
  },
  {
    title: "Допуск Ростехнадзора",
    number: "№ 77-Д-985/2025",
    details: "Работы на опасных производственных объектах нефтегазовой отрасли, резервуарных парках и сетях.",
  },
];

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Допуски и сертификаты</h1>
        <p className="text-base text-slate-600">
          Документы подтверждают опыт и соответствие требованиям заказчиков: Ростехнадзор, крупнейшие госкорпорации и международные
          стандарты менеджмента. Полные копии предоставляем по запросу в рамках тендеров и коммерческих предложений.
        </p>
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {CERTS.map((cert) => (
          <div key={cert.number} className="space-y-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">Документ</div>
            <h2 className="text-lg font-semibold text-slate-900">{cert.title}</h2>
            <div className="text-sm text-slate-500">{cert.number}</div>
            <p className="text-sm text-slate-600">{cert.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
