"use client";

import { formatLongDate, formatTime, groupByDate } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import type { ScheduleItem } from "@/lib/invitation";

export function Timeline({ items }: { items: ScheduleItem[] }) {
  const { locale } = useI18n();
  return (
    <div className="mx-auto max-w-md space-y-8 text-start">
      {groupByDate(items).map((group) => (
        <div key={group.date}>
          <p className="mb-5 flex justify-center">
            <span className="rounded-full bg-white/80 px-4 py-1.5 text-center font-display text-xs font-medium uppercase tracking-[0.2em] text-primary shadow-sm md:text-sm rtl:text-sm">
              {formatLongDate(group.date, locale)}
            </span>
          </p>
          <ol className="ms-3 space-y-4 border-s border-dashed border-divider ps-6">
            {group.items.map((item) => (
              <li key={item.dateTime + item.name} className="relative">
                <span className="absolute -start-[31px] top-5 size-3 rounded-full bg-accent ring-4 ring-white/90" />
                <div className="rounded-2xl border border-white/80 bg-white/70 px-5 py-4 shadow-[0_8px_24px_-16px_rgba(110,80,130,0.5)]">
                  <p className="text-xs font-medium tracking-[0.2em] text-primary tabular-nums rtl:text-sm">
                    {formatTime(item.dateTime.slice(11, 16), locale)}
                  </p>
                  <p className="mt-1 break-words font-display text-xl leading-snug text-ink">{item.name}</p>
                  {item.description && (
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
