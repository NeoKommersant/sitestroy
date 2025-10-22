"use client";

import Image from "next/image";
import Link from "next/link";
import { EmailCopyLink } from "@/components/ui/EmailCopyLink";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";

// --------------------------------------------------------------
// РўРёРїС‹ РґР°РЅРЅС‹С… Рё РєРѕРЅСЃС‚Р°РЅС‚С‹ РґР»СЏ СЃС‚СЂР°РЅРёС†С‹
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
// РљРѕРЅС‚РµРЅС‚ РіР»Р°РІРЅРѕР№ СЃС‚СЂР°РЅРёС†С‹
// --------------------------------------------------------------
// HERO РЎР›РђР™Р”Р•Р 
const HERO_SLIDES: HeroSlide[] = [
  {
    id: "welcome",
    title: "Р“Рљ В«РЎС‚СЂРѕР№ РђР»СЊСЏРЅСЃВ»",
    subtitle: "РЎС‚СЂРѕРёРј РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂСѓ РїРѕРґ РєР»СЋС‡",
    description:
      "РљРѕРјРїР»РµРєСЃРЅС‹Рµ РїРѕСЃС‚Р°РІРєРё, РёРЅР¶РёРЅРёСЂРёРЅРі Рё СЃРѕРїСЂРѕРІРѕР¶РґРµРЅРёРµ РґР»СЏ РїСЂРѕРјС‹С€Р»РµРЅРЅС‹С…, РјСѓРЅРёС†РёРїР°Р»СЊРЅС‹С… Рё СЌРЅРµСЂРіРµС‚РёС‡РµСЃРєРёС… РѕР±СЉРµРєС‚РѕРІ РїРѕ РІСЃРµР№ Р РѕСЃСЃРёРё.",
    image: "/img/hero/slide-1.png",
    alt: "РРЅР¶РµРЅРµСЂС‹ РѕР±СЃСѓР¶РґР°СЋС‚ РїСЂРѕРµРєС‚ РјРѕРґРµСЂРЅРёР·Р°С†РёРё РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂС‹",
    primaryCta: { label: "РЎРІСЏР·Р°С‚СЊСЃСЏ СЃ РјРµРЅРµРґР¶РµСЂРѕРј", href: "#contacts" },
    secondaryCta: { label: "РљР°С‚Р°Р»РѕРі СЂРµС€РµРЅРёР№", href: "/catalog" },
  },
  {
    id: "materials",
    title: "РљР°С‚Р°Р»РѕРі СЃС‚СЂРѕРёС‚РµР»СЊРЅС‹С… РјР°С‚РµСЂРёР°Р»РѕРІ",
    subtitle: "РРЅС‚РµР»Р»РµРєС‚СѓР°Р»СЊРЅС‹Р№ РїРѕРґР±РѕСЂ РЅРѕРјРµРЅРєР»Р°С‚СѓСЂС‹",
    description:
      "Р’РѕРґР°, РіР°Р·, СЌР»РµРєС‚СЂРёС‡РµСЃС‚РІРѕ, РѕР±С‰РµСЃС‚СЂРѕРёС‚РµР»СЊРЅС‹Рµ РјР°С‚РµСЂРёР°Р»С‹ Рё СЃРїРµС†С‚РµС…РЅРёРєР° вЂ” РїРѕРґР±РёСЂР°РµРј РЅРѕРјРµРЅРєР»Р°С‚СѓСЂСѓ РїРѕРґ РїСЂРѕРµРєС‚ СЃ СѓРјРЅС‹Рј РїРѕРёСЃРєРѕРј Рё С„РёР»СЊС‚СЂР°С†РёРµР№.",
    image: "/img/hero/slide-2.png",
    alt: "РЎРєР»Р°Рґ СЃС‚СЂРѕРёС‚РµР»СЊРЅС‹С… РјР°С‚РµСЂРёР°Р»РѕРІ СЃ РјРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚РѕРј Рё С‚СЂСѓР±Р°РјРё",
    primaryCta: { label: "РћС‚РїСЂР°РІРёС‚СЊ СЃРїРµС†РёС„РёРєР°С†РёСЋ", href: "/catalog/request" },
    secondaryCta: { label: "РЎРјРѕС‚СЂРµС‚СЊ РєР°С‚РµРіРѕСЂРёРё", href: "/catalog" },
  },
  {
    id: "services",
    title: "РљР°С‚Р°Р»РѕРі СѓСЃР»СѓРі",
    subtitle: "РџРѕР»РЅС‹Р№ С†РёРєР» СЂР°Р±РѕС‚",
    description:
      "РџСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРµ, СЃС‚СЂРѕРёС‚РµР»СЊРЅРѕ-РјРѕРЅС‚Р°Р¶РЅС‹Рµ Рё РїСѓСЃРєРѕРЅР°Р»Р°РґРѕС‡РЅС‹Рµ СЂР°Р±РѕС‚С‹, С‚РµС…РЅР°РґР·РѕСЂ, Р»РѕРіРёСЃС‚РёРєР° Рё СЃРµСЂРІРёСЃ. Р¤РѕСЂРјРёСЂСѓРµРј РєРѕРјР°РЅРґСѓ РїРѕРґ Р·Р°РґР°С‡Сѓ.",
    image: "/img/hero/slide-3.webp",
    alt: "РњРѕРЅС‚Р°Р¶РЅР°СЏ Р±СЂРёРіР°РґР° СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚ РёРЅР¶РµРЅРµСЂРЅС‹Рµ СЃРµС‚Рё",
    primaryCta: { label: "Р’С‹Р±СЂР°С‚СЊ СѓСЃР»СѓРіСѓ", href: "/services" },
  },
  {
    id: "clients",
    title: "РќР°С€Рё РєР»РёРµРЅС‚С‹",
    subtitle: "РћРїС‹С‚ РІ B2B Рё B2G РїСЂРѕРµРєС‚Р°С…",
    description:
      "Р“РѕСЃРєРѕСЂРїРѕСЂР°С†РёРё, СЂРµСЃСѓСЂСЃРѕСЃРЅР°Р±Р¶Р°СЋС‰РёРµ РѕСЂРіР°РЅРёР·Р°С†РёРё, РґРµРІРµР»РѕРїРµСЂС‹ Рё РїСЂРѕРјС‹С€Р»РµРЅРЅС‹Рµ С…РѕР»РґРёРЅРіРё. Р РµР°Р»РёР·СѓРµРј РїСЂРѕРµРєС‚С‹ РїРѕ РІСЃРµР№ СЃС‚СЂР°РЅРµ.",
    image: "/img/hero/slide-4.png",
    alt: "РљРѕРјР°РЅРґР° РєРѕРјРїР°РЅРёРё Рё РєР»РёРµРЅС‚Р° РЅР° СЃС‚СЂРѕРёС‚РµР»СЊРЅРѕР№ РїР»РѕС‰Р°РґРєРµ",
    primaryCta: { label: "РљРµР№СЃС‹ РєР»РёРµРЅС‚РѕРІ", href: "/clients" },
  },
];

const PAGE_SECTIONS = ["hero", "product-directions", "service-directions", "clients", "certificates", "contacts"] as const;
type SectionId = (typeof PAGE_SECTIONS)[number];
// РљРђРўР•Р“РћР РР РњРђРўР•Р РРђР›РћР’
const PRODUCT_DIRECTIONS: DirectionCard[] = [
    {
    slug: "stroymaterialy",
    title: "РЎС‚СЂРѕРёС‚РµР»СЊРЅС‹Рµ РјР°С‚РµСЂРёР°Р»С‹",
    description:
      "РњРµС‚Р°Р»Р»РѕРїСЂРѕРєР°С‚, РёРЅРµСЂС‚РЅС‹Рµ РјР°С‚РµСЂРёР°Р»С‹, Р–Р‘Р Рё СЃСѓС…РёРµ СЃРјРµСЃРё. РћСЂРіР°РЅРёР·СѓРµРј РїРѕСЃС‚Р°РІРєРё Just-in-Time, РєРѕРјРїР»РµРєС‚Р°С†РёСЋ Рё РєРѕРЅС‚СЂРѕР»СЊ РєР°С‡РµСЃС‚РІР°.",
    image: "/img/products/obshhestroitelnye-materialy.webp",
    alt: "РЎРєР»Р°Рґ СЃС‚СЂРѕРёС‚РµР»СЊРЅС‹С… РјР°С‚РµСЂРёР°Р»РѕРІ Рё РјРµС‚Р°Р»Р»РѕРєРѕРЅСЃС‚СЂСѓРєС†РёР№",
    href: "/catalog?category=stroymaterialy",
  },
  {
    slug: "vodosnabzhenie",
    title: "Р’РѕРґРѕСЃРЅР°Р±Р¶РµРЅРёРµ",
    description:
      "РќР°СЃРѕСЃРЅС‹Рµ СЃС‚Р°РЅС†РёРё, СѓР·Р»С‹ СѓС‡РµС‚Р°, Р·Р°РїРѕСЂРЅР°СЏ Р°СЂРјР°С‚СѓСЂР° Рё РґРёСЃРїРµС‚С‡РµСЂРёР·Р°С†РёСЏ. РџРѕРґРґРµСЂР¶РёРІР°РµРј РЅРµРїСЂРµСЂС‹РІРЅРѕСЃС‚СЊ Рё РєРѕРЅС‚СЂРѕР»СЊ СЂР°СЃС…РѕРґР° РІРѕРґС‹.",
    image: "/img/products/vodosnabzhenie.webp",
    alt: "РџСЂРѕРјС‹С€Р»РµРЅРЅРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ РІРѕРґРѕСЃРЅР°Р±Р¶РµРЅРёСЏ",
    href: "/catalog?category=vodosnabzhenie",
  },
  {
    slug: "vodootvedenie",
    title: "Р’РѕРґРѕРѕС‚РІРµРґРµРЅРёРµ",
    description:
      "Р“СЂР°РІРёС‚Р°С†РёРѕРЅРЅС‹Рµ Рё РЅР°РїРѕСЂРЅС‹Рµ С‚СЂСѓР±РѕРїСЂРѕРІРѕРґС‹, РљРќРЎ, РѕС‡РёСЃС‚РЅС‹Рµ СЃРѕРѕСЂСѓР¶РµРЅРёСЏ Рё РµРјРєРѕСЃС‚Рё РґР»СЏ РєРѕРјРјСѓРЅР°Р»СЊРЅРѕР№ Рё РїСЂРѕРјС‹С€Р»РµРЅРЅРѕР№ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂС‹.",
    image: "/img/products/vodootvedenie.webp",
    alt: "РљРѕР»Р»РµРєС‚РѕСЂ СЃРёСЃС‚РµРјС‹ РІРѕРґРѕРѕС‚РІРµРґРµРЅРёСЏ РЅР° СЃС‚СЂРѕР№РїР»РѕС‰Р°РґРєРµ",
    href: "/catalog?category=vodootvedenie",
  },
  {
    slug: "gazosnabzhenie",
    title: "Р“Р°Р·РѕСЃРЅР°Р±Р¶РµРЅРёРµ",
    description:
      "РџРѕР»РёСЌС‚РёР»РµРЅРѕРІС‹Рµ Рё СЃС‚Р°Р»СЊРЅС‹Рµ С‚СЂСѓР±РѕРїСЂРѕРІРѕРґС‹, Р“Р Рџ/Р“Р РџРЁ, РљРРџРёРђ Рё РєР°С‚РѕРґРЅР°СЏ Р·Р°С‰РёС‚Р° РїРѕРґ С‚СЂРµР±РѕРІР°РЅРёСЏ Р РѕСЃС‚РµС…РЅР°РґР·РѕСЂР° Рё Р“Р°Р·РїСЂРѕРјР°.",
    image: "/img/products/gazosnabzhenie.webp",
    alt: "Р“Р°Р·РѕСЂР°СЃРїСЂРµРґРµР»РёС‚РµР»СЊРЅС‹Р№ РїСѓРЅРєС‚ Рё С‚СЂСѓР±РѕРїСЂРѕРІРѕРґ",
    href: "/catalog?category=gazosnabzhenie",
  },
  {
    slug: "elektrosnabzhenie",
    title: "Р­Р»РµРєС‚СЂРѕСЃРЅР°Р±Р¶РµРЅРёРµ",
    description:
      "РљРўРџ, СЂР°СЃРїСЂРµРґРµР»РёС‚РµР»СЊРЅС‹Рµ СѓСЃС‚СЂРѕР№СЃС‚РІР°, РєР°Р±РµР»СЊРЅР°СЏ РїСЂРѕРґСѓРєС†РёСЏ Рё РѕСЃРІРµС‰РµРЅРёРµ. РЎРѕРѕС‚РІРµС‚СЃС‚РІРёРµ СЃС‚Р°РЅРґР°СЂС‚Р°Рј СЃРµС‚РµРІС‹С… Рё РїСЂРѕРјС‹С€Р»РµРЅРЅС‹С… Р·Р°РєР°Р·С‡РёРєРѕРІ.",
    image: "/img/products/elektrosnabzhenie.webp",
    alt: "Р­Р»РµРєС‚СЂРѕС‚РµС…РЅРёС‡РµСЃРєРѕРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёРµ РїРѕРґСЃС‚Р°РЅС†РёРё",
    href: "/catalog?category=elektrosnabzhenie",
  },
  {
    slug: "uslugi",
    title: "РЈСЃР»СѓРіРё",
    description:
      "Р”РѕСЃС‚Р°РІРєР° РјР°С‚РµСЂРёР°Р»РѕРІ РїРѕ РІСЃРµР№ Р РѕСЃСЃРёРё, Р°СЂРµРЅРґР° СЃРїРµС†С‚РµС…РЅРёРєРё, РІС‹РїРѕР»РЅРµРЅРёРµ РЎРњР  Рё РїСѓСЃРєРѕРЅР°Р»Р°РґРєР° СЃ РѕРґРЅРёРј РїРѕРґСЂСЏРґС‡РёРєРѕРј.",
    image: "/img/products/spectekhnika.jpg",
    alt: "РљРѕРјР°РЅРґР° РёРЅР¶РµРЅРµСЂРѕРІ Рё СЃРїРµС†С‚РµС…РЅРёРєР° РЅР° СЃС‚СЂРѕРёС‚РµР»СЊРЅРѕР№ РїР»РѕС‰Р°РґРєРµ",
    href: "/catalog?category=uslugi",
  },
];
// РљРђРўР•Р“РћР РР РЈРЎР›РЈР“
const SERVICE_DIRECTIONS: DirectionCard[] = [
  {
    slug: "stroitelnye-raboty",
    title: "РЎС‚СЂРѕРёС‚РµР»СЊРЅРѕ-РјРѕРЅС‚Р°Р¶РЅС‹Рµ СЂР°Р±РѕС‚С‹",
    description: "РћС‚ РїРѕРґРіРѕС‚РѕРІРёС‚РµР»СЊРЅРѕРіРѕ РїРµСЂРёРѕРґР° РґРѕ РІРІРѕРґР° РѕР±СЉРµРєС‚Р°. РЎРѕР±СЃС‚РІРµРЅРЅС‹Рµ Р±СЂРёРіР°РґС‹, РџРўРћ Рё СЃРїРµС†С‚РµС…РЅРёРєР°.",
    image: "/img/services/stroitelnye-raboty.jpeg",
    alt: "РњРѕРЅС‚Р°Р¶ РёРЅР¶РµРЅРµСЂРЅС‹С… СЃРµС‚РµР№ РЅР° РѕР±СЉРµРєС‚Рµ",
    href: "/services/stroitelnye-montazhnye",
  },
  {
    slug: "proektnye-izyskatelnye",
    title: "РџСЂРѕРµРєС‚РЅРѕ-РёР·С‹СЃРєР°С‚РµР»СЊРЅС‹Рµ СЂР°Р±РѕС‚С‹",
    description: "РћР±СЃР»РµРґРѕРІР°РЅРёРµ, РџРР , BIM-РєРѕРѕСЂРґРёРЅР°С†РёСЏ Рё СЃРѕРїСЂРѕРІРѕР¶РґРµРЅРёРµ СЌРєСЃРїРµСЂС‚РёР·С‹. Р’РµРґРµРЅРёРµ РїСЂРѕРµРєС‚Р° РІ РµРґРёРЅРѕР№ СЃСЂРµРґРµ РґР°РЅРЅС‹С….",
    image: "/img/services/proektnye.jpg",
    alt: "РРЅР¶РµРЅРµСЂ РїСЂРѕРµРєС‚РёСЂСѓРµС‚ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂСѓ РЅР° РєРѕРјРїСЊСЋС‚РµСЂРµ",
    href: "/services/proektnye",
  },
  {
    slug: "puskonaladochnye",
    title: "РџСѓСЃРєРѕРЅР°Р»Р°РґРѕС‡РЅС‹Рµ СЂР°Р±РѕС‚С‹",
    description: "РќР°СЃС‚СЂРѕР№РєР° РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ, РёСЃРїС‹С‚Р°РЅРёСЏ, РѕР±СѓС‡РµРЅРёРµ РїРµСЂСЃРѕРЅР°Р»Р° Рё РіР°СЂР°РЅС‚РёР№РЅС‹Р№ СЃРµСЂРІРёСЃ.",
    image: "/img/services/puskonaladochnye.jpg",
    alt: "РЎРїРµС†РёР°Р»РёСЃС‚ РїСЂРѕРІРѕРґРёС‚ РїСѓСЃРєРѕРЅР°Р»Р°РґРєСѓ РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ",
    href: "/services/puskonaladochnye",
  },
  {
    slug: "avtorskiy-nadzor",
    title: "РђРІС‚РѕСЂСЃРєРёР№ Рё С‚РµС…РЅРёС‡РµСЃРєРёР№ РЅР°РґР·РѕСЂ",
    description: "РљРѕРЅС‚СЂРѕР»СЊ РєР°С‡РµСЃС‚РІР°, СѓРїСЂР°РІР»РµРЅРёРµ РёР·РјРµРЅРµРЅРёСЏРјРё, РІРµРґРµРЅРёРµ РёСЃРїРѕР»РЅРёС‚РµР»СЊРЅРѕР№ РґРѕРєСѓРјРµРЅС‚Р°С†РёРё.",
    image: "/img/services/nadzor.jpeg",
    alt: "РРЅР¶РµРЅРµСЂС‹ РїСЂРѕРІРѕРґСЏС‚ С‚РµС…РЅРёС‡РµСЃРєРёР№ РЅР°РґР·РѕСЂ",
    href: "/services/nadzor",
  },
  {
    slug: "logistika",
    title: "Р›РѕРіРёСЃС‚РёРєР° Рё СЃРЅР°Р±Р¶РµРЅРёРµ",
    description: "РњР°СЂС€СЂСѓС‚РёР·Р°С†РёСЏ, СЃРєР»Р°РґРёСЂРѕРІР°РЅРёРµ, РєРѕРЅС‚СЂРѕР»СЊ СЃСЂРѕРєРѕРІ Рё РєР°С‡РµСЃС‚РІР°. РЎРѕР±СЃС‚РІРµРЅРЅС‹Р№ РїР°СЂРє Рё С„РµРґРµСЂР°Р»СЊРЅС‹Рµ РїР°СЂС‚РЅС‘СЂС‹.",
    image: "/img/services/logistika.jpeg",
    alt: "РљРѕР»РѕРЅРЅР° РіСЂСѓР·РѕРІРёРєРѕРІ РЅР° С‚СЂР°СЃСЃРµ",
    href: "/services/logistika",
  },
  {
    slug: "arenda-spectekhniki",
    title: "РђСЂРµРЅРґР° СЃРїРµС†С‚РµС…РЅРёРєРё",
    description: "РўРµС…РЅРёРєР° 24/7, РІР°С…С‚РѕРІС‹Рµ Р±СЂРёРіР°РґС‹, СЃРµСЂРІРёСЃРЅРѕРµ СЃРѕРїСЂРѕРІРѕР¶РґРµРЅРёРµ Рё СЃС‚СЂР°С…РѕРІР°РЅРёРµ.",
    image: "/img/services/arenda-spectekhniki.jpg",
    alt: "РџР°СЂРє СЃРїРµС†С‚РµС…РЅРёРєРё РЅР° Р±Р°Р·Рµ",
    href: "/services/arenda",
  },
];

const CLIENT_CASES: ClientCase[] = [
  {
    id: "rosvodokanal",
    name: "РњР РРЇ",
    sector: "Р“РќР‘ В· B2B",
    summary: "РџРµСЂРµС…РѕРґ РјРµС‚РѕРґРѕРј Р“РќР‘ РІ СЃРєР°Р»СЊРЅС‹С… РіСЂСѓРЅС‚Р°С….",
    image: "/img/clients/mriya-bg.jpg",
    logo: "/img/clients/mriya-logo.png",
    alt: "РљРѕРјР°РЅРґР° РЅР° РѕР±СЉРµРєС‚Рµ Р РѕСЃРІРѕРґРѕРєР°РЅР°Р»Р°",
    details: [
      "РџРµСЂРµС…РѕРґ РјРµС‚РѕРґРѕРј Р“РќР‘ РІ СЃРєР°Р»СЊРЅС‹С… РіСЂСѓРЅС‚Р°С… D 300 РјРј L 270 Рї.Рј. Mriya Resot and Spa",
      ".",
      ".",
    ],
    link: "https://mriyaresort.com/",
  },
  {
    id: "mosoblvodokanal",
    name: "РўР” Р’РРџРђРљРЎ",
    sector: "РџРќР  В· B2G",
    summary: "Р Р°Р±РѕС‚С‹ РџРќР  РїРѕ РЅР°РїСЂР°РІР»СЏРµРЅРёСЏРј Р­РўРћ, РўРњРћ, РЎР’РЎ, Р’РЎ, Рё РћР’РёРљ.",
    image: "/img/clients/td-bg.jpg",
    logo: "/img/clients/td-logo.png",
    alt: "РЎС‚СЂРѕРёС‚РµР»СЊСЃС‚РІРѕ РєР°РЅР°Р»РёР·Р°С†РёРѕРЅРЅС‹С… СЃРµС‚РµР№",
    details: [
      "Р’ 2022 РІРµРґСѓС‚СЃСЏ СЂР°Р±РѕС‚С‹ РџРќР  РїРѕ РЅР°РїСЂР°РІР»РµРЅРёСЏРј Р­РўРћ, РўРњРћ, СЃРёСЃС‚РµРјР°Рј РІРЅРµС€РЅРµР№ СЃРІСЏР·Рё, РІРЅСѓС‚СЂРёРѕР±СЉРµРєС‚РѕРІРѕР№ СЃРІСЏР·Рё Рё РћР’РёРљ, РїР»Р°РЅРѕРІС‹Р№ СЃСЂРѕРє РѕРєРѕРЅС‡Р°РЅРёСЏ РїРµСЂРІРѕРіРѕ СЌС‚Р°РїР° 1Р№ РєРІР°СЂС‚Р°Р» 2023Рі.",
      "Р’ РјР°Рµ 2022 РіРѕРґР° РїСЂРѕРІРµРґРµРЅС‹ РџРќР  СЃРёСЃС‚РµРјС‹ РІРЅРµС€РЅРµР№ СЃРІСЏР·Рё РјРµР¶РґСѓ РЈРґР°СЂРЅРѕР№ РўР­РЎ Рё РљСѓР±Р°РЅСЃРєРёРј Р Р”РЈ РѕСЃРЅРѕРІРЅРѕРіРѕ Рё СЂРµР·РµСЂРІРЅРѕРіРѕ РєР°РЅР°Р»Р°.",
      "РџСѓСЃРє РўР­РЎ 2024 РіРѕРґ.",
    ],
  },
  {
    id: "moscow-metro",
    name: "РўРµС…РЅРѕРџСЂРѕРјР­РєСЃРїРѕСЂС‚",
    sector: "Р“Р°Р·РѕСЃРЅР°Р±Р¶РµРЅРёРµ В· B2G",
    summary: "РРЅР¶РµРЅРµСЂРЅС‹Рµ СЃРёСЃС‚РµРјС‹ Рё СЃРїРµС†С‚РµС…РЅРёРєР° РґР»СЏ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР° Р‘РѕР»СЊС€РѕР№ РєРѕР»СЊС†РµРІРѕР№ Р»РёРЅРёРё.",
    image: "/img/clients/tpe-bg.png",
    logo: "/img/clients/tpe-logo.png",
    alt: "РўРѕРЅРЅРµР»СЊ РјРµС‚СЂРѕ РІ РїСЂРѕС†РµСЃСЃРµ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР°",
    details: [
      "РџРѕСЃС‚Р°РІРєР° РєР°Р±РµР»СЊРЅС‹С… Р»РёРЅРёР№, СЃРёР»РѕРІС‹С… С‰РёС‚РѕРІ Рё С€РєР°С„РѕРІ Р°РІС‚РѕРјР°С‚РёРєРё.",
      "РђСЂРµРЅРґР° СЃРїРµС†С‚РµС…РЅРёРєРё СЃ РєСЂСѓРіР»РѕСЃСѓС‚РѕС‡РЅС‹Рј СЃРµСЂРІРёСЃРѕРј Рё РґРёСЃРїРµС‚С‡РµСЂРёР·Р°С†РёРµР№.",
      "РљРѕРЅС‚СЂРѕР»СЊ РєР°С‡РµСЃС‚РІР°, С‚РµС…РЅР°РґР·РѕСЂ Рё РёРЅС‚РµРіСЂР°С†РёСЏ СЃ BIM-РјРѕРґРµР»СЊСЋ РїСЂРѕРµРєС‚Р°.",
    ],
    link: "https://www.mosmetro.ru",
  },
  {
    id: "novatek",
    name: "Р’РѕРґР° РљСЂС‹РјР°",
    sector: "Р’РѕРґРѕСЃРЅР°Р±Р¶РµРЅРёРµ В· B2G",
    summary: "Р“Р°Р·РѕРІС‹Рµ СЃРµС‚Рё РґР»СЏ С‚РµС…РЅРѕР»РѕРіРёС‡РµСЃРєРёС… Р»РёРЅРёР№ Рё РѕР±СЉРµРєС‚РѕРІ РІРЅРµС€РЅРµРіРѕ СЃРЅР°Р±Р¶РµРЅРёСЏ.",
    image: "/img/clients/vodacrimea-bg.jpg",
    logo: "/img/clients/vodacrimea-logo.jpg",
    alt: "Р“Р°Р·РѕРІР°СЏ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂР° РЅР° РїСЂРѕРјС‹С€Р»РµРЅРЅРѕР№ РїР»РѕС‰Р°РґРєРµ",
    details: [
      "РџРѕСЃС‚Р°РІРєР° РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ Р“Р Рџ Рё СѓР·Р»РѕРІ СѓС‡С‘С‚Р° СЃ СЂРµР·РµСЂРІРёСЂРѕРІР°РЅРёРµРј.",
      "РњРµС‚Р°Р»Р»РѕРєРѕРЅСЃС‚СЂСѓРєС†РёРё Рё С‚СЂСѓР±РѕРїСЂРѕРІРѕРґС‹ РёР· РЅРµСЂР¶Р°РІРµР№РєРё РїРѕРґ С‚СЂРµР±РѕРІР°РЅРёСЏ Р·Р°РєР°Р·С‡РёРєР°.",
      "РџСѓСЃРєРѕРЅР°Р»Р°РґРєР°, Р°РІС‚РѕСЂСЃРєРёР№ РЅР°РґР·РѕСЂ Рё РѕР±СѓС‡РµРЅРёРµ РѕРїРµСЂР°С‚РёРІРЅРѕРіРѕ РїРµСЂСЃРѕРЅР°Р»Р°.",
    ],
    link: "https://www.novatek.ru",
  },
];

const CERTIFICATES: CertificateCard[] = [
  {
    id: "sro-stroy",
    title: "РЎР Рћ РЅР° СЃС‚СЂРѕРёС‚РµР»СЊРЅРѕ-РјРѕРЅС‚Р°Р¶РЅС‹Рµ СЂР°Р±РѕС‚С‹",
    number: "в„– РЎР Рћ-РЎ-123-2025",
    issuedBy: "РЎР Рћ В«РРЅР¶РЎС‚СЂРѕР№РђР»СЊСЏРЅСЃВ»",
    validTill: "РґРѕ 12.05.2026",
    image: "/img/certificates/sro-stroy.svg",
    alt: "РЎР Рћ РЅР° СЃС‚СЂРѕРёС‚РµР»СЊРЅРѕ-РјРѕРЅС‚Р°Р¶РЅС‹Рµ СЂР°Р±РѕС‚С‹",
    scope: [
      "РћР±СЉРµРєС‚С‹ РєР°РїРёС‚Р°Р»СЊРЅРѕРіРѕ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР°, РІРєР»СЋС‡Р°СЏ РѕСЃРѕР±Рѕ РѕРїР°СЃРЅС‹Рµ Рё С‚РµС…РЅРёС‡РµСЃРєРё СЃР»РѕР¶РЅС‹Рµ.",
      "РњРѕРЅС‚Р°Р¶ РёРЅР¶РµРЅРµСЂРЅС‹С… СЃРёСЃС‚РµРј, СЃРІР°СЂРєР° С‚СЂСѓР±РѕРїСЂРѕРІРѕРґРѕРІ, РљРРџРёРђ.",
    ],
  },
  {
    id: "sro-proekt",
    title: "РЎР Рћ РЅР° РїСЂРѕРµРєС‚РЅС‹Рµ СЂР°Р±РѕС‚С‹",
    number: "в„– РЎР Рћ-Рџ-078-2025",
    issuedBy: "РЎР Рћ В«РџСЂРѕРµРєС‚РРЅР¶РёРЅРёСЂРёРЅРіВ»",
    validTill: "РґРѕ 18.09.2026",
    image: "/img/certificates/sro-proekt.svg",
    alt: "РЎР Рћ РЅР° РїСЂРѕРµРєС‚РЅС‹Рµ СЂР°Р±РѕС‚С‹",
    scope: [
      "РџСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРµ РёРЅР¶РµРЅРµСЂРЅС‹С… РєРѕРјРјСѓРЅРёРєР°С†РёР№ Рё СЃРёСЃС‚РµРј РІРѕРґРѕРїРѕРґРіРѕС‚РѕРІРєРё.",
      "РђРІС‚РѕСЂСЃРєРёР№ РєРѕРЅС‚СЂРѕР»СЊ, BIM-РєРѕРѕСЂРґРёРЅР°С†РёСЏ, СЃРѕРїСЂРѕРІРѕР¶РґРµРЅРёРµ СЌРєСЃРїРµСЂС‚РёР·С‹.",
    ],
  },
  {
    id: "iso-9001",
    title: "РЎРµСЂС‚РёС„РёРєР°С‚ ISO 9001:2015",
    number: "RU-ISO-9001-4580",
    issuedBy: "Bureau Veritas Certification",
    validTill: "РґРѕ 01.03.2027",
    image: "/img/certificates/iso-9001.svg",
    alt: "РЎРµСЂС‚РёС„РёРєР°С‚ СЃРёСЃС‚РµРјС‹ РјРµРЅРµРґР¶РјРµРЅС‚Р° РєР°С‡РµСЃС‚РІР° ISO 9001",
    scope: [
      "РњРµРЅРµРґР¶РјРµРЅС‚ РєР°С‡РµСЃС‚РІР° РїРѕСЃС‚Р°РІРѕРє СЃС‚СЂРѕРёС‚РµР»СЊРЅС‹С… РјР°С‚РµСЂРёР°Р»РѕРІ Рё РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ.",
      "РћСЂРіР°РЅРёР·Р°С†РёСЏ СЃС‚СЂРѕРёС‚РµР»СЊРЅС‹С… Рё РјРѕРЅС‚Р°Р¶РЅС‹С… СЂР°Р±РѕС‚.",
    ],
  },
  {
    id: "iso-14001",
    title: "РЎРµСЂС‚РёС„РёРєР°С‚ ISO 14001:2016",
    number: "RU-ISO-14001-1120",
    issuedBy: "TГњV Rheinland",
    validTill: "РґРѕ 30.11.2026",
    image: "/img/certificates/iso-14001.svg",
    alt: "РЎРµСЂС‚РёС„РёРєР°С‚ СЃРёСЃС‚РµРјС‹ СЌРєРѕР»РѕРіРёС‡РµСЃРєРѕРіРѕ РјРµРЅРµРґР¶РјРµРЅС‚Р° ISO 14001",
    scope: [
      "Р­РєРѕР»РѕРіРёС‡РµСЃРєРѕРµ СЃРѕРїСЂРѕРІРѕР¶РґРµРЅРёРµ СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІР° Рё СЌРєСЃРїР»СѓР°С‚Р°С†РёРё РѕР±СЉРµРєС‚РѕРІ.",
      "РЈРїСЂР°РІР»РµРЅРёРµ РѕС‚С…РѕРґР°РјРё Рё РјРѕРЅРёС‚РѕСЂРёРЅРі РІРѕР·РґРµР№СЃС‚РІРёСЏ РЅР° СЃСЂРµРґСѓ.",
    ],
  },
  {
    id: "rostekhnadzor",
    title: "Р”РѕРїСѓСЃРє Р РѕСЃС‚РµС…РЅР°РґР·РѕСЂР°",
    number: "в„– 77-Р”-985/2025",
    issuedBy: "Р РѕСЃС‚РµС…РЅР°РґР·РѕСЂ",
    validTill: "РґРѕ 14.02.2027",
    image: "/img/certificates/rostekhnadzor.svg",
    alt: "Р”РѕРїСѓСЃРє Р РѕСЃС‚РµС…РЅР°РґР·РѕСЂР° РЅР° РѕРїР°СЃРЅС‹Рµ РїСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅС‹Рµ РѕР±СЉРµРєС‚С‹",
    scope: [
      "Р Р°Р±РѕС‚С‹ РЅР° РѕРїР°СЃРЅС‹С… РїСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅС‹С… РѕР±СЉРµРєС‚Р°С… РЅРµС„С‚РµРіР°Р·РѕРІРѕР№ РѕС‚СЂР°СЃР»Рё.",
      "РЎС‚СЂРѕРёС‚РµР»СЊСЃС‚РІРѕ Рё СЂРµРєРѕРЅСЃС‚СЂСѓРєС†РёСЏ СЂРµР·РµСЂРІСѓР°СЂРЅС‹С… РїР°СЂРєРѕРІ Рё СЃРµС‚РµР№ Р’РЎРџ.",
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
    name: "РђРЅС‚РѕРЅ РџРµС‚СЂРѕРІ",
    role: "РљРѕРјРјРµСЂС‡РµСЃРєРёР№ РґРёСЂРµРєС‚РѕСЂ",
    phone: "+7 (495) 123-45-67",
    email: "a.petrov@stroyalliance.ru",
  },
  {
    name: "РњР°СЂРёСЏ РљСѓР·РЅРµС†РѕРІР°",
    role: "Р СѓРєРѕРІРѕРґРёС‚РµР»СЊ С‚РµРЅРґРµСЂРЅРѕРіРѕ РѕС‚РґРµР»Р°",
    phone: "+7 (985) 222-33-44",
    email: "m.kuznetsova@stroyalliance.ru",
  },
  {
    name: "Р”РјРёС‚СЂРёР№ Р’РѕР»РєРѕРІ",
    role: "Р”РёСЂРµРєС‚РѕСЂ РїРѕ РїСЂРѕРµРєС‚Р°Рј",
    phone: "+7 (916) 555-77-99",
    email: "d.volkov@stroyalliance.ru",
  },
];

// --------------------------------------------------------------
// РҐСѓРє РґР»СЏ РіРѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅРѕРіРѕ drag-scroll РєР°СЂСѓСЃРµР»РµР№
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
// РљРЅРѕРїРєР° РІРѕР·РІСЂР°С‚Р° Рє РЅР°С‡Р°Р»Сѓ СЃС‚СЂР°РЅРёС†С‹
// --------------------------------------------------------------
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
          aria-label="Р—Р°РєСЂС‹С‚СЊ РјРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ"
        >
          вњ•
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
          className="relative isolate flex h-[100dvh] w-screen min-h-[640px] flex-col overflow-hidden select-none -mt-[60px] pt-[60px] md:-mt-[96px] md:pt-[96px]"
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
                  aria-label={`${index + 1} РёР· ${heroSlides.length}`}
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
                      <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">РЎС‚СЂРѕР№ РђР»СЊСЏРЅСЃ</span>
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
                aria-label="РџСЂРµРґС‹РґСѓС‰РёР№ СЃР»Р°Р№Рґ"
                className="group absolute left-6 bottom-[20%] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-8 sm:bottom-[18%] sm:h-14 sm:w-14 md:bottom-auto md:left-10 md:top-1/2 md:h-16 md:w-16 md:-translate-y-1/2 lg:left-16"
              >
                <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleHeroSelect(activeHeroIndex + 1)}
                aria-label="РЎР»РµРґСѓСЋС‰РёР№ СЃР»Р°Р№Рґ"
                className="group absolute right-6 bottom-[20%] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 backdrop-blur transition hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-8 sm:bottom-[18%] sm:h-14 sm:w-14 md:bottom-auto md:right-10 md:top-1/2 md:h-16 md:w-16 md:-translate-y-1/2 lg:right-16"
              >
                <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <div className="pointer-events-none absolute left-1/2 top-24 flex -translate-x-1/2 items-center gap-2 sm:top-24 md:top-auto md:bottom-16 md:gap-3">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => handleHeroSelect(index)}
                    className={`pointer-events-auto h-1.5 w-8 rounded-full border border-white/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:h-2 sm:w-9 ${activeHeroIndex === index ? "bg-white/90" : "bg-white/20"}`}
                    aria-label={`РџРµСЂРµР№С‚Рё Рє СЃР»Р°Р№РґСѓ: ${slide.title}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        <section
          ref={sectionCallbacks[1]}
          id="product-directions"
          className="relative flex min-h-[100dvh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="relative z-10 mx-auto flex h-[calc(100vh-160px)] w-full max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-8 text-white shadow-[0_40px_120px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-teal-200/80">РџСЂРѕРґСѓРєС‚С‹</span>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">РЎС‚СЂРѕРёС‚РµР»СЊРЅС‹Рµ РјР°С‚РµСЂРёР°Р»С‹</h2>
              </div>
              <p className="max-w-xl text-sm text-white/70">
                РљРѕРјРїР»РµРєСЃРЅС‹Р№ РїРѕРёСЃРє РїСЂРѕРјС‹С€Р»РµРЅРЅС‹С… РјР°С‚РµСЂРёР°Р»РѕРІ Рё РјР°С‚РµСЂРёР°Р»РѕРІ РґР»СЏ РёРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂС‹ СЃ РїСЂРµРґСЃРєР°Р·СѓРµРјС‹РјРё СЃСЂРѕРєР°РјРё РїРѕСЃС‚Р°РІРєРё Рё СЃС‚СЂРѕРіРёРј РєРѕРЅС‚СЂРѕР»РµРј РєР°С‡РµСЃС‚РІР°.
              </p>
            </header>

            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {directions.products.map((direction) => (
                  <Link
                    key={direction.slug}
                    href={direction.href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-[0_20px_60px_rgba(10,20,45,0.35)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/15"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={direction.image}
                        alt={direction.alt}
                        fill
                        className="object-cover object-center opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                        sizes="100vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <h3 className="text-lg font-semibold text-white">{direction.title}</h3>
                      <p className="text-sm leading-relaxed text-white/70">{direction.description}</p>
                    </div>
                    <span className="px-6 pb-6 text-sm font-semibold text-white/60 transition group-hover:text-white">
                      РЈР·РЅР°С‚СЊ Р±РѕР»СЊС€Рµ
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          ref={sectionCallbacks[2]}
          id="service-directions"
          className="relative flex min-h-[100dvh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="relative z-10 mx-auto flex h-[calc(100vh-160px)] w-full max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-8 text-white shadow-[0_40px_120px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-teal-200/80">РЈСЃР»СѓРіРё</span>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">РРЅР¶РµРЅРµСЂРЅС‹Рµ РєРѕРјРїРµС‚РµРЅС†РёРё</h2>
              </div>
              <p className="max-w-xl text-sm text-white/70">
                РљРѕРјР°РЅРґС‹ РїРѕ РїРѕСЃС‚Р°РІРєРµ РѕР±РѕСЂСѓРґРѕРІР°РЅРёСЏ РїРѕРґ РєР»СЋС‡, РєРѕС‚РѕСЂС‹Рµ Р·Р°РЅРёРјР°СЋС‚СЃСЏ РїСЂРѕРµРєС‚РёСЂРѕРІР°РЅРёРµРј, СЃС‚СЂРѕРёС‚РµР»СЊСЃС‚РІРѕРј, РІРІРѕРґРѕРј РІ СЌРєСЃРїР»СѓР°С‚Р°С†РёСЋ Рё СЌРєСЃРїР»СѓР°С‚Р°С†РёРѕРЅРЅРѕР№ РїРѕРґРґРµСЂР¶РєРѕР№ СЃР»РѕР¶РЅС‹С… РѕР±СЉРµРєС‚РѕРІ.
              </p>
            </header>

            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {directions.services.map((direction) => (
                  <Link
                    key={direction.slug}
                    href={direction.href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-[0_20px_60px_rgba(10,20,45,0.35)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/15"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={direction.image}
                        alt={direction.alt}
                        fill
                        className="object-cover object-center opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
                        sizes="100vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <h3 className="text-lg font-semibold text-white">{direction.title}</h3>
                      <p className="text-sm leading-relaxed text-white/70">{direction.description}</p>
                    </div>
                    <span className="px-6 pb-6 text-sm font-semibold text-white/60 transition group-hover:text-white">
                      РџРѕРґСЂРѕР±РЅРµРµ
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

                <section
          ref={sectionCallbacks[3]}
          id="clients"
          className="relative flex min-h-[100dvh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="relative z-10 mx-auto flex h-[calc(100vh-160px)] w-full max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-8 text-white shadow-[0_40px_120px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">РљРµР№СЃС‹</span>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">РћРїС‹С‚ РґР»СЏ B2B Рё B2G</h2>
              </div>
              <p className="max-w-xl text-sm text-white/70">
                РРЅР¶РёРЅРёСЂРёРЅРіРѕРІС‹Р№ РїРѕРґС…РѕРґ Рё РєРѕРјРїР»РµРєСЃРЅР°СЏ РїРѕСЃС‚Р°РІРєР° РїРѕР·РІРѕР»СЏСЋС‚ СЂРµР°Р»РёР·РѕРІС‹РІР°С‚СЊ РїСЂРѕРµРєС‚С‹ С„РµРґРµСЂР°Р»СЊРЅРѕРіРѕ Рё СЂРµРіРёРѕРЅР°Р»СЊРЅРѕРіРѕ СѓСЂРѕРІРЅСЏ: РјРѕРґРµСЂРЅРёР·Р°С†РёСЏ СЃРµС‚РµР№, СЌРЅРµСЂРіРѕРѕР±СЉРµРєС‚РѕРІ, СѓР·Р»РѕРІ СѓС‡РµС‚Р° Рё РёРЅР¶РµРЅРµСЂРЅС‹С… СЃРёСЃС‚РµРј Р»СЋР±РѕРіРѕ РјР°СЃС€С‚Р°Р±Р°.
              </p>
            </div>

            <div className="mt-6 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-4 md:grid-cols-2">
                {clientCases.map((clientCase) => (
                  <article
                    key={clientCase.id}
                    className="group flex h-full flex-col gap-4 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-lg transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/15"
                  >
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-800">
                      <Image src={clientCase.image} alt={clientCase.alt} width={480} height={280} className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white/90">
                        <Image src={clientCase.logo} alt={clientCase.name} width={48} height={48} className="h-full w-full object-contain p-1.5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{clientCase.name}</h3>
                        <p className="text-sm text-white/70">{clientCase.sector}</p>
                      </div>
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-white/75">{clientCase.summary}</p>
                    <button
                      type="button"
                      onClick={() => handleOpenCase(clientCase)}
                      className="self-start rounded-full border border-white/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white hover:text-white"
                    >
                      РџРѕРґСЂРѕР±РЅРµРµ
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

                <section
          ref={sectionCallbacks[4]}
          id="certificates"
          className="relative flex min-h-[100dvh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="relative z-10 mx-auto flex h-[calc(100vh-160px)] w-full max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-8 text-white shadow-[0_40px_120px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">РљРѕРјРїРµС‚РµРЅС†РёРё</span>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">РќР°РґС‘Р¶РЅРѕСЃС‚СЊ Рё РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ</h2>
              </div>
              <p className="max-w-xl text-sm text-white/70">
                Р”РѕРєСѓРјРµРЅС‚С‹, РїРѕРґС‚РІРµСЂР¶РґР°СЋС‰РёРµ РѕРїС‹С‚, СЃРѕРѕС‚РІРµС‚СЃС‚РІРёРµ СЃС‚Р°РЅРґР°СЂС‚Р°Рј ISO Рё С‚СЂРµР±РѕРІР°РЅРёСЏРј Р РѕСЃС‚РµС…РЅР°РґР·РѕСЂР°, Р° С‚Р°РєР¶Рµ РґРѕСЃС‚СѓРї Рє СЂР°Р±РѕС‚Р°Рј РЅР° РѕСЃРѕР±Рѕ РѕРїР°СЃРЅС‹С… Рё С‚РµС…РЅРёС‡РµСЃРєРё СЃР»РѕР¶РЅС‹С… РѕР±СЉРµРєС‚Р°С….
              </p>
            </div>

            <div ref={certificatesRef} className="mt-6 flex gap-6 overflow-x-auto scroll-smooth pb-4" aria-label="Certificates carousel">
              {certificates.map((certificate) => (
                <button
                  key={certificate.id}
                  type="button"
                  data-carousel-card
                  onClick={() => handleOpenCertificate(certificate)}
                  className="group w-72 shrink-0 rounded-3xl border border-white/15 bg-white/12 p-6 text-left shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-lg transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/18"
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-white/80">
                    <Image src={certificate.image} alt={certificate.alt} width={320} height={200} className="h-full w-full object-cover object-center" />
                  </div>
                  <div className="mt-4 flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-white">{certificate.title}</h3>
                    <p className="text-sm text-white/70">{certificate.number}</p>
                    <p className="text-sm text-white/65">Р’С‹РґР°РЅ: {certificate.issuedBy}</p>
                    <p className="text-xs text-white/50">Р”РµР№СЃС‚РІСѓРµС‚ РґРѕ {certificate.validTill}</p>
                  </div>
                  <span className="mt-3 inline-flex text-sm font-semibold text-white/70 transition group-hover:text-white">РџРѕРґСЂРѕР±РЅРµРµ</span>
                </button>
              ))}
            </div>

            {certificates.length > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                {certificates.map((certificate, index) => (
                  <button
                    key={certificate.id}
                    type="button"
                    onClick={() => goToCertificate(index)}
                    aria-label={`РџРµСЂРµР№С‚Рё Рє СЃРµСЂС‚РёС„РёРєР°С‚Сѓ ${certificate.title}`}
                    className={`h-2.5 w-8 rounded-full transition ${certificateIndex === index ? "bg-white/90" : "bg-white/30"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

                <section
          ref={sectionCallbacks[5]}
          id="contacts"
          className="relative flex min-h-[100dvh] w-full scroll-mt-32 items-center justify-center overflow-hidden bg-slate-950"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/10 to-transparent" />
          <div className="relative z-10 mx-auto flex h-[calc(100vh-160px)] w-full max-w-6xl flex-col rounded-[32px] border border-white/12 bg-white/10 px-6 py-8 text-white shadow-[0_40px_120px_rgba(10,20,45,0.45)] backdrop-blur-xl sm:px-10">
            <div className="flex flex-1 flex-col gap-8 lg:flex-row">
              <div className="flex flex-1 flex-col gap-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200/80">РљРѕРЅС‚Р°РєС‚С‹</span>
                  <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">РЎРІСЏР¶РёС‚РµСЃСЊ СЃ РЅР°С€РµР№ РєРѕРјР°РЅРґРѕР№</h2>
                  <p className="mt-4 max-w-xl text-sm text-white/70">
                    Р’С‹Р±РµСЂРёС‚Рµ РїСЂРѕС„РёР»СЊРЅРѕРіРѕ РјРµРЅРµРґР¶РµСЂР° РёР»Рё СѓРґРѕР±РЅС‹Р№ РєР°РЅР°Р» СЃРІСЏР·Рё. РњС‹ РѕС‚РІРµС‚РёРј РЅР° Р·Р°РїСЂРѕСЃ РІ СЂР°Р±РѕС‡РµРµ РІСЂРµРјСЏ Рё РїРѕРґРєР»СЋС‡РёРј РёРЅР¶РµРЅРµСЂРѕРІ РїРѕ РІР°С€РµРјСѓ РІРѕРїСЂРѕСЃСѓ.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {contactPersons.map((person) => (
                    <div key={person.email} className="rounded-3xl border border-white/15 bg-white/12 p-6 shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-lg">
                      <p className="text-lg font-semibold text-white">{person.name}</p>
                      <p className="text-sm text-white/70">{person.role}</p>
                      <div className="mt-4 space-y-2 text-sm text-white/70">
                        <a href={`tel:${person.phone.replace(/[^\d+]/g, "")}`} className="block font-semibold text-white hover:text-white/80">
                          {person.phone}
                        </a>
                        <EmailCopyLink email={person.email} className="font-semibold text-white/80 hover:text-white">
                          {person.email}
                        </EmailCopyLink>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="flex w-full max-w-md flex-col gap-6">
                <div className="rounded-3xl border border-white/15 bg-white/12 p-6 shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-lg">
                  <h3 className="text-xl font-semibold text-white">РњС‹ РІ РјРµСЃСЃРµРЅРґР¶РµСЂР°С…</h3>
                  <p className="mt-2 text-sm text-white/70">Р’С‹Р±РµСЂРёС‚Рµ СѓРґРѕР±РЅС‹Р№ РєР°РЅР°Р» Рё РїРѕР»СѓС‡РёС‚Рµ РѕС‚РІРµС‚ РІ Р±Р»РёР¶Р°Р№С€РµРµ СЂР°Р±РѕС‡РµРµ РІСЂРµРјСЏ.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {contactChannels.map((channel) => (
                      <a
                        key={channel.label}
                        href={channel.href}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
                        title={channel.tooltip}
                      >
                        <Image src={channel.icon} alt={channel.label} width={20} height={20} className="h-5 w-5 object-contain" />
                        {channel.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/12 p-6 shadow-[0_20px_60px_rgba(10,20,45,0.35)] backdrop-blur-lg">
                  <h3 className="text-xl font-semibold text-white">РџСЂСЏРјР°СЏ СЃРІСЏР·СЊ СЃ РґРёСЂРµРєС‚РѕСЂРѕРј</h3>
                  <p className="mt-3 text-sm text-white/70">РџРѕ РІРѕРїСЂРѕСЃР°Рј СЃРѕС‚СЂСѓРґРЅРёС‡РµСЃС‚РІР° Рё СЃС‚СЂР°С‚РµРіРёС‡РµСЃРєРёС… РїСЂРѕРµРєС‚РѕРІ.</p>
                  <div className="mt-4 space-y-2 text-sm font-semibold text-white">
                    <a href="tel:+74951234567" className="block hover:text-white/80">+7 (495) 123-45-67</a>
                    <EmailCopyLink email="info@stroyalliance.ru">info@stroyalliance.ru</EmailCopyLink>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

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
          <p className="text-sm text-slate-600">Р’С‹РґР°РЅ: {selectedCertificate.issuedBy}</p>
          <p className="text-sm text-slate-600">Р”РµР№СЃС‚РІСѓРµС‚: {selectedCertificate.validTill}</p>
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

