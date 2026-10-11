"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Person } from "@/lib/invitation";
import { HankoSeal, SakuraBranch, Seigaiha } from "./Decor";
import { Ornament } from "./Section";

type Phase = "closed" | "opening" | "revealed";

const ease = [0.16, 1, 0.3, 1] as const;
const DOOR_SECONDS = 1.7;
/** The names start appearing while the doors are still sliding. */
const REVEAL_AFTER_MS = 1100;

export function IntroHero({
  headline,
  first,
  second,
  dateLabel,
  onOpen,
  onReveal,
}: {
  headline?: string;
  first: Person;
  second: Person;
  /** Shown vertically along the edge, e.g. "January 31, 2027". */
  dateLabel: string;
  /** Fired on the user's tap, so audio can start inside the gesture. */
  onOpen: () => void;
  /** Fired when the hero text appears and the page may scroll. */
  onReveal: () => void;
}) {
  const { t, lang } = useI18n();
  const [phase, setPhase] = useState<Phase>("closed");
  const revealed = phase === "revealed";

  useEffect(() => {
    if (phase !== "opening") return;
    const id = window.setTimeout(() => setPhase("revealed"), REVEAL_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (revealed) onReveal();
  }, [revealed, onReveal]);

  function open() {
    if (phase !== "closed") return;
    onOpen();
    setPhase("opening");
  }

  const initials: [string, string] = [[...first.name][0] ?? "", [...second.name][0] ?? ""];

  return (
    <section className="relative flex h-svh min-h-[600px] w-full items-center justify-center overflow-hidden bg-cream">
      {/* Pastel sky with drifting color, paper grain and a soft sun. */}
      <div className="absolute inset-0 bg-gradient-to-b from-blush/90 via-cream to-lilac/80" />
      <div className="animate-drift absolute -left-1/3 top-[6%] size-[80vmin] rounded-full bg-sky/80 blur-3xl" />
      <div
        className="animate-drift absolute -right-1/3 bottom-[14%] size-[70vmin] rounded-full bg-mint/80 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />
      <div className="washi absolute inset-0 opacity-25 mix-blend-multiply" />
      <div className="absolute left-1/2 top-[45%] size-[min(80vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff_0%,var(--color-blush)_58%,#f2bccb_100%)] opacity-80" />
      <div className="absolute left-1/2 top-[45%] size-[min(88vw,510px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90" />

      <SakuraBranch className="absolute -right-3 -top-1 w-[80vw] max-w-[460px]" />
      <SakuraBranch className="absolute -left-4 bottom-[13%] w-[50vw] max-w-[280px] -scale-100 opacity-90" />
      <Seigaiha className="absolute inset-x-0 bottom-0 h-[15%] w-full [mask-image:linear-gradient(to_bottom,transparent,black_40%)]" />

      <p className="vertical-text absolute left-4 top-1/2 -translate-y-1/2 font-body text-[11px] uppercase tracking-[0.5em] text-muted md:left-8 rtl:hidden">
        {t.weddingInvitation}
      </p>
      <p className="vertical-text absolute right-4 top-1/2 -translate-y-1/2 font-display text-xs tracking-[0.35em] text-muted md:right-8 rtl:hidden">
        {dateLabel}
      </p>

      <motion.div
        className="pointer-events-none relative -top-4 z-10 flex w-full flex-col items-center px-10 text-center text-ink"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 30 }}
        transition={{ duration: 1.4, ease }}
        aria-hidden={!revealed}
      >
        {headline && (
          <Reveal show={revealed} delay={0.2}>
            <p className="mb-1 whitespace-pre-line font-calligraphic text-2xl italic text-primary md:text-3xl">
              {headline}
            </p>
          </Reveal>
        )}
        <Reveal show={revealed} delay={0.35}>
          <Ornament wide className="my-4" />
        </Reveal>
        <Reveal show={revealed} delay={0.5}>
          <Name person={first} />
        </Reveal>
        <Reveal show={revealed} delay={0.75}>
          <p className="my-1 font-calligraphic text-4xl italic text-accent md:text-5xl rtl:font-names">{t.and}</p>
        </Reveal>
        <Reveal show={revealed} delay={0.95}>
          <Name person={second} />
        </Reveal>
      </motion.div>

      {/* Shoji doors over everything until the seal is tapped. */}
      {(["start", "end"] as const).map((side) => (
        <motion.div
          key={side}
          className={`absolute inset-y-0 z-30 w-1/2 shadow-[0_0_40px_rgba(110,80,100,0.18)] ${
            side === "start" ? "start-0" : "end-0"
          }`}
          initial={false}
          animate={{ x: phase === "closed" ? 0 : `${(side === "start") !== (lang === "ar") ? -102 : 102}%` }}
          transition={{ duration: DOOR_SECONDS, ease: [0.65, 0, 0.35, 1] }}
          aria-hidden
        >
          <Door side={side} />
        </motion.div>
      ))}

      <AnimatePresence>
        {phase === "closed" && (
          <motion.button
            type="button"
            onClick={open}
            aria-label={t.openInvitation}
            className="absolute inset-0 z-40 flex cursor-pointer flex-col items-center justify-center gap-4"
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.45 }}
          >
            <motion.span
              className="block size-24 drop-shadow-[0_8px_16px_rgba(180,90,100,0.35)] md:size-28"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <HankoSeal initials={initials} className="size-full" />
            </motion.span>
            <span className="rounded-full bg-white/85 px-5 py-2 font-body text-[11px] uppercase tracking-[0.3em] text-primary shadow-sm rtl:text-sm">
              {t.tapToOpen}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <div className="animate-scroll-hint flex flex-col items-center gap-1 rounded-full bg-white/70 px-3 py-2">
              <span className="text-[10px] uppercase tracking-widest text-primary rtl:text-xs">{t.scroll}</span>
              <ChevronDown className="size-4 text-primary" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** One sliding panel: lattice paper above, a seigaiha panel below, a round pull near the seam. */
function Door({ side }: { side: "start" | "end" }) {
  return (
    <div className="relative flex size-full flex-col border-x-[6px] border-y-[6px] border-[#e9d8c8] bg-[#e9d8c8]">
      <div className="shoji relative flex-1" />
      <div className="relative h-[16%] overflow-hidden border-t-[6px] border-[#e9d8c8]">
        <Seigaiha className="absolute inset-0 size-full" colors={["var(--color-blush)", "#fdf3f5"]} size={0.9} />
      </div>
      <span
        className={`absolute top-1/2 size-6 -translate-y-1/2 rounded-full border-2 border-[#d8c2ae] bg-[#f3e7dc] shadow-inner ${
          side === "start" ? "end-4" : "start-4"
        }`}
      />
    </div>
  );
}

function Name({ person }: { person: Person }) {
  return (
    <h1 className="font-names text-6xl font-medium leading-tight tracking-wide text-names md:text-8xl rtl:text-7xl rtl:leading-[1.4] md:rtl:text-9xl">
      {person.name}
      {person.details && (
        <span className="mb-2 mt-2 block whitespace-pre-line font-body text-xs font-normal leading-relaxed tracking-wider text-muted md:text-sm rtl:text-base">
          {person.details}
        </span>
      )}
    </h1>
  );
}

function Reveal({
  show,
  delay,
  className,
  children,
}: {
  show: boolean;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
      transition={{ delay: show ? delay : 0, duration: 1, ease }}
    >
      {children}
    </motion.div>
  );
}
