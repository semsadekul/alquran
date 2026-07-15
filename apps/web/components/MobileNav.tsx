'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function MobileNav({ links }: { links: { label: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        style={{ display: 'none' }} /* Will be shown via CSS media query */
      >
        <Menu size={24} />
      </button>

      {isOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsOpen(false)}>
          <nav className="mobile-nav-content" onClick={e => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <span className="topbar-brand">Al Quran</span>
              <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <div className="mobile-nav-links">
              {links.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="mobile-nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
