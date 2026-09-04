import React, { useEffect, useRef } from 'react';
import { RitualType } from '../types';

interface ReleaseRitualCanvasProps {
  ritualType: RitualType;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  burdenSnippet?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  rotation?: number;
  vRot?: number;
  flickerSpeed?: number;
  flickerPhase?: number;
}

interface AmbientStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
}

export const ReleaseRitualCanvas: React.FC<ReleaseRitualCanvasProps> = ({
  ritualType,
  isAnimating,
  onAnimationComplete,
  burdenSnippet = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ambientStarsRef = useRef<AmbientStar[]>([]);
  const ritualProgressRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(isAnimating);

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
    if (isAnimating) {
      ritualProgressRef.current = 0;
      initRitualParticles();
    }
  }, [isAnimating, ritualType]);

  const initRitualParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    particlesRef.current = [];

    if (ritualType === 'stardust') {
      // Create 250 glowing stardust particles
      const colors = ['#e0e7ff', '#fef08a', '#c084fc', '#93c5fd', '#f472b6', '#a7f3d0'];
      for (let i = 0; i < 280; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 5.5;
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 120,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2, // bias upwards
          size: 1.5 + Math.random() * 3.5,
          alpha: 1,
          decay: 0.003 + Math.random() * 0.005,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08,
          flickerSpeed: 0.05 + Math.random() * 0.1,
          flickerPhase: Math.random() * Math.PI * 2,
        });
      }
    } else if (ritualType === 'lantern') {
      // 1 Main lantern + floating warm sparks
      for (let i = 0; i < 120; i++) {
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 60,
          y: centerY + 40 + Math.random() * 60,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -0.8 - Math.random() * 2,
          size: 1.2 + Math.random() * 2.5,
          alpha: 0.9,
          decay: 0.006 + Math.random() * 0.008,
          color: '#fbbf24',
        });
      }
    } else if (ritualType === 'waves') {
      // Moonlit wave particles
      for (let i = 0; i < 200; i++) {
        particlesRef.current.push({
          x: Math.random() * w,
          y: centerY + (Math.random() - 0.5) * 180,
          vx: 1.5 + Math.random() * 3.0,
          vy: Math.sin(i) * 0.8,
          size: 1.5 + Math.random() * 3,
          alpha: 0.8,
          decay: 0.004 + Math.random() * 0.006,
          color: '#67e8f9',
        });
      }
    } else if (ritualType === 'candle') {
      // Soft flame & lilac smoke particles
      for (let i = 0; i < 180; i++) {
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 30,
          y: centerY + 20,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -1.5 - Math.random() * 3,
          size: 2 + Math.random() * 5,
          alpha: 0.85,
          decay: 0.004 + Math.random() * 0.006,
          color: i % 2 === 0 ? '#fb923c' : '#c084fc',
        });
      }
    } else if (ritualType === 'bubbles') {
      // Iridescent bubbles floating
      for (let i = 0; i < 45; i++) {
        particlesRef.current.push({
          x: centerX + (Math.random() - 0.5) * 260,
          y: centerY + (Math.random() - 0.5) * 120,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -0.8 - Math.random() * 2.2,
          size: 8 + Math.random() * 22,
          alpha: 0.75,
          decay: 0.003 + Math.random() * 0.004,
          color: '#a5f3fc',
        });
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

      // Re-init ambient stars
      ambientStarsRef.current = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 5000);
      for (let i = 0; i < starCount; i++) {
        ambientStarsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 0.6 + Math.random() * 1.8,
          baseAlpha: 0.2 + Math.random() * 0.6,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let time = 0;
    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw subtle ambient stars in background
      ambientStarsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.phase);
        const currentAlpha = Math.max(0.1, Math.min(1, star.baseAlpha + twinkle * 0.3));
        ctx.fillStyle = `rgba(224, 231, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. If ritual animation is active
      if (isAnimatingRef.current) {
        ritualProgressRef.current += 0.005;
        const progress = ritualProgressRef.current;

        // Custom ritual scene renderings
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (ritualType === 'lantern') {
          // Draw ascending glowing lantern
          const lanternY = centerY - progress * (canvas.height * 0.7);
          const lanternX = centerX + Math.sin(progress * 8) * 20;
          const lanternAlpha = Math.max(0, 1 - progress * 0.8);
          const lanternScale = Math.max(0.4, 1 - progress * 0.5);

          ctx.save();
          ctx.translate(lanternX, lanternY);
          ctx.scale(lanternScale, lanternScale);
          ctx.globalAlpha = lanternAlpha;

          // Lantern outer halo glow
          const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, 80);
          grad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
          grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, 80, 0, Math.PI * 2);
          ctx.fill();

          // Lantern body
          ctx.fillStyle = 'rgba(254, 243, 199, 0.9)';
          ctx.beginPath();
          ctx.roundRect(-22, -32, 44, 64, 8);
          ctx.fill();

          // Inner warm flame core
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 10, 10 + Math.sin(time * 10) * 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 12, 5, 0, Math.PI * 2);
          ctx.fill();

          // Lantern frame lines
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-22, -32, 44, 64);
          ctx.beginPath();
          ctx.moveTo(0, -32);
          ctx.lineTo(0, 32);
          ctx.stroke();

          ctx.restore();
        } else if (ritualType === 'waves') {
          // Draw moonlit tidal wave overlay
          const waveY = canvas.height * (1 - progress * 1.1);
          ctx.save();
          ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
          ctx.beginPath();
          ctx.moveTo(0, waveY);
          for (let x = 0; x <= canvas.width; x += 20) {
            const y = waveY + Math.sin(x * 0.015 + time * 3) * 18;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();
          ctx.fill();

          // Secondary wave crest
          ctx.strokeStyle = 'rgba(165, 243, 252, 0.4)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.restore();
        }

        // Draw and update active particles
        let activeCount = 0;
        particlesRef.current.forEach((p) => {
          if (p.alpha > 0.01) {
            activeCount++;
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            // Optional twinkle
            let renderAlpha = p.alpha;
            if (p.flickerSpeed && p.flickerPhase !== undefined) {
              p.flickerPhase += p.flickerSpeed;
              renderAlpha = Math.max(0, Math.min(1, p.alpha * (0.6 + 0.4 * Math.sin(p.flickerPhase))));
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, renderAlpha);

            if (ritualType === 'stardust') {
              // Draw 4-point star sparkle
              ctx.translate(p.x, p.y);
              if (p.rotation !== undefined && p.vRot !== undefined) {
                p.rotation += p.vRot;
                ctx.rotate(p.rotation);
              }
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 8;
              ctx.beginPath();
              // Diamond / Star shape
              const s = p.size;
              ctx.moveTo(0, -s * 2);
              ctx.lineTo(s * 0.6, 0);
              ctx.lineTo(0, s * 2);
              ctx.lineTo(-s * 0.6, 0);
              ctx.closePath();
              ctx.fill();
            } else if (ritualType === 'bubbles') {
              // Draw glossy bubble
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(165, 243, 252, 0.15)';
              ctx.fill();
              ctx.strokeStyle = 'rgba(224, 231, 255, 0.6)';
              ctx.lineWidth = 1.2;
              ctx.stroke();
              // Bubble highlight
              ctx.beginPath();
              ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
              ctx.fill();
            } else {
              // Standard glowing orb / smoke
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.fill();
            }

            ctx.restore();
          }
        });

        // Check if animation is finished
        if (progress >= 1.0 || (progress > 0.4 && activeCount === 0)) {
          isAnimatingRef.current = false;
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [onAnimationComplete, ritualType]);

  return (
    <canvas
      id="night-ritual-canvas"
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
