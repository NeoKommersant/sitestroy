export type Item = {
  slug: string;
  title: string;
  sku?: string;
  desc?: string;
};

export type Subcategory = {
  slug: string;
  title: string;
  intro?: string;
  range?: string;
  items: Item[];
};

export type Category = {
  slug: string;
  title: string;
  image: string;
  intro: string;
  sub: Subcategory[];
};

export type CatalogData = {
  categories: Category[];
};
