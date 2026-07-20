import { PageShell } from '@/components/ui/PageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Teacher & Family — Al Quran Ecosystem',
  description: 'Tools for Islamic teachers, parents, and community leaders to guide study and track progress.',
};

export default function TeacherPage() {
  return (
    <PageShell
      eyebrow="Teacher & Family"
      title="Teacher & Family Mode"
      lede="Tools for Islamic teachers, parents, and community leaders to guide study and track progress."
    >
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        }
        title="Coming Soon"
        hint="Teacher and family tools are currently under development. Features like study plans, reading assignments, progress dashboards, and shared collections will be available in a future release."
        action={<Badge tone="neutral">In Development</Badge>}
      />
    </PageShell>
  );
}
