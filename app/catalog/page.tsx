import { Suspense } from "react";
import type { Metadata } from "next";
import { getCategories } from "@/lib/catalog";
import CatalogExplorer from "./CatalogExplorer";

const BASE_TITLE = "Каталог строительных материалов";
const BASE_DESCRIPTION =
  "Подберите нужные позиции в пару кликов. Поставки строительных материалов и инженерного оборудования под ваш проект.";

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
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-teal-900 to-slate-950 px-4 pb-24 pt-20 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-400/25 blur-3xl" />
          <div className="absolute bottom-[-160px] right-0 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute left-[-120px] top-1/3 h-80 w-80 rounded-full bg-slate-900/60 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10">
          <header className="space-y-4 rounded-3xl border border-white/15 bg-white/10 p-8 shadow-[0_20px_60px_rgba(10,20,45,0.45)] backdrop-blur-xl">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">{BASE_TITLE}</h1>
            <p className="max-w-3xl text-base text-white/75">{BASE_DESCRIPTION}</p>
          </header>
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-xl sm:p-8">
            {/* Suspense скрывает клиентский `useSearchParams` до гидратации, чтобы статический экспорт не падал */}
            <Suspense
              fallback={
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-sm text-white/70 shadow-[0_20px_50px_rgba(10,20,45,0.35)]">
                  Загрузка каталога…
                </div>
              }
            >
              <CatalogExplorer categories={categories} />
            </Suspense>
          </section>
        </div>
      </section>
    </>
  );
}

