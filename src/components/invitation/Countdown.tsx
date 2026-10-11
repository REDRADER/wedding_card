"use client";

import { useEffect, useState } from "react";
import { formatNumber, zonedToEpoch } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";

const UNITS = [86_400_000, 3_600_000, 60_000, 1000];

export function Countdown({ date, time, timezone }: { date: string; time: string; timezone: string }) {
  const { t, locale } = useI18n();
  const target = zonedToEpoch(date, time, timezone);
  // Rendered empty on the server so the first client render matches it.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now !== null && now >= target) {
    return <p className="font-calligraphic text-2xl italic text-primary">{t.celebrationBegun}</p>;
  }

  const left = now === null ? 0 : target - now;
  const values = UNITS.map((ms, i) => {
    // Remainder after the larger unit, divided by this unit.
    const larger = i === 0 ? Infinity : UNITS[i - 1];
    const v = Math.floor((left % larger) / ms);
    return { label: t.units[i], value: now === null ? "--" : formatNumber(v, locale, 2) };
  });

  return (
    <div className="flex justify-center gap-2 sm:gap-4" role="timer" aria-live="off">
      {values.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="flex min-w-14 items-center justify-center rounded-lg border border-field-border/80 bg-field/70 px-2 py-2 shadow-[inset_0_1px_3px_rgba(60,70,50,0.12),0_2px_6px_rgba(60,70,50,0.08)] sm:min-w-20 sm:py-3 md:min-w-24">
            <span className="font-display text-2xl font-bold tabular-nums text-foreground sm:text-4xl md:text-5xl">
              {value}
            </span>
          </div>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted sm:text-xs rtl:text-xs sm:rtl:text-sm">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
