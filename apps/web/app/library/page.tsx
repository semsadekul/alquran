import Link from 'next/link';

const sections = [
  { title: 'Bookmarks', description: 'Verses you saved for recitation, study, or memorization.', href: '/library/bookmarks' },
  { title: 'Highlights', description: 'Passages you highlighted during study.', href: '/library/highlights' },
  { title: 'Notes', description: 'Your study notes attached to verses and hadith.', href: '/library/notes' },
  { title: 'Collections', description: 'Organized study collections of verses and passages.', href: '/library/collections' }
];

export default function LibraryPage() {
  return (
    <div className="shell">
      <section className="hero">
        <p className="eyebrow">Library</p>
        <h1>লাইব্রেরি</h1>
        <p className="lede">Bookmarks, highlights, notes, and collections from your study sessions.</p>
      </section>

      <section className="grid">
        {sections.map(section => (
          <Link className="card card-link" href={section.href} key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
