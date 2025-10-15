import type { Metadata } from "next";
import { getCategories } from "@/lib/catalog";
import CatalogExplorer from "./CatalogExplorer";

const BASE_TITLE = "Каталог решений";
const BASE_DESCRIPTION =
  "Поставки инженерного оборудования, материалов и услуг: водоснабжение, водоотведение, газ, электрика, строительные материалы и сервисные работы. Подберите нужные позиции в пару кликов.";

type SearchParams = {
  category?: string;
  subcategory?: string;
  item?: string;
};

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const categories = getCategories();
  const category = categories.find((cat) => cat.slug === searchParams.category);
  const subcategory = category?.sub.find((sub) => sub.slug === searchParams.subcategory);
  const item = subcategory?.items.find((itm) => itm.slug === searchParams.item);

  let title = BASE_TITLE;
  let description = BASE_DESCRIPTION;
  let canonical = "/catalog";
  let image: string | undefined;

  if (category) {
    title = `${category.title} — ${BASE_TITLE}`;
    description = category.intro;
    canonical = `/catalog?category=${category.slug}`;
    image = category.image;
  }

  if (category && subcategory) {
    title = `${subcategory.title} — ${category.title}`;
    description = subcategory.intro ?? category.intro;
    canonical = `/catalog?category=${category.slug}&subcategory=${subcategory.slug}`;
  }

  if (category && subcategory && item) {
    title = `${item.title} — ${subcategory.title}`;
    description = item.desc ?? `${item.title} в разделе ${subcategory.title}.`;
    canonical = `/catalog?category=${category.slug}&subcategory=${subcategory.slug}&item=${item.slug}`;
  }

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: image ? [{ url: image, alt: category?.title ?? title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const categories = getCategories();
  const category = categories.find((cat) => cat.slug === searchParams.category) ?? null;
  const subcategory = category?.sub.find((sub) => sub.slug === searchParams.subcategory) ?? null;
  const item = subcategory?.items.find((itm) => itm.slug === searchParams.item) ?? null;

  const breadcrumbs = [
    { name: "Каталог", href: "/catalog" },
    ...(category ? [{ name: category.title, href: `/catalog?category=${category.slug}` }] : []),
    ...(category && subcategory
      ? [
          {
            name: subcategory.title,
            href: `/catalog?category=${category.slug}&subcategory=${subcategory.slug}`,
          },
        ]
      : []),
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sitestroy.ru";
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.href}`,
    })),
  };

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
          <nav aria-label="Хлебные крошки">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  <a href={crumb.href} className="hover:text-teal-600">
                    {crumb.name}
                  </a>
                  {index < breadcrumbs.length - 1 && <span className="text-slate-300">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        </header>
        <section className="mt-8">
          <CatalogExplorer
            categories={categories}
            initialCategory={category?.slug ?? null}
            initialSubcategory={category && subcategory ? subcategory.slug : null}
            initialItem={category && subcategory && item ? item.slug : null}
          />
        </section>
      </div>
    </>
  );
}
