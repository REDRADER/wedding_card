"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatFullDate, formatTime, formatWeekday } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import type { TemplateTheme } from "@/lib/templates";

// Heart outline in a 1x1 box: [startX, startY, ...cubic segments as 6-tuples]
const START: [number, number] = [0.5, 1];
const CURVES: [number, number, number, number, number, number][] = [
  [0.22, 0.8, 0, 0.58, 0, 0.32],
  [0, 0.14, 0.13, 0, 0.29, 0],
  [0.39, 0, 0.46, 0.05, 0.5, 0.14],
  [0.54, 0.05, 0.61, 0, 0.71, 0],
  [0.87, 0, 1, 0.14, 1, 0.32],
  [1, 0.58, 0.78, 0.8, 0.5, 1],
];
const SVG_HEART = `M${START.join(",")} ${CURVES.map((c) => `C${c.join(",")}`).join(" ")} Z`;

function heartPath(w: number, h: number) {
  const p = new Path2D();
  p.moveTo(START[0] * w, START[1] * h);
  for (const [a, b, c, d, e, f] of CURVES) p.bezierCurveTo(a * w, b * h, c * w, d * h, e * w, f * h);
  p.closePath();
  return p;
}

const REVEAL_AT = 0.5;
const BRUSH = 34;

export function ScratchCard({
  theme,
  date,
  time,
  label,
}: {
  theme: TemplateTheme;
  date: string;
  time: string;
  label: string;
}) {
  const { t, locale } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const { width: w, height: h } = wrap.getBoundingClientRect();
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.clip(heartPath(w, h));

    const [g0, g1, g2] = theme.scratch.gradient;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, g0);
    grad.addColorStop(0.5, g1);
    grad.addColorStop(1, g2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const shine = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, w * 0.6);
    shine.addColorStop(0, "rgba(255,255,255,0.55)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, w, h);

    // Glitter
    const specks = Math.round((w * h) / 18);
    for (let i = 0; i < specks; i++) {
      const rgb = theme.scratch.speck[i % 3];
      ctx.fillStyle = `rgba(${rgb}, ${0.25 + Math.random() * 0.5})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${theme.scratch.sparkle}, ${0.6 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.4 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, [theme]);

  useEffect(() => {
    paint();
    // Repaint only on width changes; mobile URL-bar resizes would otherwise wipe progress.
    let lastWidth = wrapRef.current?.getBoundingClientRect().width;
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== lastWidth) {
        lastWidth = entry.contentRect.width;
        paint();
      }
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [paint]);

  function point(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function scratch(to: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH;
    ctx.beginPath();
    const from = last.current ?? to;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y);
    ctx.stroke();
    last.current = to;
  }

  function clearedRatio() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    const inside = heartPath(canvas.width / dpr, canvas.height / dpr);
    const probe = document.createElement("canvas").getContext("2d")!;
    let total = 0;
    let clear = 0;
    const step = Math.max(4, Math.round(6 * dpr));
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        if (!probe.isPointInPath(inside, x / dpr, y / dpr)) continue;
        total++;
        if (data[(y * canvas.width + x) * 4 + 3] < 40) clear++;
      }
    }
    return total ? clear / total : 0;
  }

  function check() {
    if (!revealed && clearedRatio() >= REVEAL_AT) setRevealed(true);
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={wrapRef}
        className="relative aspect-[1/0.95] w-[210px] drop-shadow-[0_12px_20px_rgba(140,90,130,0.3)] md:w-[240px]"
      >
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <radialGradient id="reveal-bg" cx="0.4" cy="0.3" r="0.8">
              <stop offset="0" stopColor={theme.colors.cream} />
              <stop offset="1" stopColor={theme.colors.field} />
            </radialGradient>
          </defs>
          <path d={SVG_HEART} fill="url(#reveal-bg)" />
          <path
            d={SVG_HEART}
            fill="none"
            stroke={theme.colors.primary}
            strokeOpacity="0.55"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            transform="translate(0.04 0.04) scale(0.92)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-6 text-center">
          <p className="mb-1 font-calligraphic text-xl italic text-primary">{label}</p>
          <p className="font-display text-base font-semibold text-foreground">{formatFullDate(date, locale)}</p>
          <p className="font-calligraphic text-sm text-primary">{formatWeekday(date, locale)}</p>
          <p className="mt-1 text-[10px] text-muted rtl:text-xs">{formatTime(time, locale)}</p>
        </div>

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 size-full cursor-grab touch-none transition-opacity duration-700 active:cursor-grabbing ${
            revealed ? "pointer-events-none opacity-0" : ""
          }`}
          aria-label={t.scratchAria}
          role="img"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            last.current = null;
            scratch(point(e));
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            scratch(point(e));
            if (++moves.current % 12 === 0) check();
          }}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
            check();
          }}
          onPointerCancel={() => {
            drawing.current = false;
            last.current = null;
          }}
        />
        {revealed && <Confetti colors={theme.confetti} />}
      </div>
      {!revealed && (
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted/80 rtl:text-sm">{t.scratchHint}</p>
      )}
    </div>
  );
}

function Confetti({ colors }: { colors: string[] }) {
  const [pieces] = useState(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 320,
      y: -Math.random() * 220 - 40,
      r: Math.random() * 540 - 270,
      color: colors[i % colors.length],
      w: 5 + Math.random() * 5,
    })),
  );
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.w, height: p.w * 0.6, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
