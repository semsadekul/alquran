// =====================================================
// SEO helpers — one place for the canonical site URL and
// per-surah metadata, so every route emits consistent tags.
// =====================================================

import type { Metadata } from 'next';
import type { Surah } from '@/lib/data/quran';

/** Used only when NEXT_PUBLIC_SITE_URL is not configured (local dev, CI). */
const FALLBACK_SITE_URL = 'https://alquran.insforge.site';

let warnedMissingSiteUrl = false;

/**
 * Canonical origin for the app. Set NEXT_PUBLIC_SITE_URL at deploy time;
 * the fallback keeps local builds working but must not reach production
 * (relative OG/canonical URLs would point at the wrong host).
 */
export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    try {
      return new URL(configured);
    } catch {
      if (!warnedMissingSiteUrl) {
        warnedMissingSiteUrl = true;
        console.warn(
          `[seo] NEXT_PUBLIC_SITE_URL is not a valid URL ("${configured}") — falling back to ${FALLBACK_SITE_URL}`
        );
      }
      return new URL(FALLBACK_SITE_URL);
    }
  }

  if (!warnedMissingSiteUrl) {
    warnedMissingSiteUrl = true;
    console.warn(
      `[seo] NEXT_PUBLIC_SITE_URL is not set — using ${FALLBACK_SITE_URL} for canonical and Open Graph URLs.`
    );
  }
  return new URL(FALLBACK_SITE_URL);
}

/** Absolute URL for a path such as `/quran/surahs/2`. */
export function absoluteUrl(pathname: string): string {
  return new URL(pathname, getSiteUrl()).toString();
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * schema.org BreadcrumbList. Each item's URL is absolute so crawlers can follow
 * it without relying on the page's own host.
 */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * schema.org Article for a single ayah. Declares all three languages the page
 * carries (Arabic, Bengali, English) so search engines index each translation.
 */
export function ayahArticleJsonLd(args: {
  headline: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.headline,
    description: args.description,
    inLanguage: ['ar', 'bn', 'en'],
    url: absoluteUrl(args.path),
    mainEntityOfPage: absoluteUrl(args.path),
    publisher: { '@type': 'Organization', name: 'Al Quran' },
  };
}

/**
 * Title, description, canonical and social tags for a surah page.
 * Bengali text is kept in the description because that is how readers in
 * Bangladesh search for a surah.
 */
export function buildSurahMetadata(surah: Surah): Metadata {
  const title = `${surah.englishName} — Al Quran`;
  const description =
    `Read Surah ${surah.englishName} (${surah.banglaName}) — ${surah.numberOfAyahs} ` +
    `ayahs, ${surah.revelationType} — with Arabic text, Bengali and English ` +
    `translation and recitation audio.`;
  const path = `/quran/surahs/${surah.number}`;
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'Al Quran',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * schema.org FAQPage for rich search engine Q&A snippets.
 */
export function faqPageJsonLd(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * schema.org AudioObject for rich Google audio & recitation indexing.
 */
export function audioObjectJsonLd(args: {
  name: string;
  description: string;
  contentUrl: string;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: args.name,
    description: args.description,
    contentUrl: args.contentUrl,
    duration: args.duration || 'PT2M',
    encodingFormat: 'audio/mpeg',
  };
}
