'use client';

import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      if (documentHeight === windowHeight) {
        setProgress(0);
      } else {
        const scrolled = (scrollTop / (documentHeight - windowHeight)) * 100;
        setProgress(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '2px',
        backgroundColor: 'var(--accent)',
        zIndex: 100,
        transition: 'width 100ms ease-out'
      }}
    />
  );
}
