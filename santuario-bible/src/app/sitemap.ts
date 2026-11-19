import type { MetadataRoute } from "next";
import { BIBLE_BOOKS } from "@/data/bible/books";
import { EMOTION_PAGES } from "@/data/emotionPages";
import { READING_PLANS } from "@/data/readingPlans";
import { STORIES } from "@/data/stories";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/biblia`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/planes`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/historias`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];
  for (const p of READING_PLANS) pages.push({ url: `${SITE_URL}/planes/${p.id}`, changeFrequency: "monthly", priority: 0.7 });
  for (const s of STORIES) pages.push({ url: `${SITE_URL}/historias/${s.id}`, changeFrequency: "monthly", priority: 0.7 });
  for (const e of EMOTION_PAGES) pages.push({ url: `${SITE_URL}/versiculos/${e.slug}`, changeFrequency: "monthly", priority: 0.8 });
  for (const b of BIBLE_BOOKS) {
    pages.push({ url: `${SITE_URL}/biblia/${b.slug}`, changeFrequency: "yearly", priority: 0.6 });
    for (let c = 1; c <= b.chapters; c++) {
      pages.push({ url: `${SITE_URL}/biblia/${b.slug}/${c}`, changeFrequency: "yearly", priority: 0.5 });
    }
  }
  return pages;
}
