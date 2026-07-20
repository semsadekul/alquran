import Link from 'next/link';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Bookmark, Highlighter, FileText, FolderOpen } from 'lucide-react';

const sections = [
  {
    title: 'Bookmarks',
    description: 'Verses you saved for recitation, study, or memorization.',
    href: '/library/bookmarks',
    icon: Bookmark,
  },
  {
    title: 'Highlights',
    description: 'Passages you highlighted during study.',
    href: '/library/highlights',
    icon: Highlighter,
  },
  {
    title: 'Notes',
    description: 'Your study notes attached to verses and hadith.',
    href: '/library/notes',
    icon: FileText,
  },
  {
    title: 'Collections',
    description: 'Organized study collections of verses and passages.',
    href: '/library/collections',
    icon: FolderOpen,
  },
];

export default function LibraryPage() {
  return (
    <PageShell
      title="লাইব্রেরি"
      eyebrow="Library"
      lede="Bookmarks, highlights, notes, and collections from your study sessions."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link href={section.href} key={section.title}>
              <Card variant="interactive" className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-subtle flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{section.title}</h3>
                  <p className="text-sm text-ink-3 mt-0.5">{section.description}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
