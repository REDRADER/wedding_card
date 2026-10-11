"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { formatNumber } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import { Blossom } from "./Decor";

export type Tone = "blush" | "lilac" | "mint" | "sky" | "butter";
export const TONES: Tone[] = ["blush", "lilac", "mint", "sky", "butter"];

// Full class names so Tailwind can see them.
const TONE_CLASSES: Record<Tone, { card: string; badge: string }> = {
  blush: { card: "from-blush/80", badge: "bg-blush" },
  lilac: { card: "from-lilac/80", badge: "bg-lilac" },
  mint: { card: "from-mint/80", badge: "bg-mint" },
  sky: { card: "from-sky/80", badge: "bg-sky" },
  butter: { card: "from-butter/90", badge: "bg-butter" },
};

/** A frosted pastel card with a numbered heading. */
export function Section({
  id,
  icon: Icon,
  title,
  index,
  tone = "blush",
  children,
}: {
  id?: string;
  icon?: LucideIcon;
  title?: string;
  /** Shown as "01", "02", ... above the title. */
  index?: number;
  tone?: Tone;
  children: ReactNode;
}) {
  const { locale } = useI18n();
  const toneClass = TONE_CLASSES[tone];
  return (
    <section id={id} className="relative px-4 py-5 md:px-8 md:py-7">
      <motion.div
        className={`relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-b ${toneClass.card} to-white/60 px-6 py-12 text-center shadow-[0_24px_60px_-34px_rgba(110,80,130,0.55)] backdrop-blur-md md:px-12 md:py-14`}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <Blossom
          className="pointer-events-none absolute -end-6 -top-6 size-24 opacity-40"
          petal="#ffffff"
          heart="#f3c1cc"
        />
        {(Icon || title) && (
          <header className="mb-8">
            <div className="mb-4 flex items-center justify-center gap-3">
              {index !== undefined && (
                <span className="font-display text-xs tracking-[0.3em] text-primary/80 tabular-nums">
                  {formatNumber(index, locale, 2)}
                </span>
              )}
              {Icon && (
                <span
                  className={`flex size-9 items-center justify-center rounded-full ${toneClass.badge} ring-4 ring-white/70`}
                >
                  <Icon className="size-4 text-primary" strokeWidth={1.7} aria-hidden />
                </span>
              )}
            </div>
            {title && (
              <h2 className="mb-4 font-display text-3xl font-medium tracking-wide text-ink md:text-4xl rtl:text-4xl md:rtl:text-5xl">
                {title}
              </h2>
            )}
            <Ornament />
          </header>
        )}
        {children}
      </motion.div>
    </section>
  );
}

/** Thin line, blossom, thin line. */
export function Ornament({ className = "", wide = false }: { className?: string; wide?: boolean }) {
  const line = wide ? "w-20" : "w-12";
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className={`h-px ${line} bg-gradient-to-r from-transparent to-divider`} />
      <Blossom className="size-4" />
      <span className={`h-px ${line} bg-gradient-to-l from-transparent to-divider`} />
    </div>
  );
}
