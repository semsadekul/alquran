export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in" aria-busy="true">
      <div className="h-6 w-40 bg-surface-highlight rounded mb-8 shimmer" />
      <div className="space-y-6">
        <div className="h-36 rounded-xl shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl shimmer"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl shimmer"
              style={{ animationDelay: `${(i + 6) * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
