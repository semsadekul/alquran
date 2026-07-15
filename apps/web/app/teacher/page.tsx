'use client';

import Link from 'next/link';

const features = [
  {
    title: 'Shared Collections',
    description: 'Create study collections and share them with students or family members.',
    status: 'Available'
  },
  {
    title: 'Study Plans',
    description: 'Design structured study plans with daily reading assignments and progress tracking.',
    status: 'Coming soon'
  },
  {
    title: 'Reading Assignments',
    description: 'Assign specific surahs, hadith, or book chapters to students with due dates.',
    status: 'Coming soon'
  },
  {
    title: 'Progress Dashboard',
    description: 'Monitor student reading progress, streaks, and completion rates.',
    status: 'Coming soon'
  },
  {
    title: 'Family Mode',
    description: 'Shared family account with individual reading profiles and parental controls.',
    status: 'Coming soon'
  },
  {
    title: 'Mosque Display',
    description: 'Optimized display mode for mosque screens with large Arabic text and translation.',
    status: 'Coming soon'
  }
];

export default function TeacherPage() {
  return (
    <div className="page-container">
      <section className="page-hero">
        <p className="eyebrow">Teacher & Family</p>
        <h1>Teacher & Family Mode</h1>
        <p className="lede">
          Tools for Islamic teachers, parents, and community leaders to guide study and track progress.
        </p>
      </section>

      <div className="card-grid">
        {features.map(feature => (
          <div className="card" key={feature.title}>
            <div className="card-badge-row">
              <span className={`card-badge ${feature.status === 'Available' ? 'badge-available' : 'badge-coming'}`}>
                {feature.status}
              </span>
            </div>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="teacher-cta">
        <h2>Start Teaching</h2>
        <p>
          Create a shared collection to get started. Add verses and hadith to a collection,
          then share the link with your students or family.
        </p>
        <Link className="reader-nav-btn" href="/library/collections">
          Go to Collections →
        </Link>
      </div>
    </div>
  );
}
