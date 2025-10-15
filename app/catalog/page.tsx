import type { Metadata } from "next";
import { getCategories } from "@/lib/catalog";
import CatalogExplorer from "./CatalogExplorer";

const BASE_TITLE = "Каталог решений";
const BASE_DESCRIPTION =
  "Поставки инженерного оборудования, материалов и услуг: водоснабжение, водоотведение, газ, электрика, строительные материалы и сервисные работы. Подберите нужные позиции в пару кликов.";

export const metadata: Metadata = {
  title: BASE_TITLE,
  description: BASE_DESCRIPTION,
  alternates: { canonical: "/catalog" },
  openGraph: {
    title: BASE_TITLE,
    description: BASE_DESCRIPTION,
    url: "/catalog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BASE_TITLE,
    description: BASE_DESCRIPTION,
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Каталог",
      item: "https://sitestroy.ru/catalog",
    },
  ],
};

export default function CatalogPage() {
  const categories = getCategories();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{BASE_TITLE}</h1>
          <p className="max-w-3xl text-base text-slate-600">{BASE_DESCRIPTION}</p>
        </header>
        <section className="mt-8">
          <CatalogExplorer categories={categories} />
        </section>
      </div>
    </>
  );
}
