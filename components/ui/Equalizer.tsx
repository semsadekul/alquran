/**
 * Animated equalizer — subtle "now playing" indicator.
 * Three bars bounce with staggered timing; color follows `currentColor`.
 * Purely decorative (aria-hidden); pauses under reduced motion.
 */
export function Equalizer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex items-end gap-[2.5px] h-4 ${className ?? ''}`}
    >
      <span className="equalizer-bar" />
      <span className="equalizer-bar" />
      <span className="equalizer-bar" />
    </span>
  );
}
