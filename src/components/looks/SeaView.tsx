"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { zonedToEpoch } from "@/lib/dates";
import { I18nContext } from "@/lib/i18n";
import type { Invitation } from "@/lib/invitation";
import { useInvitation } from "../invitation/useInvitation";
import { Arabic, Controls, details, Moon, moonAge, useDaysToGo, useMusic } from "./common";
import s from "./sea.module.css";

/** The sky over each panel, in the order the evening darkens. */
const SKY = {
  day: "#f6efdf",
  dusk: "#8c2f39",
  twilight: "#1d5c4a",
  night: "#0f3d33",
  deep: "#0a2a23",
} as const;
type Sky = keyof typeof SKY;
type Panel = { key: string; label?: string; sky: Sky; body: ReactNode };

// Layers slide at different speeds against the words: sea in front, skyline behind.
const SEA_SPEED = 1.3;
const SKYLINE_SPEED = 0.55;

const noSubscribe = () => () => {};
// Today's moon depends on the visitor's clock, so it only appears after hydration.
const tonight = () => Math.round(moonAge(Date.now()) * 10) / 10;

/** The wedding evening as one horizontal panorama by the Arabian Sea, from daylight to moonrise. */
export function SeaView({ invitation: base }: { invitation: Invitation }) {
  const { inv, i18n, lang, bilingual, group, toggleLang } = useInvitation(base);
  const { t } = i18n;
  const d = details(inv, base, i18n, group);
  const music = useMusic(base);
  const daysToGo = useDaysToGo(d.main.date, d.main.time, inv.event.timezone);
  const todayAge = useSyncExternalStore(noSubscribe, tonight, () => null);
  const eventAge = moonAge(zonedToEpoch(d.main.date, d.main.time, inv.event.timezone));
  const track = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const sea = useRef<HTMLDivElement>(null);
  const skyline = useRef<SVGSVGElement>(null);
  const [travel, setTravel] = useState(0);
  const [stops, setStops] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const rtl = lang === "ar";

  const eventSkies: Sky[] = ["twilight", "night"];
  const panels: Panel[] = [
    {
      key: "intro",
      sky: "day",
      body: (
        <>
          <p lang="ar" dir="rtl" className={s.arNames}>
            {base.ar?.couple?.groom?.shortName ?? d.first.shortName} و{" "}
            {base.ar?.couple?.bride?.shortName ?? d.second.shortName}
          </p>
          <h1 className={s.hero}>{d.monogram}</h1>
          <p className={s.lead}>
            {inv.hosts} {t.invitesYou}.
          </p>
          <p className={s.text}>
            {d.weekday} {d.fullDate}
            <br />
            {inv.venue?.name}, {inv.venue?.address}
          </p>
          <p className={s.hint}>{t.scrollEvening}</p>
        </>
      ),
    },
    {
      key: "sunset",
      label: lang === "ar" ? "المغرب" : "Maghrib",
      sky: "dusk",
      body: (
        <>
          <p className={s.time}>{t.aboutSix}</p>
          <h2 className={s.title}>{t.sunset}</h2>
          {inv.verse && (
            <figure className={s.figure}>
              <Arabic className={s.verse}>{inv.verse.arabic}</Arabic>
              {lang === "en" && inv.verse.translation && <p className={s.text}>{inv.verse.translation}</p>}
              <figcaption className={s.small}>{inv.verse.reference}</figcaption>
            </figure>
          )}
          <div className={s.horizon} aria-hidden>
            <div className={s.sun} data-motion="set" />
          </div>
        </>
      ),
    },
    ...d.events.map(
      (item, i): Panel => ({
        key: item.dateTime + item.name,
        label: item.name,
        sky: eventSkies[i % 2],
        body: (
          <>
            <p className={s.time}>{item.description ?? d.timeOf(item.dateTime)}</p>
            <h2 className={s.title}>{item.name}</h2>
            {i === 0 ? (
              <div className={s.families}>
                <p className={s.person}>{d.first.name}</p>
                <p className={s.small}>{d.first.details}</p>
                <p className={s.with}>{t.daughterWith}</p>
                <p className={s.person}>{d.second.name}</p>
                <p className={s.small}>{d.second.details}</p>
              </div>
            ) : (
              <div className={s.families}>
                {d.gifts && <p className={s.lead}>{d.gifts.text}</p>}
                <a className={s.button} href={d.calendarUrl} target="_blank" rel="noreferrer">
                  {t.addToCalendar}
                </a>
              </div>
            )}
          </>
        ),
      }),
    ),
    {
      key: "moon",
      label: lang === "ar" ? "القمر" : "The moon",
      sky: "deep",
      body: (
        <>
          <h2 className={s.title}>{t.moonThatNight}</h2>
          <p className={s.text}>{d.hijri ?? d.fullDate}</p>
          <div className={s.moonRise} data-motion="rise" aria-hidden>
            <Moon age={eventAge} dark="#14493d" className={s.moon} />
          </div>
          {todayAge !== null && daysToGo !== null && daysToGo > 0 && (
            <div className={s.tonight}>
              <Moon age={todayAge} dark="#14493d" className={s.moonSmall} />
              <p className={s.small}>
                {t.moonTonight}
                <br />
                {t.daysToGo(daysToGo)}
              </p>
            </div>
          )}
        </>
      ),
    },
    {
      key: "venue",
      label: t.venue,
      sky: "deep",
      body: (
        <>
          <h2 className={s.title}>{inv.venue?.name}</h2>
          <p className={s.text}>{inv.venue?.address}</p>
          <iframe
            title={t.mapOf(inv.venue?.name ?? "")}
            src={d.mapEmbed}
            className={s.map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a className={s.button} href={d.mapsUrl} target="_blank" rel="noreferrer">
            {t.openInMaps}
          </a>
        </>
      ),
    },
    {
      key: "duas",
      label: t.duas,
      sky: "deep",
      body: (
        <>
          {inv.duas?.map((dua) => (
            <div key={dua.arabic}>
              <Arabic className={s.dua}>{dua.arabic}</Arabic>
              {lang === "en" && dua.translation && <p className={s.text}>{dua.translation}</p>}
            </div>
          ))}
          <p className={s.signature}>{inv.closing?.signature ?? d.monogram}</p>
        </>
      ),
    },
  ];

  // How far the strip slides: its width minus one screen. The track is that much taller than a screen.
  // Each panel is also a resting place: scrolling settles with a panel at the left edge.
  useEffect(() => {
    const measure = () => {
      const row = strip.current;
      if (!row) return;
      const max = Math.max(0, row.scrollWidth - window.innerWidth);
      setTravel(max);
      setStops([...row.children].map((p) => Math.min(max, (p as HTMLElement).offsetLeft)));
    };
    measure();
    window.addEventListener("resize", measure);
    const root = document.documentElement;
    root.style.scrollSnapType = "y proximity";
    return () => {
      window.removeEventListener("resize", measure);
      root.style.scrollSnapType = "";
    };
  }, [lang]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    const dir = rtl ? 1 : -1;
    const update = () => {
      raf = 0;
      const el = track.current;
      const row = strip.current;
      if (!el || !row) return;
      const vw = window.innerWidth;
      const x = Math.min(travel, Math.max(0, window.scrollY - el.offsetTop));
      row.style.transform = `translate3d(${dir * x}px, 0, 0)`;
      if (sea.current) sea.current.style.transform = `translate3d(${dir * x * SEA_SPEED}px, 0, 0)`;
      if (skyline.current) skyline.current.style.transform = `translate3d(${dir * x * SKYLINE_SPEED}px, 0, 0)`;

      const els = [...row.children] as HTMLElement[];
      const leftOf = (p: HTMLElement) => (rtl ? row.scrollWidth - p.offsetLeft - p.offsetWidth : p.offsetLeft);
      const at = els.findIndex((p) => x + vw / 2 >= leftOf(p) && x + vw / 2 < leftOf(p) + p.offsetWidth);
      if (at >= 0) setCurrent(at);

      // The sun sinks and the moon climbs while their panel crosses the screen (0 entering, 1 leaving).
      for (const node of row.querySelectorAll<HTMLElement>("[data-motion]")) {
        const panel = node.closest("section") as HTMLElement;
        const along = Math.min(1, Math.max(0, (x + vw - leftOf(panel)) / (vw + panel.offsetWidth)));
        const y = node.dataset.motion === "set" ? (along - 0.25) * 160 : (1 - along) * 70;
        node.style.transform = `translate3d(0, ${y}%, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [travel, rtl]);

  function goTo(k: number) {
    const el = track.current;
    const row = strip.current;
    const p = row?.children[k] as HTMLElement | undefined;
    if (!el || !p || !row) return;
    const left = rtl ? row.scrollWidth - p.offsetLeft - p.offsetWidth : p.offsetLeft;
    window.scrollTo({ top: el.offsetTop + Math.min(travel, left), behavior: "smooth" });
  }

  return (
    <I18nContext value={i18n}>
      <div lang={lang} dir={rtl ? "rtl" : "ltr"} className={s.root}>
        <header className={s.bar}>
          <p className={s.wordmark} data-light={current === 0 || undefined}>
            {d.monogram}
          </p>
          <nav aria-label={t.program}>
            <ul>
              {panels.map((p, k) =>
                p.label ? (
                  <li key={p.key}>
                    <button type="button" onClick={() => goTo(k)} aria-current={current === k ? "step" : undefined}>
                      {p.label}
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          </nav>
        </header>

        <div ref={track} className={s.track} style={{ height: `calc(100svh + ${travel}px)` }}>
          <div className={s.stage}>
            <div ref={strip} className={s.strip}>
              {panels.map((p, k) => (
                <section
                  key={p.key}
                  className={`${s.panel} ${s[p.sky] ?? ""}`}
                  aria-label={p.label}
                  // Each panel's sky runs into the next one's, so the evening has no seams.
                  style={{ "--from": SKY[p.sky], "--to": SKY[panels[k + 1]?.sky ?? p.sky] } as CSSProperties}
                >
                  {p.body}
                </section>
              ))}
            </div>
            <svg
              ref={skyline}
              className={s.skyline}
              style={{ width: `calc(100vw + ${Math.ceil(travel * SKYLINE_SPEED)}px)` }}
              viewBox="0 0 2400 120"
              preserveAspectRatio="none"
              aria-hidden
            >
              <Skyline />
            </svg>
            <div
              ref={sea}
              className={s.sea}
              style={{ width: `calc(100vw + ${Math.ceil(travel * SEA_SPEED)}px)` }}
              aria-hidden
            />
          </div>
          <div className={s.snaps} aria-hidden>
            {stops.map((top, k) => (
              <div key={k} className={s.snap} style={{ top }} />
            ))}
          </div>
        </div>

        <Controls
          music={music}
          i18n={i18n}
          bilingual={bilingual}
          onToggleLang={toggleLang}
          className="bg-[#c9a24d] text-[#0f3d33] hover:bg-[#e6c97e]"
        />
      </div>
    </I18nContext>
  );
}

/**
 * Mumbai's shore in one gold line: low city blocks, the Bandra–Worli Sea Link, and
 * Haji Ali Dargah on its causeway, a short way up the coast from Mumbai Central.
 */
function Skyline() {
  const blocks = [
    [40, 70], [90, 52], [130, 78], [175, 60], [230, 84], [290, 66], [340, 92], [1500, 74], [1550, 58], [1600, 88],
    [1660, 64], [1720, 96], [1790, 70], [1850, 82], [2180, 68], [2230, 90], [2290, 60], [2340, 76],
  ];
  const cables = [0, 1, 2, 3, 4, 5];
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke">
      <path d="M0 118 H2400" />
      {blocks.map(([x, top]) => (
        <path key={x} d={`M${x} 118 V${top} H${x + 34} V118`} />
      ))}
      {/* Sea Link: deck and two pylons with fanned cables */}
      <path d="M520 104 H1180" />
      {[700, 960].map((px) => (
        <g key={px}>
          <path d={`M${px} 118 V16`} />
          {cables.map((i) => (
            <path key={i} d={`M${px} ${22 + i * 10} L${px - 40 - i * 28} 104 M${px} ${22 + i * 10} L${px + 40 + i * 28} 104`} />
          ))}
        </g>
      ))}
      {/* Haji Ali Dargah: causeway, hall, dome with finial, minaret */}
      <path d="M1880 112 H2020" />
      <path d="M2020 118 V84 H2120 V118" />
      <path d="M2046 84 C2046 58, 2070 46, 2070 36 C2070 46, 2094 58, 2094 84" />
      <path d="M2070 36 V26" />
      <path d="M2132 118 V30 M2124 30 H2140 M2128 30 C2128 22, 2136 22, 2136 30 M2132 22 V16" />
    </g>
  );
}
