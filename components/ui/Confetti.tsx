'use client';

import { useState, useEffect } from 'react';

interface ConfettiProps {
  trigger: boolean;
  duration?: number;
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'star';
}

const COLORS = ['#d4af37', '#059669', '#3b82f6', '#f59e0b', '#e11d48', '#a855f7', '#06b6d4'];

const SHAPES: Particle['shape'][] = ['circle', 'square', 'star'];

export function Confetti({ trigger, duration = 2000, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const newParticles: Particle[] = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 8,
      velocityY: 2 + Math.random() * 4,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }));

    setParticles(newParticles);
    setActive(true);

    const timer = setTimeout(() => {
      setActive(false);
      setParticles([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [trigger, duration, onComplete]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'square' ? '2px' : '0',
            // @ts-ignore - CSS custom properties
            '--confetti-x': `${p.velocityX * 12}px`,
            '--confetti-rotate': `${p.rotation + 360}deg`,
            clipPath: p.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : undefined,
          }}
        />
      ))}
    </div>
  );
}
