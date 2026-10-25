import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Offline — Al Quran',
  description: 'You are offline. Surahs you have already opened are still available.',
  robots: { index: false },
};

/**
 * Offline shell. Public/sw.js precaches this document so an uncached page
 * opened without a connection lands here instead of on the home page.
 */
export default function OfflinePage() {
  return (
    <div className="max-w-2xl mx-auto py-16 animate-fade-in">
      <Card variant="hero" className="p-8 md:p-10 text-center">
        <div className="mb-6 text-5xl" aria-hidden="true">
          📖
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-semibold text-text mb-2">
          You are offline
        </h1>
        <p className="bangla-ui text-lg text-text-muted mb-6">
          আপনি অফলাইনে আছেন
        </p>

        <p className="text-text/80 mb-2">
          Surahs you have already opened are still available to read from this
          device.
        </p>
        <p className="bangla-ui text-text/80 mb-8">
          আপনি আগে যে সূরাগুলো খুলেছেন সেগুলো এখনও পড়তে পারবেন। বাকিগুলো দেখতে
          ইন্টারনেট সংযোগ প্রয়োজন।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/quran/library">
            <Button variant="primary">Open surah library</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Try again</Button>
          </Link>
        </div>

        <p className="text-xs text-text-muted mt-8">
          Tip: pages load again as soon as your connection returns.
        </p>
      </Card>
    </div>
  );
}
