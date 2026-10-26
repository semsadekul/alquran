import type React from 'react';
import { Inter, Lora, Amiri } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { LocaleProvider } from '../components/providers/LocaleProvider';
import { ServiceWorkerProvider } from '../components/providers/ServiceWorkerProvider';
import { AuthProvider } from '../components/providers/AuthProvider';
import { SyncProvider } from '../components/providers/SyncProvider';
import { PlayerProvider } from '../components/quran/PlayerProvider';
import { ToastProvider } from '../components/ui/Toast';
import { DesktopSidebar } from '../components/layout/DesktopSidebar';
import { getSiteUrl } from '../lib/seo';
import { MobileNav } from '../components/layout/MobileNav';
import { CommandPalette } from '../components/layout/CommandPalette';
import { TopBar } from '../components/layout/TopBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
});

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

// Bangla face — self-hosted font supplied in app/fonts/Bangla.ttf.
// One face serves both Bangla roles: the UI token (--font-bengali-ui) and,
// through the --font-bangla-display stack in globals.css, display headings.
const bangla = localFont({
  src: './fonts/Bangla.ttf',
  display: 'swap',
  variable: '--font-bengali-ui',
});

export const metadata = {
  // Canonical origin — see lib/seo.ts (NEXT_PUBLIC_SITE_URL at deploy time).
  metadataBase: getSiteUrl(),
  title: 'Al Quran — আল কুরআন',
  description:
    'Read, understand, and memorize the Holy Quran with elegant translations in Arabic, Bengali, and English.',
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    title: 'Al Quran',
    statusBarStyle: 'default',
  },
  // The share image is generated as a real PNG by app/opengraph-image.tsx —
  // many chat and social previewers do not render SVG.
  openGraph: {
    title: 'Al Quran — আল কুরআন',
    description:
      'Read, understand, and memorize the Holy Quran with elegant translations.',
    siteName: 'Al Quran',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al Quran — আল কুরআন',
    description:
      'Read, understand, and memorize the Holy Quran with elegant translations.',
  },
} satisfies import('next').Metadata;

export const viewport = {
  themeColor: '#b8964a',
  width: 'device-width',
  initialScale: 1,
} satisfies import('next').Viewport;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Font variables live on <html> (:root), not <body>: the --font-display and
    // --font-bangla-display tokens in globals.css reference them from :root, and
    // a custom property cannot resolve a variable defined on a descendant.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} ${amiri.variable} ${bangla.variable}`}
    >
      <body className="min-h-screen bg-background text-text antialiased">
        <AuthProvider>
          <SyncProvider>
            <ThemeProvider>
              <LocaleProvider>
                <ToastProvider>
                  <ServiceWorkerProvider>
                    <PlayerProvider>
                      <DesktopSidebar />
                      <div className="lg:pl-72">
                        <TopBar />
                        <main className="min-h-screen pb-24 sm:pb-20 lg:pb-0">
                          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            {children}
                          </div>
                        </main>
                      </div>
                      <MobileNav />
                      <CommandPalette />
                    </PlayerProvider>
                  </ServiceWorkerProvider>
                </ToastProvider>
              </LocaleProvider>
            </ThemeProvider>
          </SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
