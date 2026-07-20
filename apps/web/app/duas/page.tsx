import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PageShell } from '@/components/ui/PageShell';
import { DuasListClient } from './DuasListClient';

interface DuaVerse {
  surah: number;
  ayah: number;
  arabic: string;
  bangla: string;
  english: string;
  transliteration: string;
}

interface DuaRef {
  surah: number;
  ayahStart: number;
  ayahEnd: number;
}

interface Dua {
  id: number;
  titleEn: string;
  titleBn: string;
  refs: DuaRef[];
  surahNameEn: string;
  surahNameBn: string;
  verses: DuaVerse[];
}

function getDuas(): Dua[] {
  const filePath = join(process.cwd(), 'public', 'data', 'duas.json');
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as Dua[];
  } catch {
    return [];
  }
}

export function generateStaticParams() {
  const duas = getDuas();
  return duas.map((dua) => ({ id: String(dua.id) }));
}

export default function DuasPage() {
  const duas = getDuas();

  return (
    <PageShell title="দু'আ / Duas" eyebrow="Rabbana Supplications">
      <DuasListClient duas={duas} />
    </PageShell>
  );
}
