"use client";

// -----------------------------------------------------------------------------
// Этот файл содержит типы данных и статическое содержимое главной страницы.
// Вынесение данных в отдельный модуль упрощает поддержку и позволяет
// использовать их в различных секциях без дублирования. Типы описывают
// структуру объектов, чтобы компоненты могли пользоваться строгой типизацией.

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  alt: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export type DirectionCard = {
  slug: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  href: string;
};

export type ClientCase = {
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

export type CertificateCard = {
  id: string;
  title: string;
  number: string;
  issuedBy: string;
  validTill: string;
  image: string;
  alt: string;
  scope: string[];
};

export type ContactChannel = {
  label: string;
  href: string;
  icon: string;
  tooltip: string;
};

export type ContactPerson = {
  name: string;
  role: string;
  phone: string;
  email: string;
};

// -----------------------------------------------------------------------------
// Содержимое секции «Герой»
// -----------------------------------------------------------------------------
export const HERO_SLIDES: HeroSlide[] = [
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

// -----------------------------------------------------------------------------
// Категории материалов
// -----------------------------------------------------------------------------
export const PRODUCT_DIRECTIONS: DirectionCard[] = [
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

// -----------------------------------------------------------------------------
// Категории услуг
// -----------------------------------------------------------------------------
export const SERVICE_DIRECTIONS: DirectionCard[] = [
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

// -----------------------------------------------------------------------------
// Кейсы клиентов
// -----------------------------------------------------------------------------
export const CLIENT_CASES: ClientCase[] = [
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

// -----------------------------------------------------------------------------
// Сертификаты
// -----------------------------------------------------------------------------
export const CERTIFICATES: CertificateCard[] = [
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
    image: "/img/certificates/rostekhnadzor.svg",
    alt: "Допуск Ростехнадзора на опасные производственные объекты",
    scope: [
      "Работы на опасных производственных объектах нефтегазовой отрасли.",
      "Строительство и реконструкция резервуарных парков и сетей ВСП.",
    ],
  },
];

// -----------------------------------------------------------------------------
// Каналы связи и контактные лица
// -----------------------------------------------------------------------------
export const CONTACT_CHANNELS: ContactChannel[] = [
  { label: "Telegram", href: "https://t.me/stroyalliance", icon: "/img/icons/telegram.svg", tooltip: "Telegram: @stroyalliance" },
  { label: "WhatsApp", href: "https://wa.me/79991234567", icon: "/img/icons/whatsapp.svg", tooltip: "WhatsApp: +7 (999) 123-45-67" },
  { label: "Viber", href: "viber://chat?number=+79991234567", icon: "/img/icons/viber.svg", tooltip: "Viber: +7 (999) 123-45-67" },
  { label: "VK", href: "https://vk.com/stroyalliance", icon: "/img/icons/vk.svg", tooltip: "VK: vk.com/stroyalliance" },
  { label: "YouTube", href: "https://www.youtube.com/@stroyalliance", icon: "/img/icons/youtube.svg", tooltip: "YouTube: @stroyalliance" },
];

export const CONTACT_PERSONS: ContactPerson[] = [
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