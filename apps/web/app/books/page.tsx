import { PageShell } from '@/components/ui/PageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Islamic Books — Al Quran Ecosystem',
  description: 'Explore Islamic books and scholarly works in Bengali and English.',
};

export default function BooksPage() {
  return (
    <PageShell
      eyebrow="Books"
      title="Islamic Books"
      lede="Explore Islamic books and scholarly works in Bengali and English."
    >
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        }
        title="Coming Soon"
        hint="The Islamic Books library is currently under development. You will be able to explore scholarly works in Bengali and English in a future release."
        action={<Badge tone="neutral">Phase 3</Badge>}
      />
    </PageShell>
  );
}
