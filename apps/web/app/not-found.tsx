import Link from 'next/link';
import { PageShell } from '@/components/ui/PageShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <PageShell>
      <EmptyState
        icon={<Home size={48} />}
        title="Page Not Found"
        hint="The page you're looking for doesn't exist or has been moved."
        action={
          <Button href="/" variant="primary">
            Go Home
          </Button>
        }
      />
    </PageShell>
  );
}
