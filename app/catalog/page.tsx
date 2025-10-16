import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories } from "@/lib/catalog";
import CatalogExplorer from "./CatalogExplorer";

const BASE_TITLE = "Каталог строительных материалов";
const BASE_DESCRIPTION =
  "Подберите нужные позиции в пару кликов. Поставки строительных материалов и инженерного оборудования под Ваш проект.";

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
          {/* Suspense скрывает клиентский `useSearchParams` до гидратации, чтобы статический экспорт не падал */}
          <Suspense
            fallback={
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                Загрузка каталога…
              </div>
            }
          >
            <CatalogExplorer categories={categories} />
          </Suspense>
        </section>
      </div>
    </>
  );
}
