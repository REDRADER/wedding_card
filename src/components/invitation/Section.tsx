"use client";

import { Heart, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Section({
  id,
  icon: Icon,
  title,
  children,
  className = "",
}: {
  id?: string;
  icon?: LucideIcon;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative px-12 py-16 md:px-16 md:py-20 ${className}`}>
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {(Icon || title) && (
          <header className="mb-8">
            {Icon && <Icon className="mx-auto mb-3 size-7 text-primary" strokeWidth={1.6} aria-hidden />}
            {title && <h2 className="mb-3 font-script text-4xl text-primary md:text-5xl">{title}</h2>}
            <Ornament />
          </header>
        )}
        {children}
      </motion.div>
    </section>
  );
}

/** Line, small heart, line. */
export function Ornament({ className = "", wide = false }: { className?: string; wide?: boolean }) {
  const line = wide ? "w-20" : "w-16";
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className={`h-px ${line} bg-gradient-to-r from-transparent to-divider/60`} />
      <Heart className="size-2.5 fill-current text-accent" strokeWidth={0} />
      <span className={`h-px ${line} bg-gradient-to-l from-transparent to-divider/60`} />
    </div>
  );
}

export function WavyDivider() {
  return (
    <div className="flex justify-center px-12" aria-hidden>
      <svg viewBox="0 0 400 16" className="h-4 w-full max-w-md text-divider/45" preserveAspectRatio="none">
        <path
          d="M0 8 C 45 3, 90 3, 133 8 S 222 13, 266 8 S 355 3, 400 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
