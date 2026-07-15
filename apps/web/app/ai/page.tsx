'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

type AiMode = 'ask-quran' | 'ask-hadith' | 'topic';

interface Citation {
  source: 'quran' | 'hadith';
  reference: string;
  arabic?: string;
  bangla?: string;
  english?: string;
  surah?: number;
  ayah?: number;
  collection?: string;
}

interface AiResponse {
  answer: string;
  citations: Citation[];
  disclaimer: string;
}

export default function AiPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<AiMode>('ask-quran');
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = useCallback(async () => {
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    setLoading(true);
    try {
      const endpoint = mode === 'ask-quran'
        ? `/api/ai/ask-quran?q=${encodeURIComponent(trimmed)}`
        : mode === 'ask-hadith'
        ? `/api/ai/ask-hadith?q=${encodeURIComponent(trimmed)}`
        : `/api/ai/topic?q=${encodeURIComponent(trimmed)}`;

      const res = await fetch(endpoint);
      if (res.ok) {
        setResponse(await res.json());
      }
    } catch {
      // Will handle error state
    } finally {
      setLoading(false);
    }
  }, [query, mode]);

  const modes: Array<{ value: AiMode; label: string; desc: string }> = [
    { value: 'ask-quran', label: 'Ask Quran', desc: 'Find answers from the Holy Quran' },
    { value: 'ask-hadith', label: 'Ask Hadith', desc: 'Find answers from authenticated hadith' },
    { value: 'topic', label: 'Topic Explorer', desc: 'Explore a topic across Quran and Hadith' }
  ];

  return (
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">AI</p>
        <h1>Islamic Study Assistant</h1>
        <p className="lede">
          Ask questions and get answers with direct citations from the Quran and authenticated hadith collections.
        </p>
      </section>

      <div className="ai-mode-selector">
        {modes.map(m => (
          <button
            key={m.value}
            className={`ai-mode-btn ${mode === m.value ? 'active' : ''}`}
            onClick={() => setMode(m.value)}
          >
            <strong>{m.label}</strong>
            <small>{m.desc}</small>
          </button>
        ))}
      </div>

      <div className="search-box">
        <input
          className="search-input"
          type="text"
          placeholder={
            mode === 'ask-quran'
              ? 'Ask a question about the Quran…'
              : mode === 'ask-hadith'
              ? 'Ask a question about hadith…'
              : 'Enter a topic to explore…'
          }
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
        />
        <button className="search-btn" onClick={handleAsk} disabled={loading}>
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>

      {response && (
        <div className="ai-response">
          <p className="ai-answer">{response.answer}</p>

          <div className="ai-citations">
            <h3>Sources</h3>
            {response.citations.map((c, i) => (
              <div className="ai-citation-card" key={i}>
                <div className="ai-citation-header">
                  <span className="ai-citation-source">{c.source === 'quran' ? 'Quran' : 'Hadith'}</span>
                  <span className="ai-citation-ref">{c.reference}</span>
                </div>
                {c.arabic && <div className="ai-citation-arabic">{c.arabic}</div>}
                {c.bangla && <p className="ai-citation-bangla">{c.bangla}</p>}
                {c.english && <p className="ai-citation-english">{c.english}</p>}
                {c.surah && c.ayah && (
                  <Link className="ai-citation-link" href={`/quran/surahs/${c.surah}`}>
                    Open in reader →
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p className="ai-disclaimer">{response.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
