"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle lightning flashes + jagged bolts. Fills its positioned parent
 * (e.g. `SiteThunderBackdrop` for the whole site below the hero band).
 * Disabled when the user prefers reduced motion.
 */
export function ThunderstormBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    type Bolt = { segments: { x: number; y: number }[]; life: number };
    let bolts: Bolt[] = [];
    let flash = 0;
    let frame = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const spawnBolt = (w: number, h: number) => {
      const x0 = Math.random() * w;
      const segments: { x: number; y: number }[] = [{ x: x0, y: -4 }];
      let x = x0;
      let y = -4;
      while (y < h + 40) {
        x += (Math.random() - 0.5) * 72;
        y += 36 + Math.random() * 48;
        segments.push({ x, y });
      }
      bolts.push({ segments, life: 1 });
      flash = 0.45 + Math.random() * 0.35;
    };

    const loop = () => {
      frame += 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (flash > 0) {
        ctx.fillStyle = `rgba(186, 230, 253, ${flash * 0.06})`;
        ctx.fillRect(0, 0, w, h);
        flash *= 0.82;
        if (flash < 0.015) flash = 0;
      }

      if (w > 0 && h > 0 && Math.random() < 0.018) {
        spawnBolt(w, h);
      }

      bolts = bolts.filter((b) => {
        b.life -= 0.055;
        if (b.life <= 0) return false;
        const alpha = b.life * 0.85;
        ctx.strokeStyle = `rgba(224, 242, 254, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgba(56, 189, 248, 0.75)";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(b.segments[0].x, b.segments[0].y);
        for (let i = 1; i < b.segments.length; i++) {
          ctx.lineTo(b.segments[i].x, b.segments[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        return true;
      });

      if (frame % 4 === 0 && w > 0 && h > 0 && Math.random() < 0.04) {
        ctx.strokeStyle = "rgba(148, 197, 255, 0.12)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const gx = Math.random() * w;
          const gy = Math.random() * h;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + (Math.random() - 0.5) * 120, gy + (Math.random() - 0.5) * 120);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      aria-hidden
    />
  );
}
