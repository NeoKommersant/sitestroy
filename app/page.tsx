
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  alt: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

type DirectionCard = {
  slug: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  href: string;
};

type ClientCase = {
  id: string;
  name: string;
  sector: string;
  summary: string;
  image: string;
  logo: string;
  alt: string;
  details: string[];
  link?: string;
};

type CertificateCard = {
  id: string;
  title: string;
  number: string;
  issuedBy: string;
  validTill: string;
  image: string;
  alt: string;
  scope: string[];
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "welcome",
    title: "ГК «Строй Альянс»",
    subtitle: "Строим инфраструктуру под ключ",
    description:
      "Комплексные поставки, инжиниринг и сопровождение для промышленных, муниципальных и энергетических объектов по всей России.",
    image: "/img/hero/slide-1\.svg",
    alt: "Инженеры обсуждают проект модернизации инфраструктуры",
    primaryCta: { label: "Связаться с менеджером", href: "#contacts" },
    secondaryCta: { label: "Каталог решений", href: "/catalog" },
  },
  {
    id: "materials",
    title: "Каталог строительных материалов",
    subtitle: "Интеллектуальный подбор номенклатуры",
    description:
      "Системы водоснабжения, водоотведения, газоснабжения и электротехнические решения из одного окна. Умный поиск и фильтрация по параметрам.",
    image: "/img/hero/slide-2\.svg",
    alt: "Склад строительных материалов с металлопрокатом и трубами",
    primaryCta: { label: "Прислать заявку/проект", href: "/catalog/request" },
    secondaryCta: { label: "Смотреть категории", href: "/catalog" },
  },
  {
    id: "services",
    title: "Каталог услуг",
    subtitle: "Полный цикл работ",
    description:
      "Проектирование, строительно-монтажные и пусконаладочные работы, технический надзор и сервис. Формируем под проект команду и график.",
    image: "/img/hero/slide-3\.svg",
    alt: "Монтажная бригада устанавливает инженерные сети на объекте",
    primaryCta: { label: "Выбрать услугу", href: "/services" },
  },
  {
    id: "clients",
    title: "Наши клиенты",
    subtitle: "Опыт в B2B и B2G проектах",
    description:
      "Госкорпорации, девелоперы, ресурсоснабжающие организации и промышленные предприятия. Поставляем и строим для лидеров отрасли.",
    image: "/img/hero/slide-4\.svg",
    alt: "Представители компании и клиентов на строительной площадке",
    primaryCta: { label: "Кейсы клиентов", href: "/clients" },
  },
];

const PRODUCT_DIRECTIONS: DirectionCard[] = [
  {
    slug: "vodosnabzhenie",
    title: "Водоснабжение",
    description:
      "Насосные станции, модульные узлы, запорная арматура, диспетчеризация. Обеспечиваем непрерывную подачу и учет воды.",
    image: "/img/products/vodosnabzhenie\.svg",
    alt: "Промышленное оборудование системы водоснабжения",
    href: "/catalog/vodosnabzhenie",
  },
  {
    slug: "vodootvedenie",
    title: "Водоотведение",
    description:
      "Гравитационные и напорные трубопроводы, КНС, очистные сооружения. Решения для коммунальных и промышленных систем.",
    image: "/img/products/vodootvedenie\.svg",
    alt: "Коллектор системы водоотведения на строительной площадке",
    href: "/catalog/vodootvedenie",
  },
  {
    slug: "gazosnabzhenie",
    title: "Газоснабжение",
    description:
      "Трубы и комплектующие, ГРП/ГРПШ, КИПиА, катодная защита. Поставки под требования Ростехнадзора и Газпром.",
    image: "/img/products/gazosnabzhenie\.svg",
    alt: "Газораспределительный пункт и трубопровод",
    href: "/catalog/gazosnabzhenie",
  },
  {
    slug: "elektrosnabzhenie",
    title: "Электроснабжение",
    description:
      "КТП, РУ, кабельная продукция, освещение. Соблюдаем стандарты ПАО «Россети», Мосэнергосбыт и крупных промышленных клиентов.",
    image: "/img/products/elektrosnabzhenie\.svg",
    alt: "Электротехническое оборудование подстанции",
    href: "/catalog/elektrosnabzhenie",
  },
  {
    slug: "obshhestroj",
    title: "Общестроительные материалы",
    description:
      "Металлопрокат, инертные материалы, ЖБИ, сухие смеси. Организуем поставки Just-in-Time на площадку.",
    image: "/img/products/obshhestroitelnye-materialy\.svg",
    alt: "Склад общестроительных материалов и металлопроката",
    href: "/catalog/obshhestroitelnye-materialy",
  },
  {
    slug: "spectekhnika",
    title: "Спецтехника",
    description:
      "Автокраны, экскаваторы, погрузчики, бетононасосы. Аренда с экипажем, топливной логистикой и круглосуточным сервисом.",
    image: "/img/products/spectekhnika\.svg",
    alt: "Спецтехника компании на строительном объекте",
    href: "/catalog/spectekhnika",
  },
];

const SERVICE_DIRECTIONS: DirectionCard[] = [
  {
    slug: "stroitelnye-raboty",
    title: "Строительно-монтажные работы",
    description:
      "От подготовительного периода до пусконаладки. Собственные бригады, ПТО и техника.",
    image: "/img/services/stroitelnye-raboty\.svg",
    alt: "Монтаж инженерных сетей на объекте",
    href: "/services/stroitelnye-montazhnye",
  },
  {
    slug: "proektnye-izyskatelnye",
    title: "Проектно-изыскательные работы",
    description:
      "Обследование, ПИР, BIM-моделирование, согласования. Управление проектом в единой среде данных.",
    image: "/img/services/proektnye\.svg",
    alt: "Инженер проектирует инфраструктуру на компьютере",
    href: "/services/proektnye",
  },
  {
    slug: "puskonaladochnye",
    title: "Пусконаладочные работы",
    description:
      "Комплексная настройка оборудования, испытания, обучение персонала. Гарантийное обслуживание.",
    image: "/img/services/puskonaladochnye\.svg",
    alt: "Специалист контролирует пусконаладку оборудования",
    href: "/services/puskonaladochnye",
  },
  {
    slug: "avtorskiy-nadzor",
    title: "Авторский и технический надзор",
    description:
      "Контроль качества строительства, управление изменениями, ведение исполнительной документации.",
    image: "/img/services/nadzor\.svg",
    alt: "Инженеры проводят технический надзор на площадке",
    href: "/services/nadzor",
  },
  {
    slug: "logistika",
    title: "Логистика и доставка",
    description:
      "Маршрутизация, складирование, контроль сроков и качества. Собственный парк и партнеры федерального уровня.",
    image: "/img/services/logistika\.svg",
    alt: "Колонна грузовиков на трассе в направлении строительного объекта",
    href: "/services/logistika",
  },
  {
    slug: "arenda-spectekhniki",
    title: "Аренда спецтехники",
    description:
      "Доступ к техпарку 24/7, вахтовые бригады, сервисное сопровождение и страхование.",
    image: "/img/services/arenda-spectekhniki\.svg",
    alt: "Парк спецтехники компании на базе",
    href: "/services/arenda",
  },
];

const CLIENT_CASES: ClientCase[] = [
  {
    id: "rosvodokanal",
    name: "Росводоканал",
    sector: "ЖКХ / Водоснабжение",
    summary: "Модернизация водоочистных сооружений в трёх регионах.",
    image: "/img/clients/rosvodokanal-bg\.svg",
    logo: "/img/clients/rosvodokanal-logo.svg",
    alt: "Команда на объекте Росводоканала",
    details: [
      "Поставка насосного оборудования и труб ПНД под ключ.",
      "Инжиниринг и авторский надзор за монтажом фильтровальных станций.",
      "Сервисное обслуживание и обучение дежурного персонала.",
    ],
    link: "https://rosvodokanal.ru",
  },
  {
    id: "mosoblvodokanal",
    name: "МосОблВодоканал",
    sector: "Госзаказ / ЖКХ",
    summary: "Комплекс поставок для реконструкции канализационных сетей.",
    image: "/img/clients/mosoblvodokanal-bg\.svg",
    logo: "/img/clients/mosoblvodokanal-logo.svg",
    alt: "Строительство канализационных сетей",
    details: [
      "Поставили более 12 км труб ПВХ и напорных трубопроводов.",
      "Организовали логистику с ночными окнами и временным складским хранением.",
      "Согласовали комплект исполнительной документации с надзором.",
    ],
  },
  {
    id: "moscow-metro",
    name: "Московский метрополитен",
    sector: "Транспорт / B2G",
    summary: "Инженерные сети и спецтехника для строительства БКЛ.",
    image: "/img/clients/mosmetro-bg\.svg",
    logo: "/img/clients/mosmetro-logo.svg",
    alt: "Тоннель метро в процессе строительства",
    details: [
      "Поставка кабельных линий, силовых щитов и шкафов автоматики.",
      "Аренда спецтехники с круглосуточным сервисом и диспетчеризацией.",
      "Система контроля качества и технадзор, интеграция с BIM-моделью.",
    ],
    link: "https://www.mosmetro.ru",
  },
  {
    id: "novatek",
    name: "НОВАТЭК",
    sector: "Промышленность / Нефтегаз",
    summary: "Газовые сети для технологических линий и объектов ВСП.",
    image: "/img/clients/novatek-bg\.svg",
    logo: "/img/clients/novatek-logo.svg",
    alt: "Газовая инфраструктура на промышленной площадке",
    details: [
      "Поставили оборудование ГРП и узлов учета с резервированием.",
      "Организовали поставку металлоконструкций и труб из нержавейки.",
      "Провели пусконаладку и авторский надзор, обучили оперативный персонал.",
    ],
    link: "https://www.novatek.ru",
  },
];

const CERTIFICATES: CertificateCard[] = [
  {
    id: "sro-stroy",
    title: "СРО на строительно-монтажные работы",
    number: "№ СРО-С-123-2025",
    issuedBy: "СРО «ИнжСтройАльянс»",
    validTill: "до 12.05.2026",
    image: "/img/certificates/sro-stroy\.svg",
    alt: "СРО на строительно-монтажные работы",
    scope: [
      "Объекты капитального строительства, включая особо опасные и технически сложные.",
      "Работы по монтажу инженерных систем, сварка трубопроводов, монтаж КИПиА.",
    ],
  },
  {
    id: "sro-proekt",
    title: "СРО на проектные работы",
    number: "№ СРО-П-078-2025",
    issuedBy: "СРО «ПроектИнжиниринг»",
    validTill: "до 18.09.2026",
    image: "/img/certificates/sro-proekt\.svg",
    alt: "СРО на проектные и изыскательские работы",
    scope: [
      "Проектирование инженерных коммуникаций и систем водоподготовки.",
      "Генеральное проектирование, авторский контроль, BIM-координация.",
    ],
  },
  {
    id: "iso-9001",
    title: "Сертификат ISO 9001:2015",
    number: "RU-ISO-9001-4580",
    issuedBy: "Bureau Veritas Certification",
    validTill: "до 01.03.2027",
    image: "/img/certificates/iso-9001\.svg",
    alt: "Сертификат системы менеджмента качества ISO 9001",
    scope: [
      "Поставка строительных материалов и инженерного оборудования.",
      "Организация строительных и монтажных работ.",
    ],
  },
  {
    id: "iso-14001",
    title: "Сертификат ISO 14001:2016",
    number: "RU-ISO-14001-1120",
    issuedBy: "TUV Rheinland",
    validTill: "до 30.11.2026",
    image: "/img/certificates/iso-14001\.svg",
    alt: "Сертификат системы экологического менеджмента ISO 14001",
    scope: [
      "Экологическое сопровождение проектов строительства и эксплуатации.",
      "Управление отходами и мониторинг воздействия на окружающую среду.",
    ],
  },
  {
    id: "rostekhnadzor",
    title: "Допуск Ростехнадзора",
    number: "№ 77-Д-985/2025",
    issuedBy: "Ростехнадзор",
    validTill: "до 14.02.2027",
    image: "/img/certificates/rostekhnadzor\.svg",
    alt: "Допуск Ростехнадзора на опасные производственные объекты",
    scope: [
      "Работы на опасных производственных объектах нефтегазовой отрасли.",
      "Строительство и реконструкция резервуарных парков и сетей ВСП.",
    ],
  },
];

const CONTACT_CHANNELS = [
  { label: "Telegram", href: "https://t.me/stroyalliance", icon: "/img/icons/telegram.svg" },
  { label: "WhatsApp", href: "https://wa.me/79991234567", icon: "/img/icons/whatsapp.svg" },
  { label: "Viber", href: "viber://chat?number=+79991234567", icon: "/img/icons/viber.svg" },
  { label: "VK", href: "https://vk.com/stroyalliance", icon: "/img/icons/vk.svg" },
  { label: "YouTube", href: "https://www.youtube.com/@stroyalliance", icon: "/img/icons/youtube.svg" },
];

const CONTACT_PERSONS = [
  {
    name: "Антон Петров",
    role: "Коммерческий директор",
    phone: "+7 (495) 123-45-67",
    email: "a.petrov@stroyalliance.ru",
  },
  {
    name: "Мария Кузнецова",
    role: "Руководитель тендерного отдела",
    phone: "+7 (985) 222-33-44",
    email: "m.kuznetsova@stroyalliance.ru",
  },
  {
    name: "Дмитрий Волков",
    role: "Директор по проектам",
    phone: "+7 (916) 555-77-99",
    email: "d.volkov@stroyalliance.ru",
  },
];
const HERO_HEIGHT_CLASS = "aspect-[16/9] min-h-[360px]";

function Modal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/70" onClick={onClose} aria-hidden="true" />
      <div className="relative flex min-h-full items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Закрыть модальное окно"
          >
            ×
          </button>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedClient, setSelectedClient] = useState<ClientCase | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateCard | null>(null);

  const clientsScrollerRef = useRef<HTMLDivElement>(null);
  const certificatesScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hasModal = Boolean(selectedClient || selectedCertificate);
    if (!hasModal) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedClient, selectedCertificate]);

  const scrollBy = (ref: RefObject<HTMLDivElement>, direction: "prev" | "next") => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const offset = direction === "next" ? node.clientWidth : -node.clientWidth;
    node.scrollBy({ left: offset, behavior: "smooth" });
  };
  return (
    <div className="mx-auto max-w-7xl space-y-24 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <section className="pt-4" aria-label="Промо-блок компании">
        <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 text-white ${HERO_HEIGHT_CLASS}`}>
          {HERO_SLIDES.map((slide, index) => (
            <article
              key={slide.id}
              className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-700 ease-out ${
                index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image src={slide.image} alt={slide.alt} fill priority={index === activeSlide} className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/30 to-slate-900/20" />
              <div className="relative z-10 flex flex-col gap-6 p-8 sm:p-12 lg:p-16">
                <div className="space-y-2">
                  <div className="text-sm uppercase tracking-[0.32em] text-slate-200">{slide.subtitle}</div>
                  <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">{slide.title}</h1>
                </div>
                <p className="max-w-3xl text-base leading-relaxed text-slate-100 sm:text-lg">{slide.description}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={slide.primaryCta.href}
                    className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500"
                  >
                    {slide.primaryCta.label}
                  </Link>
                  {slide.secondaryCta && (
                    <Link
                      href={slide.secondaryCta.href}
                      className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white"
                    >
                      {slide.secondaryCta.label}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Показать слайд «${slide.title}»`}
                aria-pressed={index === activeSlide}
                className={`h-2 w-10 rounded-full transition ${index === activeSlide ? "bg-blue-600" : "bg-slate-200 hover:bg-slate-300"}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Предыдущий слайд"
              onClick={() => setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            >
              &lt;
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Следующий слайд"
              onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            >
              &gt;
            </button>
          </div>
        </div>
      </section>
      <section aria-labelledby="products">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 id="products" className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Услуги и продукция
            </h2>
            <p className="max-w-2xl text-base text-slate-600">
              Поставляем инженерные системы, материалы и оборудование для B2B и B2G проектов. Отгружаем со складов по всей России и берем
              на себя логистику и комплектацию.
            </p>
          </div>
          <Link href="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-600">
            Перейти в каталог →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_DIRECTIONS.map((direction) => (
            <Link
              key={direction.slug}
              href={direction.href}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={direction.image}
                  alt={direction.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent transition duration-300 group-hover:from-slate-900/60" />
                <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 text-white">
                  <div className="text-sm uppercase tracking-[0.24em] text-slate-200/80">B2B · B2G</div>
                  <h3 className="text-xl font-semibold">{direction.title}</h3>
                  <p className="hidden text-sm leading-relaxed text-slate-100 md:block md:opacity-0 md:transition md:duration-300 md:group-hover:opacity-100">
                    {direction.description}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 md:hidden">{direction.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="services">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 id="services" className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Услуги
            </h2>
            <p className="max-w-2xl text-base text-slate-600">
              Формируем полный комплекс услуг — от проектирования и получения разрешений до ввода объектов в эксплуатацию и дальнейшего
              сопровождения.
            </p>
          </div>
          <Link href="/services" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-600">
            Все услуги →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_DIRECTIONS.map((service) => (
            <Link
              key={service.slug}
              href={service.href}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent transition duration-300 group-hover:from-slate-900/60" />
                <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 text-white">
                  <div className="text-sm uppercase tracking-[0.24em] text-slate-200/80">Комплекс работ</div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="hidden text-sm leading-relaxed text-slate-100 md:block md:opacity-0 md:transition md:duration-300 md:group-hover:opacity-100">
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 md:hidden">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="clients">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 id="clients" className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Наши клиенты
            </h2>
            <p className="max-w-2xl text-base text-slate-600">
              Поставляем и реализуем проекты для крупнейших ресурсоснабжающих организаций, госструктур и индустриальных холдингов.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Показать предыдущие кейсы"
              onClick={() => scrollBy(clientsScrollerRef, "prev")}
            >
              &lt;
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Показать следующие кейсы"
              onClick={() => scrollBy(clientsScrollerRef, "next")}
            >
              &gt;
            </button>
          </div>
        </div>
        <div ref={clientsScrollerRef} className="mt-6 flex gap-4 overflow-x-auto pb-2 pe-4 ps-1 no-scrollbar">
          {CLIENT_CASES.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => setSelectedClient(client)}
              className="group relative h-80 w-[280px] flex-shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Image src={client.image} alt={client.alt} fill className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Image src={client.logo} alt={`Логотип ${client.name}`} width={48} height={48} className="rounded-full border border-white/30 bg-white/10 p-2" />
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-200">{client.sector}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{client.name}</div>
                  <p className="text-sm text-slate-200">{client.summary}</p>
                </div>
                <div className="text-xs text-blue-200">Подробнее</div>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section aria-labelledby="certificates">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <h2 id="certificates" className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Допуски и сертификаты
            </h2>
            <p className="max-w-2xl text-base text-slate-600">
              Подтверждаем соответствие требованиям Ростехнадзора, крупнейших госкорпораций и международных стандартов менеджмента.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Показать предыдущие сертификаты"
              onClick={() => scrollBy(certificatesScrollerRef, "prev")}
            >
              &lt;
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Показать следующие сертификаты"
              onClick={() => scrollBy(certificatesScrollerRef, "next")}
            >
              &gt;
            </button>
          </div>
        </div>
        <div ref={certificatesScrollerRef} className="mt-6 flex gap-4 overflow-x-auto pb-2 pe-4 ps-1 no-scrollbar">
          {CERTIFICATES.map((cert) => (
            <button
              key={cert.id}
              type="button"
              onClick={() => setSelectedCertificate(cert)}
              className="group relative h-80 w-[260px] flex-shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Image src={cert.image} alt={cert.alt} fill className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 text-white">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-200">Сертификация</div>
                <div className="text-lg font-semibold leading-tight">{cert.title}</div>
                <div className="text-sm text-slate-200">{cert.number}</div>
                <div className="text-xs text-blue-200">Подробнее</div>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section id="contacts" aria-labelledby="contacts-title" className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-12">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <h2 id="contacts-title" className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Контакты
              </h2>
              <p className="max-w-xl text-base text-slate-600">
                Расскажите о проекте, и мы предложим готовое решение, сроки и бюджет. Работает круглосуточная диспетчерская и единый
                контактный центр.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm uppercase tracking-[0.3em] text-slate-500">Головной офис</div>
                <div className="text-lg font-semibold text-slate-900">123022, Москва, ул. Строителей, д. 15, к. 3</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {CONTACT_PERSONS.map((person) => (
                  <div key={person.email} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{person.role}</div>
                    <div className="text-base font-semibold text-slate-900">{person.name}</div>
                    <div className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
                      <a href={`tel:${person.phone.replace(/[^+\d]/g, "")}`} className="hover:text-blue-700">
                        {person.phone}
                      </a>
                      <a href={`mailto:${person.email}`} className="hover:text-blue-700">
                        {person.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {CONTACT_CHANNELS.map((channel) => (
                  <a
                    key={channel.label}
                    href={channel.href}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-700"
                    aria-label={channel.label}
                  >
                    <Image src={channel.icon} alt={channel.label} width={18} height={18} />
                    <span>{channel.label}</span>
                  </a>
                ))}
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4 text-sm text-slate-600">
                Юридический адрес: 123022, Москва, ул. Строителей, д. 15, оф. 402 · ОГРН 1234567890123 · ИНН 7701234567 · КПП 770101001 · Режим работы: пн–пт, 09:00–19:00.
              </div>
            </div>
          </div>
          <div className="flex-1 rounded-3xl border border-white bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">По вопросам сотрудничества</h3>
              <p className="text-sm text-slate-600">
                Заполните форму, и мы свяжемся с вами в течение одного рабочего дня. Можно приложить спецификацию или техническое задание.
              </p>
              <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
                <div>
                  <label htmlFor="contact-name" className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Имя
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Как к вам обращаться?"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-phone" className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Телефон
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      required
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      E-mail
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      placeholder="business@company.ru"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Что требуется
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Коротко опишите проект, сроки, локацию, требования."
                  />
                </div>
                <div>
                  <label htmlFor="contact-file" className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Спецификация или ТЗ (опционально)
                  </label>
                  <input
                    id="contact-file"
                    name="file"
                    type="file"
                    className="mt-1 w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500"
                >
                  Отправить заявку
                </button>
                <p className="text-xs text-slate-500">
                  Нажимая «Отправить», вы соглашаетесь с{" "}
                  <Link href="/policy" className="text-blue-700 hover:text-blue-800">
                    политикой обработки персональных данных
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200">
          <Image src="/img/contacts/map\.svg" alt="Схема проезда в офис ГК «Строй Альянс»" width={1600} height={600} className="h-72 w-full object-cover" />
        </div>
      </section>
      {selectedClient && (
        <Modal title={`Кейс: ${selectedClient.name}`} onClose={() => setSelectedClient(null)}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:w-52">
              <Image src={selectedClient.image} alt={selectedClient.alt} fill className="object-cover" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Image src={selectedClient.logo} alt={`Логотип ${selectedClient.name}`} width={56} height={56} className="rounded-full border border-slate-200 bg-white p-2" />
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{selectedClient.sector}</div>
                  <div className="text-base font-semibold text-slate-900">{selectedClient.name}</div>
                </div>
              </div>
              <p className="text-sm text-slate-600">{selectedClient.summary}</p>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                {selectedClient.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              {selectedClient.link && (
                <a href={selectedClient.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-600">
                  Перейти на сайт клиента →
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      {selectedCertificate && (
        <Modal title={selectedCertificate.title} onClose={() => setSelectedCertificate(null)}>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl sm:w-48">
              <Image src={selectedCertificate.image} alt={selectedCertificate.alt} fill className="object-cover" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="text-sm font-semibold text-slate-900">{selectedCertificate.number}</div>
              <div className="text-sm text-slate-600">
                Выдано: {selectedCertificate.issuedBy} · Срок действия: {selectedCertificate.validTill}
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                {selectedCertificate.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
