export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
      <div
        aria-hidden="true"
        className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
        style={{
          background: 'linear-gradient(135deg, var(--gold-light), var(--gold-dark))',
          color: '#fffdf8',
          fontSize: '3rem',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
        }}
      >
        404
      </div>
      <h1 className="font-display text-2xl font-semibold text-text mb-2">
        Page not found
      </h1>
      <p className="text-text-muted mb-8">
        The page you are looking for may have been removed or is temporarily
        unavailable.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gold text-[#1a1814] hover:bg-gold-dark font-medium transition-colors text-sm shadow-soft"
      >
        Go home
      </a>
    </div>
  );
}
