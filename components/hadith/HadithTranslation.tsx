import { splitByScript } from '@/lib/hadith-text';

/**
 * Renders a hadith's Bengali translation. Some entries quote the Qur'anic verse
 * in Arabic first; those runs are shown as right-aligned Arabic paragraphs, the
 * rest as normal Bengali text.
 */
export function HadithTranslation({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const segments = splitByScript(text);

  return (
    <div className={className}>
      {segments.map((segment, index) =>
        segment.arabic ? (
          <p
            key={index}
            dir="rtl"
            lang="ar"
            className="font-arabic text-gold-dark dark:text-gold-light text-right text-xl sm:text-2xl leading-[2.4] my-3 px-3 py-1.5 bg-surface-highlight/50 rounded-lg"
            style={{ fontFamily: 'var(--font-arabic)' }}
          >
            {segment.text.trim()}
          </p>
        ) : (
          <p key={index} className="whitespace-pre-line my-2 leading-[1.85] sm:leading-[1.95]">
            {segment.text.trim()}
          </p>
        )
      )}
    </div>
  );
}
