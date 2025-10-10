import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Клиенты и партнеры — ГК «Строй Альянс»",
  description:
    "Опыт реализации проектов для муниципальных предприятий, госкорпораций и крупных промышленных заказчиков: водоснабжение, газ, энергетика, метро.",
  alternates: { canonical: "/clients" },
};

const CASES = [
  {
    customer: "Росводоканал",
    scope: "Модернизация водоочистных сооружений и насосных станций в трёх регионах РФ.",
    result: "Сокращение потерь воды на 18 %, внедрение узлов учета и диспетчеризации.",
  },
  {
    customer: "МосОблВодоканал",
    scope: "Поставка труб ПВХ и напорных линий, логистика и складирование в ночные окна.",
    result: "Выполнение графика реконструкции коллектора без остановки транспортного узла.",
  },
  {
    customer: "Московский метрополитен",
    scope: "Комплектация инженерных сетей и аренда спецтехники для строительства БКЛ.",
    result: "Интеграция с BIM, контроль качества и пусконаладка инженерных систем станций.",
  },
  {
    customer: "НОВАТЭК",
    scope: "Газовые сети, ГРП и узлы учета для технологических линий и резервуарных парков.",
    result: "Категория безопасности «А», пусконаладка и обучение оперативного персонала.",
  },
];

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Наши клиенты</h1>
        <p className="text-base text-slate-600">
          Реализуем проекты для ресурсоснабжающих организаций, промышленных холдингов, федеральных подрядчиков и государственных структур.
          Команда сопровождает клиента на всех этапах: от ТЭО до ввода объектов.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {CASES.map((item) => (
          <div key={item.customer} className="h-full space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">{item.customer}</h2>
            <p className="text-sm text-slate-600">{item.scope}</p>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Результат:</span> {item.result}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
