// Простые типы и статический массив (позже заменим на CSV/JSON)
export type Item = { slug: string; title: string; sku?: string; desc?: string };
export type Subcategory = { slug: string; title: string; items: Item[] };
export type Category = { slug: string; title: string; image?: string; intro?: string; sub: Subcategory[] };

export const CATEGORIES: Category[] = [
  {
    slug: "vodosnabzhenie",
    title: "Водоснабжение",
    image: "https://images.unsplash.com/photo-1508071128957-8a2b0b86ea40?q=80&w=1200&auto=format&fit=crop",
    intro: "Трубы, арматура, насосы, фасонные части для B2B/B2G.",
    sub: [
      {
        slug: "truby-stalnye",
        title: "Трубы стальные",
        items: [
          { slug: "truba-st-57x3", title: "Труба стальная 57×3", sku: "ST-57x3", desc: "ГОСТ 10704-91, электросварная" },
          { slug: "truba-st-108x4", title: "Труба стальная 108×4", sku: "ST-108x4" },
        ],
      },
      {
        slug: "armatura-zapornaya",
        title: "Арматура запорная",
        items: [
          { slug: "klapan-15s65nzh", title: "Клапан 15с65нж DN25", sku: "15C65" },
          { slug: "zadvizhka-30s41nzh", title: "Задвижка 30с41нж DN100", sku: "30C41" },
        ],
      },
    ],
  },
  {
    slug: "vodootvedenie",
    title: "Водоотведение",
    image: "https://images.unsplash.com/photo-1600508774632-c2bc4a65b6a2?q=80&w=1200&auto=format&fit=crop",
    intro: "ПВХ/ПНД, колодцы, фитинги, муфты, уплотнения.",
    sub: [
      { slug: "truby-pvh", title: "Трубы ПВХ", items: [
        { slug: "truba-pvh-110", title: "Труба ПВХ Ø110 SN4", sku: "PVC-110" },
        { slug: "truba-pvh-160", title: "Труба ПВХ Ø160 SN8", sku: "PVC-160" },
      ]},
      { slug: "fitingi", title: "Фитинги", items: [
        { slug: "otvod-110", title: "Отвод ПВХ Ø110 45°" },
        { slug: "troynik-110", title: "Тройник ПВХ Ø110×110×110" },
      ]},
    ],
  },
  // при желании добавь ещё (газо-, электро-, общестрой, спецтехника)
];
