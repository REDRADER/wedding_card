"use client";

import { ChevronDown, Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { Person } from "@/lib/invitation";
import type { TemplateTheme } from "@/lib/templates";
import { Ornament } from "./Section";

type Phase = "idle" | "playing" | "revealed";

const ease = [0.16, 1, 0.3, 1] as const;

export function IntroHero({
  theme,
  headline,
  first,
  second,
  onOpen,
  onReveal,
}: {
  theme: TemplateTheme;
  headline?: string;
  first: Person;
  second: Person;
  /** Fired on the user's tap, so audio can start inside the gesture. */
  onOpen: () => void;
  /** Fired when the hero text appears and the page may scroll. */
  onReveal: () => void;
}) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [videoFailed, setVideoFailed] = useState(false);
  const revealed = phase === "revealed";

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setTimeout(() => setPhase("revealed"), theme.heroTextDelay * 1000);
    return () => window.clearTimeout(id);
  }, [phase, theme.heroTextDelay]);

  useEffect(() => {
    if (revealed) onReveal();
  }, [revealed, onReveal]);

  async function open() {
    if (phase !== "idle") return;
    onOpen();
    const video = videoRef.current;
    if (!video || videoFailed) {
      setPhase("revealed");
      return;
    }
    try {
      video.muted = true;
      await video.play();
      setPhase("playing");
    } catch {
      // Autoplay blocked or decode error: jump straight to the final frame.
      setVideoFailed(true);
      setPhase("revealed");
    }
  }

  return (
    <section className="relative flex h-svh min-h-[560px] w-full items-center justify-center overflow-hidden bg-[#0f0f0f]">
      <video
        ref={videoRef}
        src={theme.assets.introVideo}
        poster={theme.assets.introPoster}
        className="absolute inset-0 size-full object-cover"
        playsInline
        muted
        preload="auto"
        disablePictureInPicture
        controls={false}
        onContextMenu={(e) => e.preventDefault()}
        onError={() => setVideoFailed(true)}
        onEnded={() => setPhase("revealed")}
      />
      {videoFailed && phase !== "idle" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={theme.assets.introFinalFrame}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />
      )}

      {phase === "idle" && (
        <button
          type="button"
          onClick={open}
          className="absolute inset-0 z-20 cursor-pointer"
          aria-label={t.openInvitation}
        />
      )}

      <motion.div
        className="pointer-events-none relative -top-10 z-10 flex w-full flex-col items-center px-6 text-center text-ink md:-top-16"
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 30 }}
        transition={{ duration: 1.6, ease }}
        aria-hidden={!revealed}
      >
        <Reveal show={revealed} delay={0.2} className="mb-3">
          <Heart className="mx-auto size-[26px] fill-current" strokeWidth={0} />
        </Reveal>
        {headline && (
          <Reveal show={revealed} delay={0.4}>
            <p className="text-glow mb-3 whitespace-pre-line font-calligraphic text-2xl md:text-4xl">{headline}</p>
          </Reveal>
        )}
        <Ornament className="my-3" />
        <Reveal show={revealed} delay={0.6}>
          <Name person={first} />
        </Reveal>
        <Reveal show={revealed} delay={0.85}>
          <p className="text-glow my-2 font-names text-3xl text-names/85 md:text-4xl rtl:text-5xl">{t.and}</p>
        </Reveal>
        <Reveal show={revealed} delay={1.05}>
          <Name person={second} />
        </Reveal>
      </motion.div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-2 md:bottom-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <div className="animate-scroll-hint flex flex-col items-center gap-1">
              <span className="text-glow-soft text-xs uppercase tracking-widest text-ink/70">{t.scroll}</span>
              <ChevronDown className="size-5 text-ink" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Name({ person }: { person: Person }) {
  return (
    <h1 className="text-glow font-names text-6xl leading-none text-names md:text-8xl lg:text-9xl rtl:text-7xl rtl:leading-[1.3] md:rtl:text-9xl">
      {person.name}
      {person.details && (
        <span className="mb-3 mt-1 block whitespace-pre-line font-display text-sm italic leading-snug text-names/85 md:text-base rtl:mt-0 rtl:text-base rtl:leading-relaxed md:rtl:text-lg">
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
