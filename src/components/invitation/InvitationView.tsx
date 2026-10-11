"use client";

import {
  CalendarHeart,
  Clock,
  Gift,
  Globe,
  Images,
  MapPin,
  Timer,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { formatFullDate, formatTime, formatWeekday } from "@/lib/dates";
import { DICTIONARIES, I18nContext, LOCALES, localize, type Lang } from "@/lib/i18n";
import { eventsFor, mainEventFor, textOf, type Invitation } from "@/lib/invitation";
import { getTheme, themeStyle } from "@/lib/templates";
import { Countdown } from "./Countdown";
import { FallingPetals, SakuraBranch, Seigaiha } from "./Decor";
import { IntroHero } from "./IntroHero";
import { SaveTheDate } from "./SaveTheDate";
import { ScratchCard } from "./ScratchCard";
import { Ornament, Section, TONES } from "./Section";
import { Slideshow } from "./Slideshow";
import { Timeline } from "./Timeline";
import { Venue } from "./Venue";

const LANG_PARAM = "lang";
const GROUP_PARAM = "for";

// A shared link can pick the language and the guest group: /invite/zaid-aisha?for=family&lang=ar
const noSubscribe = () => () => {};
function readLangParam(): Lang | null {
  const v = new URLSearchParams(window.location.search).get(LANG_PARAM);
  return v === "ar" || v === "en" ? v : null;
}
function readGroupParam(): string | null {
  return new URLSearchParams(window.location.search).get(GROUP_PARAM);
}

export function InvitationView({ invitation: base }: { invitation: Invitation }) {
  const theme = getTheme(base.template);
  const bilingual = Boolean(base.ar);
  // Language precedence: visitor's toggle, then ?lang= in the link, then the JSON default.
  const [chosen, setChosen] = useState<Lang | null>(null);
  const urlLang = useSyncExternalStore(noSubscribe, readLangParam, () => null);
  const group = useSyncExternalStore(noSubscribe, readGroupParam, () => null);
  const lang: Lang = bilingual ? (chosen ?? urlLang ?? base.defaultLanguage ?? "en") : "en";
  const i18n = useMemo(() => ({ lang, t: DICTIONARIES[lang], locale: LOCALES[lang] }), [lang]);
  const { t, locale } = i18n;
  const inv = useMemo(() => localize(base, lang), [base, lang]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const musicSrc = base.music?.enabled === false ? null : (inv.music?.src ?? theme.assets.music);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function toggleLang() {
    const next: Lang = lang === "en" ? "ar" : "en";
    setChosen(next);
    const url = new URL(window.location.href);
    url.searchParams.set(LANG_PARAM, next);
    history.replaceState(history.state, "", url);
  }

  // Keep the page pinned to the intro until the hero text appears.
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = revealed ? "" : "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [revealed]);

  const startMusic = useCallback(() => {
    audioRef.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);
  const onReveal = useCallback(() => setRevealed(true), []);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) startMusic();
    else {
      audio.pause();
      setPlaying(false);
    }
  }

  const { groom, bride, brideFirst } = inv.couple;
  const [first, second] = brideFirst ? [bride, groom] : [groom, bride];
  const names = t.joinNames(first.name, second.name);
  const gifts = textOf(inv.gifts);
  // Guests only see the events their link's group is invited to, and the date follows them.
  const events = eventsFor(inv, group);
  const main = mainEventFor(inv, events);
  const calendar = {
    title: main.item ? t.eventOf(main.item.name, names) : (inv.event.title ?? t.weddingOf(names)),
    date: main.date,
    time: main.time,
    timezone: inv.event.timezone,
    durationHours: main.item ? 4 : (inv.event.durationHours ?? 4),
    location: inv.venue ? [inv.venue.name, inv.venue.address].filter(Boolean).join(", ") : undefined,
  };

  // Each entry is one card; they're numbered and tinted in order.
  const sections: { key: string; icon: LucideIcon; title?: string; node: ReactNode }[] = [];
  const add = (key: string, icon: LucideIcon, title: string | undefined, node: ReactNode) =>
    sections.push({ key, icon, title, node });

  if (inv.scratchCard !== false) {
    add(
      "date",
      CalendarHeart,
      inv.scratchCard?.title ?? t.scratchTitle,
      <>
        <ScratchCard
          theme={theme}
          date={main.date}
          time={main.time}
          label={inv.scratchCard?.revealLabel ?? t.youreInvited}
        />
        <SaveTheDate {...calendar} />
      </>,
    );
  } else {
    add(
      "date",
      CalendarHeart,
      t.saveTheDate,
      <>
        <p className="font-display text-2xl font-semibold text-foreground">{formatFullDate(main.date, locale)}</p>
        <p className="mt-1 font-calligraphic text-xl italic text-primary">
          {formatWeekday(main.date, locale)} · {formatTime(main.time, locale)}
        </p>
        <SaveTheDate {...calendar} />
      </>,
    );
  }
  if (inv.slideshow?.length) {
    const images = inv.slideshow;
    add("slides", Images, undefined, <Slideshow images={images} />);
  }
  if (inv.countdown !== false) {
    add(
      "countdown",
      Timer,
      inv.countdown?.title ?? t.countdownTitle,
      <Countdown date={main.date} time={main.time} timezone={inv.event.timezone} />,
    );
  }
  if (events.length) {
    add("program", Clock, inv.program?.title ?? t.program, <Timeline items={events} />);
  }
  if (inv.venue) {
    const venue = inv.venue;
    add(
      "venue",
      MapPin,
      t.venue,
      <>
        {/* The map always searches the original (English) name and address. */}
        <Venue
          venue={{
            ...venue,
            mapQuery: base.venue?.mapQuery ?? [base.venue?.name, base.venue?.address].filter(Boolean).join(", "),
            mapsUrl: base.venue?.mapsUrl,
          }}
        />
      </>,
    );
  }
  if (gifts) {
    add(
      "gifts",
      Gift,
      gifts.title ?? t.gifts,
      <p className="mx-auto max-w-xl whitespace-pre-line leading-relaxed text-muted">{gifts.text}</p>,
    );
  }

  return (
    <I18nContext value={i18n}>
      <div
        lang={lang}
        dir={lang === "ar" ? "rtl" : "ltr"}
        style={themeStyle(theme)}
        className="min-h-svh bg-page font-body text-foreground"
      >
        {musicSrc && <audio ref={audioRef} src={musicSrc} loop preload="auto" />}

        {musicSrc && (
          <button
            type="button"
            onClick={toggleMusic}
            aria-label={playing ? t.muteMusic : t.playMusic}
            className="fixed right-4 top-4 z-50 flex size-10 items-center justify-center rounded-full border border-white/80 bg-white/70 text-primary shadow-lg backdrop-blur transition hover:bg-white"
          >
            {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        )}

        {bilingual && (
          <button
            type="button"
            onClick={toggleLang}
            lang={lang === "en" ? "ar" : "en"}
            className="fixed bottom-4 left-4 z-50 flex h-10 items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 text-sm text-primary shadow-lg backdrop-blur transition hover:bg-white"
          >
            <Globe className="size-4" />
            {t.switchTo}
          </button>
        )}

        <IntroHero
          headline={inv.headline}
          first={first}
          second={second}
          dateLabel={formatFullDate(main.date, locale)}
          onOpen={startMusic}
          onReveal={onReveal}
        />

        <FallingPetals />

        <main className="relative isolate overflow-hidden">
          {/* Pastel wash behind the cards: soft color fields and paper grain. */}
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-lilac/60 via-page to-mint/50" />
            <div className="absolute -left-1/4 top-[8%] size-[90vw] max-w-[700px] rounded-full bg-blush/70 blur-3xl" />
            <div className="absolute -right-1/4 top-[38%] size-[90vw] max-w-[700px] rounded-full bg-sky/70 blur-3xl" />
            <div className="absolute -left-1/4 top-[68%] size-[90vw] max-w-[700px] rounded-full bg-butter/70 blur-3xl" />
            <div className="washi absolute inset-0 opacity-25 mix-blend-multiply" />
          </div>

          {inv.welcomeMessage ? (
            <section className="relative px-8 pb-10 pt-20 md:px-14 md:pt-28">
              <div className="mx-auto max-w-2xl text-center">
                <Ornament wide className="mb-8" />
                <p className="whitespace-pre-wrap break-words font-calligraphic text-2xl italic leading-relaxed text-ink md:text-3xl">
                  {inv.welcomeMessage}
                </p>
                <Ornament wide className="mt-8" />
              </div>
            </section>
          ) : (
            <div aria-hidden className="h-16 w-full md:h-24" />
          )}

          {sections.map(({ key, icon, title, node }, i) => (
            <Section key={key} index={i + 1} tone={TONES[i % TONES.length]} icon={icon} title={title}>
              {node}
            </Section>
          ))}

          <footer className="relative mt-6 overflow-hidden pt-40 text-center md:pt-52">
            <SakuraBranch className="pointer-events-none absolute -right-6 top-0 w-[60vw] max-w-[340px] opacity-90" />
            <div className="relative mx-auto max-w-2xl px-10 pb-[30vw] md:pb-56">
              <p className="mb-5 whitespace-pre-line font-display text-3xl leading-relaxed text-ink md:text-4xl">
                {inv.closing?.message ?? t.closing}
              </p>
              <Ornament wide className="mb-5" />
              <p className="whitespace-pre-line font-calligraphic text-2xl italic text-primary md:text-3xl rtl:font-names">
                {inv.closing?.signature ?? names}
              </p>
            </div>
            <Seigaiha
              className="absolute inset-x-0 bottom-0 h-[26vw] max-h-44 w-full [mask-image:linear-gradient(to_bottom,transparent,black_45%)]"
              colors={["var(--color-sky)", "var(--color-mint)"]}
              size={1.3}
            />
          </footer>
        </main>
      </div>
    </I18nContext>
  );
}
