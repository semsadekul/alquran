import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Naskh_Arabic, Noto_Serif_Bengali, Hind_Siliguri } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { LocaleProvider } from '@/components/providers/LocaleProvider';
import { NativeProvider } from '@/components/providers/NativeProvider';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

/* ─── Self-hosted fonts (bundled at build time → works offline) ─── */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans-face',
  display: 'swap',
});

const arabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic-face',
  display: 'swap',
});

const bengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali-face',
  display: 'swap',
});

const bengaliUi = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali-ui-face',
  display: 'swap',
});

/* ─── Metadata ─── */
export const metadata: Metadata = {
  title: 'Al Quran - আল-কুরআন',
  description: 'Premium Bengali Quran reading and memorization platform.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a3622',
};

/* ─── Root Layout ─── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${arabic.variable} ${bengali.variable} ${bengaliUi.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* No-flash theme boot script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('alquran_theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}else{document.documentElement.dataset.theme=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}}catch(e){document.documentElement.dataset.theme='light'}})()`,
          }}
        />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text-1)] font-sans min-h-screen flex flex-col">
        <ThemeProvider>
          <LocaleProvider>
            <NativeProvider>
            <Header />

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-10 pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-10">
              {children}
            </main>

            {/* Footer (Desktop only) */}
            <footer className="hidden md:block w-full text-center py-8 text-white/60 text-sm bg-gradient-to-r from-[#0a3622] to-[#145338] border-t border-[#1a5e3f] mt-auto">
              <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-6">
                    <Link href="/" className="text-white/50 hover:text-[var(--color-majestic-gold)] transition-colors text-xs">Home</Link>
                    <Link href="/quran" className="text-white/50 hover:text-[var(--color-majestic-gold)] transition-colors text-xs">Quran</Link>
                    <Link href="/quran/hifz" className="text-white/50 hover:text-[var(--color-majestic-gold)] transition-colors text-xs">Hifz</Link>
                    <Link href="/duas" className="text-white/50 hover:text-[var(--color-majestic-gold)] transition-colors text-xs">Duas</Link>
                    <Link href="/offline" className="text-white/50 hover:text-[var(--color-majestic-gold)] transition-colors text-xs">Offline</Link>
                    <Link href="/settings" className="text-white/50 hover:text-[var(--color-majestic-gold)] transition-colors text-xs">Settings</Link>
                  </div>
                  <p className="text-white/40 text-[11px]">
                    © {new Date().getFullYear()} Al Quran — পবিত্র কুরআন
                  </p>
                </div>
              </div>
            </footer>

            <BottomNav />
            </NativeProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
