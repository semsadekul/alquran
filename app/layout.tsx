import type React from 'react';
import { Inter, Lora, Amiri, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { LocaleProvider } from '../components/providers/LocaleProvider';
import { ServiceWorkerProvider } from '../components/providers/ServiceWorkerProvider';
import { AuthProvider } from '../components/providers/AuthProvider';
import { PlayerProvider } from '../components/quran/PlayerProvider';
import { ToastProvider } from '../components/ui/Toast';
import { DesktopSidebar } from '../components/layout/DesktopSidebar';
import { MobileNav } from '../components/layout/MobileNav';
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

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali-ui',
  display: 'swap',
});

export const metadata = {
  // Set NEXT_PUBLIC_SITE_URL at deploy time (fallback is a placeholder).
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://al-quran.example.com'
  ),
  title: 'Al Quran — আল কুরআন',
  description:
    'Read, understand, and memorize the Holy Quran with elegant translations in Arabic, Bengali, and English.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Al Quran',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Al Quran — আল কুরআন',
    description:
      'Read, understand, and memorize the Holy Quran with elegant translations.',
    type: 'website',
    images: ['/og-image.svg'],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`min-h-screen bg-background text-text antialiased ${inter.variable} ${lora.variable} ${amiri.variable} ${hindSiliguri.variable}`}
      >
        <AuthProvider>
          <ThemeProvider>
            <LocaleProvider>
              <ToastProvider>
                <ServiceWorkerProvider>
                  <PlayerProvider>
                    <DesktopSidebar />
                    <div className="lg:pl-64">
                      <TopBar />
                      <main className="min-h-screen pb-24 sm:pb-20 lg:pb-0">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                          {children}
                        </div>
                      </main>
                    </div>
                    <MobileNav />
                  </PlayerProvider>
                </ServiceWorkerProvider>
              </ToastProvider>
            </LocaleProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
