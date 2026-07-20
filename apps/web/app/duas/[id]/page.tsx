import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PageShell } from '@/components/ui/PageShell';
import { DuaDetailClient } from './DuaDetailClient';

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

function getDuaById(id: number): Dua | undefined {
  return getDuas().find((d) => d.id === id);
}

export function generateStaticParams() {
  return getDuas().map((dua) => ({ id: String(dua.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dua = getDuaById(parseInt(id, 10));
  if (!dua) return { title: 'Not Found' };
  return {
    title: `${dua.titleBn} — ${dua.titleEn}`,
    description: `Rabbana dua from Surah ${dua.surahNameEn}: ${dua.titleEn}`,
  };
}

export default async function DuaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dua = getDuaById(parseInt(id, 10));
  if (!dua) notFound();

  return (
    <PageShell title={dua.titleBn} eyebrow={dua.titleEn}>
      <DuaDetailClient dua={dua} />
    </PageShell>
  );
}
