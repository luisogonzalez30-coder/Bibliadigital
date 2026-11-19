import type { MetadataRoute } from "next";
import { BIBLE_BOOKS } from "@/data/bible/books";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/biblia`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];
  for (const b of BIBLE_BOOKS) {
    pages.push({ url: `${SITE_URL}/biblia/${b.slug}`, changeFrequency: "yearly", priority: 0.6 });
    for (let c = 1; c <= b.chapters; c++) {
      pages.push({ url: `${SITE_URL}/biblia/${b.slug}/${c}`, changeFrequency: "yearly", priority: 0.5 });
    }
  }
  return pages;
}
