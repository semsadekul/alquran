'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const PALETTE = [
  '#D4AF37', // Classic Gold
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#0B1F1A', // Deep Forest
  '#E6C875', // Light Gold
  '#F7F2E7', // Cream
];

export interface ConfettiProps {
  duration?: number;
  trigger?: boolean;
  onComplete?: () => void;
}

export function Confetti({ duration = 3500, trigger = true, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: height / 3 + (Math.random() - 0.5) * 80,
        size: Math.random() * 8 + 4,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        speedX: (Math.random() - 0.5) * 14,
        speedY: (Math.random() - 0.7) * 16,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        opacity: 1,
      });
    }

    let animId: number;
    const startTime = performance.now();

    const render = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height);
        onCompleteRef.current?.();
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const progress = elapsed / duration;
      const fade = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.35; // gentle gravity
        p.speedX *= 0.98; // air resistance
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity * Math.max(0, fade);

        // Ornate rectangular & diamond confetti flakes
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [duration, trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100]"
      aria-hidden="true"
    />
  );
}
