import rawSynonyms from "@/data/synonyms.json";
import rawTaxonomy from "@/data/taxonomy.json";
import type { SynonymsDictionary, Taxonomy } from "@/types/search";

const synonymsData = rawSynonyms as SynonymsDictionary;
const taxonomyData = rawTaxonomy as Taxonomy;

export const getSynonymsDictionary = (): SynonymsDictionary =>
  JSON.parse(JSON.stringify(synonymsData)) as SynonymsDictionary;

export const getTaxonomy = (): Taxonomy =>
  JSON.parse(JSON.stringify(taxonomyData)) as Taxonomy;
