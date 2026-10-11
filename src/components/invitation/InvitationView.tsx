"use client";

import { Car, Clock, Gift, Globe, Hotel, Mail, MapPin, PartyPopper, Shirt, Volume2, VolumeX } from "lucide-react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { formatFullDate, formatTime, formatWeekday } from "@/lib/dates";
import { DICTIONARIES, I18nContext, LOCALES, localize, type Lang } from "@/lib/i18n";
import { textOf, type Invitation } from "@/lib/invitation";
import { getTheme, themeStyle } from "@/lib/templates";
import { Countdown } from "./Countdown";
import { IntroHero } from "./IntroHero";
import { Rsvp } from "./Rsvp";
import { SaveTheDate } from "./SaveTheDate";
import { ScratchCard } from "./ScratchCard";
import { Ornament, Section, WavyDivider } from "./Section";
import { Slideshow } from "./Slideshow";
import { Timeline } from "./Timeline";
import { Venue } from "./Venue";

const LANG_PARAM = "lang";

// A shared link can pick the language: /invite/zaid-aisha?lang=ar
const noSubscribe = () => () => {};
function readLangParam(): Lang | null {
  const v = new URLSearchParams(window.location.search).get(LANG_PARAM);
  return v === "ar" || v === "en" ? v : null;
}

export function InvitationView({ invitation: base }: { invitation: Invitation }) {
  const theme = getTheme(base.template);
  const bilingual = Boolean(base.ar);
  // Language precedence: visitor's toggle, then ?lang= in the link, then the JSON default.
  const [chosen, setChosen] = useState<Lang | null>(null);
  const urlLang = useSyncExternalStore(noSubscribe, readLangParam, () => null);
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
  const transportation = textOf(inv.transportation);
  const accommodation = textOf(inv.accommodation);
  const gifts = textOf(inv.gifts);
  const calendar = {
    title: inv.event.title ?? t.weddingOf(names),
    date: inv.event.date,
    time: inv.event.time,
    timezone: inv.event.timezone,
    durationHours: inv.event.durationHours ?? 4,
    location: inv.venue ? [inv.venue.name, inv.venue.address].filter(Boolean).join(", ") : undefined,
  };

  // Each entry is one section; dividers are inserted between them.
  const sections: { key: string; node: ReactNode }[] = [];
  const add = (key: string, node: ReactNode) => sections.push({ key, node });

  if (inv.scratchCard !== false) {
    add(
      "date",
      <Section title={inv.scratchCard?.title ?? t.scratchTitle}>
        <ScratchCard
          theme={theme}
          date={inv.event.date}
          time={inv.event.time}
          label={inv.scratchCard?.revealLabel ?? t.youreInvited}
        />
        <SaveTheDate {...calendar} />
      </Section>,
    );
  } else {
    add(
      "date",
      <Section title={t.saveTheDate}>
        <p className="font-display text-2xl font-bold text-foreground">{formatFullDate(inv.event.date, locale)}</p>
        <p className="font-calligraphic text-lg text-primary">
          {formatWeekday(inv.event.date, locale)} · {formatTime(inv.event.time, locale)}
        </p>
        <SaveTheDate {...calendar} />
      </Section>,
    );
  }
  if (inv.slideshow?.length) {
    add(
      "slides",
      <Section>
        <Ornament className="mb-8" />
        <Slideshow images={inv.slideshow} />
      </Section>,
    );
  }
  if (inv.countdown !== false) {
    add(
      "countdown",
      <Section title={inv.countdown?.title ?? t.countdownTitle}>
        <Countdown date={inv.event.date} time={inv.event.time} timezone={inv.event.timezone} />
      </Section>,
    );
  }
  if (inv.program?.items.length) {
    add(
      "program",
      <Section icon={Clock} title={inv.program.title ?? t.program}>
        <Timeline items={inv.program.items} />
      </Section>,
    );
  }
  if (inv.venue) {
    add(
      "venue",
      <Section icon={MapPin} title={t.venue}>
        {/* The map always searches the original (English) name and address. */}
        <Venue
          venue={{
            ...inv.venue,
            mapQuery: base.venue?.mapQuery ?? [base.venue?.name, base.venue?.address].filter(Boolean).join(", "),
            mapsUrl: base.venue?.mapsUrl,
          }}
        />
      </Section>,
    );
  }
  if (inv.dressCode && (inv.dressCode.women || inv.dressCode.men)) {
    add(
      "dress",
      <Section icon={Shirt} title={inv.dressCode.title ?? t.dressCode}>
        <div className="mx-auto grid max-w-xl gap-8 md:grid-cols-2">
          {(
            [
              [t.women, inv.dressCode.women],
              [t.men, inv.dressCode.men],
            ] as const
          ).map(
            ([label, text]) =>
              text && (
                <div key={label}>
                  <h3 className="mb-3 font-display text-lg font-semibold text-primary">{label}</h3>
                  <p className="text-sm leading-relaxed text-muted">{text}</p>
                </div>
              ),
          )}
        </div>
      </Section>,
    );
  }
  if (inv.preEvents?.items.length) {
    add(
      "pre",
      <Section icon={PartyPopper} title={inv.preEvents.title ?? t.preEvents}>
        <Timeline items={inv.preEvents.items} />
      </Section>,
    );
  }
  for (const [key, icon, fallback, value] of [
    ["transport", Car, t.transportation, transportation],
    ["stay", Hotel, t.accommodation, accommodation],
    ["gifts", Gift, t.gifts, gifts],
  ] as const) {
    if (!value) continue;
    add(
      key,
      <Section icon={icon} title={value.title ?? fallback}>
        <p className="mx-auto max-w-xl whitespace-pre-line leading-relaxed text-muted">{value.text}</p>
      </Section>,
    );
  }
  if (inv.rsvp) {
    add(
      "rsvp",
      <Section icon={Mail} title={inv.rsvp.title ?? t.rsvp}>
        <Rsvp config={inv.rsvp} coupleNames={names} slug={inv.slug} />
      </Section>,
    );
  }

  return (
    <I18nContext value={i18n}>
      <div
        lang={lang}
        dir={lang === "ar" ? "rtl" : "ltr"}
        style={themeStyle(theme)}
        className="min-h-svh bg-page text-foreground"
      >
        {musicSrc && <audio ref={audioRef} src={musicSrc} loop preload="auto" />}

        {musicSrc && (
          <button
            type="button"
            onClick={toggleMusic}
            aria-label={playing ? t.muteMusic : t.playMusic}
            className="fixed right-4 top-4 z-50 flex size-10 items-center justify-center rounded-lg bg-primary/90 text-cream shadow-lg backdrop-blur transition hover:bg-primary"
          >
            {playing ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        )}

        {bilingual && (
          <button
            type="button"
            onClick={toggleLang}
            lang={lang === "en" ? "ar" : "en"}
            className="fixed bottom-4 left-4 z-50 flex h-10 items-center gap-2 rounded-full bg-cream/90 px-4 text-sm text-primary shadow-lg backdrop-blur transition hover:bg-cream"
          >
            <Globe className="size-4" />
            {t.switchTo}
          </button>
        )}

        <IntroHero
          theme={theme}
          headline={inv.headline}
          first={first}
          second={second}
          onOpen={startMusic}
          onReveal={onReveal}
        />

        <div className="@container">
          <main
            style={{
              backgroundImage: `url(${theme.assets.welcomeBg}), url(${theme.assets.generalBg})`,
              backgroundPosition: `top center, center ${theme.welcomeBgRatio * 100}cqw`,
              backgroundRepeat: "no-repeat, repeat-y",
              backgroundSize: "100% auto, 100% auto",
            }}
          >
            {inv.welcomeMessage ? (
              <section className="relative px-10 py-24 md:px-14 md:py-32">
                <div className="mx-auto max-w-2xl text-center">
                  <Ornament wide className="mb-8" />
                  <p className="text-glow-soft whitespace-pre-wrap break-words font-calligraphic text-2xl italic leading-relaxed text-ink md:text-3xl">
                    {inv.welcomeMessage}
                  </p>
                  <Ornament wide className="mt-8" />
                </div>
              </section>
            ) : (
              <div aria-hidden className="h-40 w-full md:h-56" />
            )}

            {sections.map(({ key, node }) => (
              <Fragment key={key}>
                <WavyDivider />
                {node}
              </Fragment>
            ))}

            <WavyDivider />
            <footer
              className="relative px-12 pb-[42cqw] pt-16 text-center md:pb-[28cqw] md:pt-20"
              style={{
                backgroundImage: `url(${theme.assets.endBg})`,
                backgroundPosition: "bottom center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% auto",
              }}
            >
              <div className="mx-auto max-w-2xl">
                <p className="mb-4 whitespace-pre-line font-script text-4xl leading-relaxed text-primary md:text-5xl">
                  {inv.closing?.message ?? t.closing}
                </p>
                <p className="whitespace-pre-line font-script text-2xl text-muted">{inv.closing?.signature ?? names}</p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </I18nContext>
  );
}
