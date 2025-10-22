"use client";

import Image from "next/image";
import Link from "next/link";
import { EmailCopyLink } from "@/components/ui/EmailCopyLink";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";

// --------------------------------------------------------------
// Типы данных и константы для страницы
// --------------------------------------------------------------
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

type ContactChannel = {
  label: string;
  href: string;
  icon: string;
  tooltip: string;
};

type ContactPerson = {
  name: string;
  role: string;
  phone: string;
  email: string;
};

// --------------------------------------------------------------
// Контент главной страницы
// --------------------------------------------------------------
// HERO СЛАЙДЕР
const HERO_SLIDES: HeroSlide[] = [
  {
    id: "welcome",
    title: "ГК «Строй Альянс»",
    subtitle: "Строим инфраструктуру под ключ",
    description:
      "Комплексные поставки, инжиниринг и сопровождение для промышленных, муниципальных и энергетических объектов по всей России.",
    image: "/img/hero/slide-1.png",
    alt: "Инженеры обсуждают проект модернизации инфраструктуры",
    primaryCta: { label: "Связаться с менеджером", href: "#contacts" },
    secondaryCta: { label: "Каталог решений", href: "/catalog" },
  },
  {
    id: "materials",
    title: "Каталог строительных материалов",
    subtitle: "Интеллектуальный подбор номенклатуры",
    description:
      "Вода, газ, электричество, общестроительные материалы и спецтехника — подбираем номенклатуру под проект с умным поиском и фильтрацией.",
    image: "/img/hero/slide-2.png",
    alt: "Склад строительных материалов с металлопрокатом и трубами",
    primaryCta: { label: "Отправить спецификацию", href: "/catalog/request" },
    secondaryCta: { label: "Смотреть категории", href: "/catalog" },
  },
  {
    id: "services",
    title: "Каталог услуг",
    subtitle: "Полный цикл работ",
    description:
      "Проектирование, строительно-монтажные и пусконаладочные работы, технадзор, логистика и сервис. Формируем команду под задачу.",
    image: "/img/hero/slide-3.webp",
    alt: "Монтажная бригада устанавливает инженерные сети",
    primaryCta: { label: "Выбрать услугу", href: "/services" },
  },
  {
    id: "clients",
    title: "Наши клиенты",
    subtitle: "Опыт в B2B и B2G проектах",
    description:
      "Госкорпорации, ресурсоснабжающие организации, девелоперы и промышленные холдинги. Реализуем проекты по всей стране.",
    image: "/img/hero/slide-4.png",
    alt: "Команда компании и клиента на строительной площадке",
    primaryCta: { label: "Кейсы клиентов", href: "/clients" },
  },
];

const PAGE_SECTIONS = ["hero", "product-directions", "service-directions", "clients", "certificates", "contacts"] as const;
type SectionId = (typeof PAGE_SECTIONS)[number];
// КАТЕГОРИИ МАТЕРИАЛОВ
const PRODUCT_DIRECTIONS: DirectionCard[] = [
    {
    slug: "stroymaterialy",
    title: "Строительные материалы",
    description:
      "Металлопрокат, инертные материалы, ЖБИ и сухие смеси. Организуем поставки Just-in-Time, комплектацию и контроль качества.",
    image: "/img/products/obshhestroitelnye-materialy.webp",
    alt: "Склад строительных материалов и металлоконструкций",
    href: "/catalog?category=stroymaterialy",
  },
  {
    slug: "vodosnabzhenie",
    title: "Водоснабжение",
    description:
      "Насосные станции, узлы учета, запорная арматура и диспетчеризация. Поддерживаем непрерывность и контроль расхода воды.",
    image: "/img/products/vodosnabzhenie.webp",
    alt: "Промышленное оборудование водоснабжения",
    href: "/catalog?category=vodosnabzhenie",
  },
  {
    slug: "vodootvedenie",
    title: "Водоотведение",
    description:
      "Гравитационные и напорные трубопроводы, КНС, очистные сооружения и емкости для коммунальной и промышленной инфраструктуры.",
    image: "/img/products/vodootvedenie.webp",
    alt: "Коллектор системы водоотведения на стройплощадке",
    href: "/catalog?category=vodootvedenie",
  },
  {
    slug: "gazosnabzhenie",
    title: "Газоснабжение",
    description:
      "Полиэтиленовые и стальные трубопроводы, ГРП/ГРПШ, КИПиА и катодная защита под требования Ростехнадзора и Газпрома.",
    image: "/img/products/gazosnabzhenie.webp",
    alt: "Газораспределительный пункт и трубопровод",
    href: "/catalog?category=gazosnabzhenie",
  },
  {
    slug: "elektrosnabzhenie",
    title: "Электроснабжение",
    description:
      "КТП, распределительные устройства, кабельная продукция и освещение. Соответствие стандартам сетевых и промышленных заказчиков.",
    image: "/img/products/elektrosnabzhenie.webp",
    alt: "Электротехническое оборудование подстанции",
    href: "/catalog?category=elektrosnabzhenie",
  },
  {
    slug: "uslugi",
    title: "Услуги",
    description:
      "Доставка материалов по всей России, аренда спецтехники, выполнение СМР и пусконаладка с одним подрядчиком.",
    image: "/img/products/spectekhnika.jpg",
    alt: "Команда инженеров и спецтехника на строительной площадке",
    href: "/catalog?category=uslugi",
  },
];
// КАТЕГОРИИ УСЛУГ
const SERVICE_DIRECTIONS: DirectionCard[] = [
  {
    slug: "stroitelnye-raboty",
    title: "Строительно-монтажные работы",
    description: "От подготовительного периода до ввода объекта. Собственные бригады, ПТО и спецтехника.",
    image: "/img/services/stroitelnye-raboty.jpeg",
    alt: "Монтаж инженерных сетей на объекте",
    href: "/services/stroitelnye-montazhnye",
  },
  {
    slug: "proektnye-izyskatelnye",
    title: "Проектно-изыскательные работы",
    description: "Обследование, ПИР, BIM-координация и сопровождение экспертизы. Ведение проекта в единой среде данных.",
    image: "/img/services/proektnye.jpg",
    alt: "Инженер проектирует инфраструктуру на компьютере",
    href: "/services/proektnye",
  },
  {
    slug: "puskonaladochnye",
    title: "Пусконаладочные работы",
    description: "Настройка оборудования, испытания, обучение персонала и гарантийный сервис.",
    image: "/img/services/puskonaladochnye.jpg",
    alt: "Специалист проводит пусконаладку оборудования",
    href: "/services/puskonaladochnye",
  },
  {
    slug: "avtorskiy-nadzor",
    title: "Авторский и технический надзор",
    description: "Контроль качества, управление изменениями, ведение исполнительной документации.",
    image: "/img/services/nadzor.jpeg",
    alt: "Инженеры проводят технический надзор",
    href: "/services/nadzor",
  },
  {
    slug: "logistika",
    title: "Логистика и снабжение",
    description: "Маршрутизация, складирование, контроль сроков и качества. Собственный парк и федеральные партнёры.",
    image: "/img/services/logistika.jpeg",
    alt: "Колонна грузовиков на трассе",
    href: "/services/logistika",
  },
  {
    slug: "arenda-spectekhniki",
    title: "Аренда спецтехники",
    description: "Техника 24/7, вахтовые бригады, сервисное сопровождение и страхование.",
    image: "/img/services/arenda-spectekhniki.jpg",
    alt: "Парк спецтехники на базе",
    href: "/services/arenda",
  },
];

const CLIENT_CASES: ClientCase[] = [
  {
    id: "rosvodokanal",
    name: "МРИЯ",
    sector: "ГНБ · B2B",
    summary: "Переход методом ГНБ в скальных грунтах.",
    image: "/img/clients/mriya-bg.jpg",
    logo: "/img/clients/mriya-logo.png",
    alt: "Команда на объекте Росводоканала",
    details: [
      "Переход методом ГНБ в скальных грунтах D 300 мм L 270 п.м. Mriya Resot and Spa",
      ".",
      ".",
    ],
    link: "https://mriyaresort.com/",
  },
  {
    id: "mosoblvodokanal",
    name: "ТД ВИПАКС",
    sector: "ПНР · B2G",
    summary: "Работы ПНР по направляениям ЭТО, ТМО, СВС, ВС, и ОВиК.",
    image: "/img/clients/td-bg.jpg",
    logo: "/img/clients/td-logo.png",
    alt: "Строительство канализационных сетей",
    details: [
      "В 2022 ведутся работы ПНР по направлениям ЭТО, ТМО, системам внешней связи, внутриобъектовой связи и ОВиК, плановый срок окончания первого этапа 1й квартал 2023г.",
      "В мае 2022 года проведены ПНР системы внешней связи между Ударной ТЭС и Кубанским РДУ основного и резервного канала.",
      "Пуск ТЭС 2024 год.",
    ],
  },
  {
    id: "moscow-metro",
    name: "ТехноПромЭкспорт",
    sector: "Газоснабжение · B2G",
    summary: "Инженерные системы и спецтехника для строительства Большой кольцевой линии.",
    image: "/img/clients/tpe-bg.png",
    logo: "/img/clients/tpe-logo.png",
    alt: "Тоннель метро в процессе строительства",
    details: [
      "Поставка кабельных линий, силовых щитов и шкафов автоматики.",
      "Аренда спецтехники с круглосуточным сервисом и диспетчеризацией.",
      "Контроль качества, технадзор и интеграция с BIM-моделью проекта.",
    ],
    link: "https://www.mosmetro.ru",
  },
  {
    id: "novatek",
    name: "Вода Крыма",
    sector: "Водоснабжение · B2G",
    summary: "Газовые сети для технологических линий и объектов внешнего снабжения.",
    image: "/img/clients/vodacrimea-bg.jpg",
    logo: "/img/clients/vodacrimea-logo.jpg",
    alt: "Газовая инфраструктура на промышленной площадке",
    details: [
      "Поставка оборудования ГРП и узлов учёта с резервированием.",
      "Металлоконструкции и трубопроводы из нержавейки под требования заказчика.",
      "Пусконаладка, авторский надзор и обучение оперативного персонала.",
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
    image: "/img/certificates/sro-stroy.svg",
    alt: "СРО на строительно-монтажные работы",
    scope: [
      "Объекты капитального строительства, включая особо опасные и технически сложные.",
      "Монтаж инженерных систем, сварка трубопроводов, КИПиА.",
    ],
  },
  {
    id: "sro-proekt",
    title: "СРО на проектные работы",
    number: "№ СРО-П-078-2025",
    issuedBy: "СРО «ПроектИнжиниринг»",
    validTill: "до 18.09.2026",
    image: "/img/certificates/sro-proekt.svg",
    alt: "СРО на проектные работы",
    scope: [
      "Проектирование инженерных коммуникаций и систем водоподготовки.",
      "Авторский контроль, BIM-координация, сопровождение экспертизы.",
    ],
  },
  {
    id: "iso-9001",
    title: "Сертификат ISO 9001:2015",
    number: "RU-ISO-9001-4580",
    issuedBy: "Bureau Veritas Certification",
    validTill: "до 01.03.2027",
    image: "/img/certificates/iso-9001.svg",
    alt: "Сертификат системы менеджмента качества ISO 9001",
    scope: [
      "Менеджмент качества поставок строительных материалов и оборудования.",
      "Организация строительных и монтажных работ.",
    ],
  },
  {
    id: "iso-14001",
    title: "Сертификат ISO 14001:2016",
    number: "RU-ISO-14001-1120",
    issuedBy: "TÜV Rheinland",
    validTill: "до 30.11.2026",
    image: "/img/certificates/iso-14001.svg",
    alt: "Сертификат системы экологического менеджмента ISO 14001",
    scope: [
      "Экологическое сопровождение строительства и эксплуатации объектов.",
      "Управление отходами и мониторинг воздействия на среду.",
    ],
  },
  {
    id: "rostekhnadzor",
    title: "Допуск Ростехнадзора",
    number: "№ 77-Д-985/2025",
    issuedBy: "Ростехнадзор",
    validTill: "до 14.02.2027",
    image: "/img/certificates/rostekhnadzор.svg",
    alt: "Допуск Ростехнадзора на опасные производственные объекты",
    scope: [
      "Работы на опасных производственных объектах нефтегазовой отрасли.",
      "Строительство и реконструкция резервуарных парков и сетей ВСП.",
    ],
  },
];

const CONTACT_CHANNELS: ContactChannel[] = [
  { label: "Telegram", href: "https://t.me/stroyalliance", icon: "/img/icons/telegram.svg", tooltip: "Telegram: @stroyalliance" },
  { label: "WhatsApp", href: "https://wa.me/79991234567", icon: "/img/icons/whatsapp.svg", tooltip: "WhatsApp: +7 (999) 123-45-67" },
  { label: "Viber", href: "viber://chat?number=+79991234567", icon: "/img/icons/viber.svg", tooltip: "Viber: +7 (999) 123-45-67" },
  { label: "VK", href: "https://vk.com/stroyalliance", icon: "/img/icons/vk.svg", tooltip: "VK: vk.com/stroyalliance" },
  { label: "YouTube", href: "https://www.youtube.com/@stroyalliance", icon: "/img/icons/youtube.svg", tooltip: "YouTube: @stroyalliance" },
];

const CONTACT_PERSONS: ContactPerson[] = [
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

// --------------------------------------------------------------
// Хук для горизонтального drag-scroll каруселей
// --------------------------------------------------------------
function useCarousel(length: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWidthRef = useRef(0);
  const pointerState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    pointerId: 0,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateMeasurements = () => {
      const firstCard = container.querySelector<HTMLElement>("[data-carousel-card]");
      if (!firstCard) return;
      const style = window.getComputedStyle(container);
      const gap = parseFloat(style.columnGap || style.gap || "16");
      cardWidthRef.current = firstCard.offsetWidth + gap;
    };

    updateMeasurements();
    const observer = new ResizeObserver(updateMeasurements);
    observer.observe(container);
    return () => observer.disconnect();
  }, [length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!cardWidthRef.current) return;
      const index = Math.round(container.scrollLeft / cardWidthRef.current);
      setActiveIndex(Math.max(0, Math.min(index, length - 1)));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerDown = (event: PointerEvent) => {
      pointerState.current = {
        isDown: true,
        startX: event.clientX,
        scrollLeft: container.scrollLeft,
        pointerId: event.pointerId,
      };
      container.setPointerCapture(event.pointerId);
      setIsDragging(true);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerState.current.isDown) return;
      const dx = event.clientX - pointerState.current.startX;
      container.scrollLeft = pointerState.current.scrollLeft - dx;
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!pointerState.current.isDown) return;
      pointerState.current.isDown = false;
      setIsDragging(false);
      container.releasePointerCapture(event.pointerId);
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
    container.addEventListener("pointerleave", handlePointerUp);
    container.addEventListener("pointercancel", handlePointerUp);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
      container.removeEventListener("pointerleave", handlePointerUp);
      container.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.cursor = isDragging ? "grabbing" : "grab";
  }, [isDragging]);

  const goTo = useCallback(
    (index: number) => {
      const container = containerRef.current;
      if (!container || !cardWidthRef.current) return;
      const safeIndex = Math.max(0, Math.min(index, length - 1));
      container.scrollTo({ left: safeIndex * cardWidthRef.current, behavior: "smooth" });
      setActiveIndex(safeIndex);
    },
    [length],
  );

  return { containerRef, activeIndex, goTo };
}

// --------------------------------------------------------------
// Кнопка возврата к началу страницы
// --------------------------------------------------------------
function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-28 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-[0_10px_30px_rgba(8,15,40,0.45)] backdrop-blur transition hover:border-white/45 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:bottom-12 md:right-12 md:h-auto md:w-auto md:min-w-[3.5rem] md:px-5 md:py-3 md:text-xs md:font-semibold md:uppercase md:tracking-[0.28em]"
      aria-label="Вернуться в начало страницы"
    >
      <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
      </svg>
      <span className="sr-only md:not-sr-only md:ml-2">Вверх</span>
    </button>
  );
}

// Универсальное модальное окно
// --------------------------------------------------------------
function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8"
      onClick={(event) => event.target === overlayRef.current && onClose()}
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          aria-label="Закрыть модальное окно"
        >
          ✕
        </button>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const heroSlides = useMemo(() => HERO_SLIDES, []);
  const directions = useMemo(
    () => ({
      products: PRODUCT_DIRECTIONS,
      services: SERVICE_DIRECTIONS,
    }),
    [],
  );
  const clientCases = useMemo(() => CLIENT_CASES, []);
  const certificates = useMemo(() => CERTIFICATES, []);
  const contactChannels = useMemo(() => CONTACT_CHANNELS, []);
  const contactPersons = useMemo(() => CONTACT_PERSONS, []);

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [selectedCase, setSelectedCase] = useState<ClientCase | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateCard | null>(null);

  const { containerRef: certificatesRef, activeIndex: certificateIndex, goTo: goToCertificate } = useCarousel(certificates.length);

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionCallbacks = useMemo(
    () =>
      PAGE_SECTIONS.map((_, index) => (node: HTMLElement | null) => {
        sectionRefs.current[index] = node;
        if (index === 0) {
          heroSectionRef.current = node;
        }
      }),
    [],
  );
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [peekOffset, setPeekOffset] = useState(0);
  const navigationCooldownRef = useRef(0);
  const peekTimeoutRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const resetPeek = useCallback(() => {
    if (peekTimeoutRef.current) {
      window.clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    setPeekOffset(0);
  }, []);

  const showPeek = useCallback((direction: 1 | -1, duration = 240) => {
    if (peekTimeoutRef.current) {
      window.clearTimeout(peekTimeoutRef.current);
    }
    const offset = direction > 0 ? -32 : 32;
    setPeekOffset(offset);
    peekTimeoutRef.current = window.setTimeout(() => {
      setPeekOffset(0);
      peekTimeoutRef.current = null;
    }, duration);
  }, []);

  const goToSection = useCallback(
    (nextIndex: number) => {
      const sections = sectionRefs.current;
      if (!sections.length) return;
      const clamped = Math.max(0, Math.min(sections.length - 1, nextIndex));
      const target = sections[clamped];
      if (!target) return;
      resetPeek();
      setActiveSectionIndex(clamped);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [resetPeek],
  );

  const triggerNavigation = useCallback(
    (direction: 1 | -1) => {
      const now = Date.now();
      const isDesktop = typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
      const debounce = isDesktop ? 650 : 250;

      if (now - navigationCooldownRef.current < debounce) {
        return;
      }

      navigationCooldownRef.current = now;

      if (isDesktop) {
        showPeek(direction, 260);
        window.setTimeout(() => {
          goToSection(activeSectionIndex + direction);
        }, 160);
      } else {
        resetPeek();
        goToSection(activeSectionIndex + direction);
      }
    },
    [activeSectionIndex, goToSection, resetPeek, showPeek],
  );

  const handleAnchorNavigation = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith("#")) return;
      const id = href.slice(1) as SectionId;
      const index = PAGE_SECTIONS.findIndex((section) => section === id);
      if (index === -1) return;
      event.preventDefault();
      navigationCooldownRef.current = Date.now();
      goToSection(index);
    },
    [goToSection],
  );

  const handleHeroSelect = useCallback(
    (index: number) => {
      if (!heroSlides.length) return;
      const safeIndex = (index + heroSlides.length) % heroSlides.length;
      setActiveHeroIndex(safeIndex);
    },
    [heroSlides.length],
  );

  const swipeState = useRef<{ pointerId: number; startX: number; lastX: number } | null>(null);

  const finalizeSwipe = useCallback(
    (pointerId: number, clientX: number) => {
      const state = swipeState.current;
      if (!state || state.pointerId !== pointerId) {
        return;
      }

      const deltaX = (Number.isFinite(clientX) ? clientX : state.lastX) - state.startX;
      if (Math.abs(deltaX) > 60) {
        handleHeroSelect(activeHeroIndex + (deltaX < 0 ? 1 : -1));
      }

      swipeState.current = null;
    },
    [activeHeroIndex, handleHeroSelect],
  );

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button")) {
      swipeState.current = null;
      return;
    }

    swipeState.current = { pointerId: event.pointerId, startX: event.clientX, lastX: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const state = swipeState.current;
    if (!state || state.pointerId !== event.pointerId) {
      return;
    }

    swipeState.current = { ...state, lastX: event.clientX };
  }, []);

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      finalizeSwipe(event.pointerId, event.clientX);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [finalizeSwipe],
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      swipeState.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [],
  );

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (document.body.style.overflow === "hidden") return;
      if (!sectionRefs.current.length) return;
      if (event.deltaY === 0) return;
      event.preventDefault();
      triggerNavigation((event.deltaY > 0 ? 1 : -1) as 1 | -1);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [triggerNavigation]);

  useEffect(() => {
    const handleSectionKeys = (event: KeyboardEvent) => {
      if (document.body.style.overflow === "hidden") return;
      const activeElement = document.activeElement;
      if (activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        triggerNavigation(1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        triggerNavigation(-1);
      }
    };

    window.addEventListener("keydown", handleSectionKeys);
    return () => window.removeEventListener("keydown", handleSectionKeys);
  }, [triggerNavigation]);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (document.body.style.overflow === "hidden") return;
      const touch = event.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (document.body.style.overflow === "hidden") return;
      if (!touchStartRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      if (Math.abs(dy) <= Math.abs(dx)) {
        return;
      }
      event.preventDefault();
    };

    const finalizeTouch = (event: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = event.changedTouches[0];
      if (!touch) {
        touchStartRef.current = null;
        resetPeek();
        return;
      }
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touchStartRef.current.y - touch.clientY;
      const absDy = Math.abs(dy);
      const absDx = Math.abs(dx);
      touchStartRef.current = null;
      if (absDy < 40 || absDy <= absDx) {
        resetPeek();
        return;
      }
      triggerNavigation((dy > 0 ? 1 : -1) as 1 | -1);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", finalizeTouch);
    window.addEventListener("touchcancel", finalizeTouch);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", finalizeTouch);
      window.removeEventListener("touchcancel", finalizeTouch);
    };
  }, [resetPeek, triggerNavigation]);

  useEffect(() => {
    return () => {
      if (peekTimeoutRef.current) {
        window.clearTimeout(peekTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      const sections = sectionRefs.current;
      if (!sections.length) return;
      const referenceLine = window.scrollY + window.innerHeight / 2;
      let nextIndex = 0;
      sections.forEach((section, index) => {
        if (!section) return;
        if (referenceLine >= section.offsetTop) {
          nextIndex = index;
        }
      });
      setActiveSectionIndex((prev) => (prev === nextIndex ? prev : nextIndex));
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      const activeElement = document.activeElement;
      if (activeElement && ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)) {
        return;
      }

      if (activeSectionIndex !== 0) return;

      event.preventDefault();
      if (event.key === "ArrowLeft") {
        handleHeroSelect(activeHeroIndex - 1);
      } else {
        handleHeroSelect(activeHeroIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [activeHeroIndex, activeSectionIndex, handleHeroSelect]);

  const handleOpenCase = useCallback((clientCase: ClientCase) => {
    setSelectedCase(clientCase);
  }, []);

  const handleOpenCertificate = useCallback((certificate: CertificateCard) => {
    setSelectedCertificate(certificate);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedCase(null);
    setSelectedCertificate(null);
  }, []);

  const peekStyle = peekOffset !== 0 ? { transform: `translateY(${peekOffset}px)` } : undefined;

  return (
    <>
      <main className="space-y-24 pb-24 transition-transform duration-300 ease-out" style={peekStyle}>
        <section
          id="hero"
          ref={sectionCallbacks[0]}
          className="relative isolate flex h-[100dvh] w-screen min-h-[640px] flex-col overflow-hidden select-none -mt-[80px] pt-[80px] md:-mt-[96px] md:pt-[96px]"
        >
          <div
            className="relative h-full w-full touch-pan-y"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {heroSlides.map((slide, index) => {
              const { primaryCta, secondaryCta } = slide;
              const offset = (index - activeHeroIndex) * 100;
              const isActive = index === activeHeroIndex;
              return (
                <div
                  key={slide.id}
                  className="absolute inset-0 flex h-full w-full transform transition-transform duration-500 ease-in-out will-change-transform"
                  style={{ transform: `translateX(${offset}%)` }}
                  aria-hidden={!isActive}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} из ${heroSlides.length}`}
                >
                  <div className="absolute inset-0">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      className="object-cover object-center"
                      sizes="100vw"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-slate-950/40" />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/20 to-slate-950/70" />
                  </div>
                  <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col justify-center gap-6 px-6 py-24 text-white sm:px-10 lg:px-16">
                    <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
                      <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">Строй Альянс</span>
                      <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
                        {slide.title}
                      </h1>
                      <p className="max-w-2xl text-lg text-white/85 sm:text-xl">{slide.subtitle}</p>
                    </div>
                    <p className="mx-auto max-w-3xl text-base leading-relaxed text-white/75 sm:mx-0 sm:text-lg">{slide.description}</p>
                    <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:items-center">
                      {primaryCta && (
                        <Link
                          href={primaryCta.href}
                          onClick={(event) => handleAnchorNavigation(event, primaryCta.href)}
                          className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-white/90 px-8 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 hover:shadow-slate-900/20"
                        >
                          {primaryCta.label}
                        </Link>
                      )}
                      {secondaryCta && (
                        <Link
                          href={secondaryCta.href}
                          onClick={(event) => handleAnchorNavigation(event, secondaryCta.href)}
                          className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 hover:text-white"
                        >
                          {secondaryCta.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {heroSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => handleHeroSelect(activeHeroIndex - 1)}
                aria-label="Предыдущий слайд"
                className="group absolute left-6 bottom-[22%] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-8 sm:bottom-[18%] sm:h-14 sm:w-14 md:bottom-auto md:left-10 md:top-1/2 md:h-16 md:w-16 md:-translate-y-1/2 lg:left-16"
              >
                <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleHeroSelect(activeHeroIndex + 1)}
                aria-label="Следующий слайд"
                className="group absolute right-6 bottom-[22%] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-8 sm:bottom-[18%] sm:h-14 sm:w-14 md:bottom-auto md:right-10 md:top-1/2 md:h-16 md:w-16 md:-translate-y-1/2 lg:right-16"
              >
                <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-2 bottom-[110px] sm:bottom-16 sm:gap-3">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => handleHeroSelect(index)}
                    className={`pointer-events-auto h-1.5 w-8 rounded-full border border-white/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:h-2 sm:w-9 ${activeHeroIndex === index ? "bg-white/90" : "bg-white/20"}`}
                    aria-label={`Перейти к слайду: ${slide.title}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        <section ref={sectionCallbacks[1]} id="product-directions" className="mx-auto max-w-6xl px-6 scroll-mt-32">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between ">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">Продукты</span>
              <h2 className="text-3xl font-semibold text-slate-900">Строительные материалы</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-500">
              Комплексный поиск промышленных материалов и материалов для инфраструктуры с предсказуемыми сроками поставки и строгим контролем качества.
            </p>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {directions.products.map((direction) => (
<Link
  key={direction.slug}
  href={direction.href}
  className="group flex flex-col overflow-hidden rounded-3xl border border-teal-100/20 bg-teal shadow-sm transition hover:-translate-y-1 hover:border-teal-400/20 hover:shadow-xl"
>
  <div className="relative h-50 w-full">
    <Image
      src={direction.image}
      alt={direction.alt}
      fill
      className="object-cover"
      sizes="100vw"
    />
  </div>

  <div className="p-6 flex flex-col gap-2">
    <h3 className="text-lg font-semibold text-slate-900">{direction.title}</h3>
    <p className="text-sm leading-relaxed text-slate-600">{direction.description}</p>
  </div>

  <span className="px-6 pb-6 text-sm font-semibold text-teal-600/50 transition group-hover:text-teal-600">
    Узнать больше
  </span>
</Link>
            ))}
          </div>
        </section>

        <section ref={sectionCallbacks[2]} id="service-directions" className="mx-auto max-w-6xl px-6 scroll-mt-32">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">Услуги</span>
              <h2 className="text-3xl font-semibold text-slate-900">Инженерные компетенции</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-500">
              Команды по поставке оборудования под ключ, которые занимаются проектированием, строительством, вводом в эксплуатацию и эксплуатационной поддержкой сложных объектов.
            </p>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {directions.services.map((direction) => (
<Link
  key={direction.slug}
  href={direction.href}
  className="group flex flex-col overflow-hidden rounded-3xl border border-teal-100/20 bg-teal shadow-sm transition hover:-translate-y-1 hover:border-teal-400/20 hover:shadow-xl"
>
  <div className="relative h-50 w-full">
    <Image
      src={direction.image}
      alt={direction.alt}
      fill
      className="object-cover"
      sizes="100vw"
    />
  </div>

  <div className="p-6 flex flex-col gap-2">
    <h3 className="text-lg font-semibold text-slate-900">{direction.title}</h3>
    <p className="text-sm leading-relaxed text-slate-600">{direction.description}</p>
  </div>

  <span className="px-6 pb-6 text-sm font-semibold text-teal-600/50 transition group-hover:text-teal-600">
    Узнать больше
  </span>
</Link>
            ))}
          </div>
        </section>

        <section ref={sectionCallbacks[3]} id="clients" className="bg-slate-900 py-20 scroll-mt-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">Клиенты</span>
                <h2 className="text-3xl font-semibold text-white">Проделанные работы</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-300">
                Подтвержденный опыт работы в регулируемых отраслях: коммунальные услуги, энергетика, транспорт и крупные инфраструктурные программы.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {clientCases.map((clientCase) => (
                <article key={clientCase.id} className="flex h-full flex-col gap-4 rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-blue-400/60">
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-800">
                    <Image src={clientCase.image} alt={clientCase.alt} width={480} height={280} className="h-full w-full object-cover opacity-80" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
                      <Image src={clientCase.logo} alt={clientCase.name} width={48} height={48} className="h-full w-full object-contain p-1.5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{clientCase.name}</h3>
                      <p className="text-sm text-slate-300">{clientCase.sector}</p>
                    </div>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-slate-200">{clientCase.summary}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenCase(clientCase)}
                    className="self-start rounded-full border border-blue-400/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-200 transition hover:border-white hover:text-white"
                  >
                    Подробнее
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section ref={sectionCallbacks[4]} id="certificates" className="mx-auto max-w-6xl px-6 scroll-mt-32">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Компетенции</span>
              <h2 className="text-3xl font-semibold text-slate-900">Сертификаты и разрешения</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-500">
              Подтвержденный менеджмент качества, безопасности и охраны окружающей среды для проектов капитального строительства и поставок оборудования.
            </p>
          </div>

          <div
            ref={certificatesRef}
            className="mt-8 flex gap-6 overflow-x-auto scroll-smooth pb-6"
            aria-label="Certificates carousel"
          >
            {certificates.map((certificate) => (
              <button
                key={certificate.id}
                type="button"
                data-carousel-card
                onClick={() => handleOpenCertificate(certificate)}
                className="group w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-slate-50">
                  <Image src={certificate.image} alt={certificate.alt} width={320} height={200} className="object-cover object-center" />
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-slate-900">{certificate.title}</h3>
                  <p className="text-sm text-slate-500">{certificate.number}</p>
                  <p className="text-sm text-slate-600">Выдано: {certificate.issuedBy}</p>
                  <p className="text-xs text-slate-400">Действует {certificate.validTill}</p>
                </div>
                <span className="mt-3 inline-flex text-sm font-semibold text-teal-600/50 transition group-hover:text-teal-600">Открыть</span>
              </button>
            ))}
          </div>

          {certificates.length > 1 && (
            <div className="mt-2 flex justify-center gap-2">
              {certificates.map((certificate, index) => (
                <button
                  key={certificate.id}
                  type="button"
                  onClick={() => goToCertificate(index)}
                  aria-label={`Go to certificate ${certificate.title}`}
                  className={`h-2.5 w-8 rounded-full transition ${certificateIndex === index ? "bg-teal-600" : "bg-slate-300"}`}
                />
              ))}
            </div>
          )}
        </section>

        <section ref={sectionCallbacks[5]} id="contacts" className="bg-slate-100 py-20 scroll-mt-32">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row">
            <div className="flex-1">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Контакты</span>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Региональный офис</h2>
              <p className="mt-3 max-w-xl text-sm text-slate-600">
                Свяжитесь с координационной группой по прямым каналам или с ответственным менеджером по вашему вопросу.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {contactPersons.map((person) => (
                  <div key={person.email} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-lg font-semibold text-slate-900">{person.name}</p>
                    <p className="text-sm text-slate-500">{person.role}</p>
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <a href={`tel:${person.phone.replace(/[^\d+]/g, "")}`} className="block font-semibold text-blue-700 hover:text-blue-600">
                        {person.phone}
                      </a>
                      <EmailCopyLink email={person.email} className="font-semibold">
                        {person.email}
                      </EmailCopyLink>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="w-full max-w-md space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Мы в соцсетях</h3>
                <p className="mt-2 text-sm text-slate-600">Выберите мессенджер, чтобы получить ответ в течение одного рабочего часа.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {contactChannels.map((channel) => (
                    <a
                      key={channel.label}
                      href={channel.href}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
                      title={channel.tooltip}
                    >
                      <Image src={channel.icon} alt={channel.label} width={20} height={20} className="h-5 w-5 object-contain" />
                      {channel.label}
                    </a>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-blue-900">Прямая связь с директором</h3>
                <p className="mt-3 text-sm text-blue-900/80">
                  По всем вопросам сотрудничества и рекламы.
                </p>
                <div className="mt-4 space-y-2 text-sm font-semibold text-blue-800">
                  <a href="tel:+74951234567" className="block hover:text-blue-600">
                    +7 (495) 123-45-67
                  </a>
                  <EmailCopyLink email="info@stroyalliance.ru">info@stroyalliance.ru</EmailCopyLink>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <BackToTopButton />
      </main>

      {selectedCase && (
        <Modal title={selectedCase.name} onClose={handleCloseModal}>
          <p className="text-sm font-semibold text-slate-500">{selectedCase.sector}</p>
          <p className="text-sm text-slate-600">{selectedCase.summary}</p>
          <ul className="list-disc space-y-2 pl-5 pt-3 text-sm text-slate-600">
            {selectedCase.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          {selectedCase.link && (
            <a
              href={selectedCase.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 pt-4 text-sm font-semibold text-blue-700 transition hover:text-blue-600"
            >
              Visit client website
            </a>
          )}
        </Modal>
      )}

      {selectedCertificate && (
        <Modal title={selectedCertificate.title} onClose={handleCloseModal}>
          <p className="text-sm font-semibold text-slate-500">{selectedCertificate.number}</p>
          <p className="text-sm text-slate-600">Выдан: {selectedCertificate.issuedBy}</p>
          <p className="text-sm text-slate-600">Действует: {selectedCertificate.validTill}</p>
          <ul className="list-disc space-y-2 pl-5 pt-3 text-sm text-slate-600">
            {selectedCertificate.scope.map((scopeItem) => (
              <li key={scopeItem}>{scopeItem}</li>
            ))}
          </ul>
        </Modal>
      )}
    </>
  );
}
