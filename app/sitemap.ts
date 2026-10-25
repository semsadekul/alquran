import type { MetadataRoute } from 'next';
import { getSurahs } from '@/lib/data/quran';
import { getSiteUrl } from '@/lib/seo';

/**
 * Sitemap for the three-page-per-surah era: one entry per surah today, and
 * the shape stays valid once individual ayah pages are added.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: new URL('/', siteUrl).toString(), lastModified, changeFrequency: 'daily', priority: 1 },
    {
      url: new URL('/quran/library', siteUrl).toString(),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: new URL('/surah', siteUrl).toString(),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: new URL('/search', siteUrl).toString(),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: new URL('/duas', siteUrl).toString(),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: new URL('/stats', siteUrl).toString(),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const surahPages: MetadataRoute.Sitemap = getSurahs().map((surah) => ({
    url: new URL(`/quran/surahs/${surah.number}`, siteUrl).toString(),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // One entry per real ayah (6,236). Stays well under the 50,000-URL limit for
  // a single sitemap file, so no index file is needed yet.
  const ayahPages: MetadataRoute.Sitemap = getSurahs().flatMap((surah) =>
    Array.from({ length: surah.numberOfAyahs }, (_, i) => ({
      url: new URL(`/quran/surahs/${surah.number}/${i + 1}`, siteUrl).toString(),
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  );

  return [...staticPages, ...surahPages, ...ayahPages];
}
