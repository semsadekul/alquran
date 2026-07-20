import { PageShell } from '@/components/ui/PageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'AI Study Assistant — Al Quran Ecosystem',
  description: 'Ask questions and get answers with direct citations from the Quran and authenticated hadith collections.',
};

export default function AiPage() {
  return (
    <PageShell
      eyebrow="AI"
      title="Islamic Study Assistant"
      lede="Ask questions and get answers with direct citations from the Quran and authenticated hadith collections."
    >
      <EmptyState
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
            <path d="M9 21h6" />
            <path d="M10 17v4" />
            <path d="M14 17v4" />
          </svg>
        }
        title="Coming Soon"
        hint="The AI-powered study assistant is currently under development. You will be able to ask questions about Quran and Hadith with direct citations in a future release."
        action={<Badge tone="neutral">In Development</Badge>}
      />
    </PageShell>
  );
}
