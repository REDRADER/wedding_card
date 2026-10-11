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
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-divider/40" />
            <p className="text-center font-display text-sm font-semibold uppercase tracking-[0.15em] text-primary md:text-base">
              {formatLongDate(group.date, locale)}
            </p>
            <span className="h-px flex-1 bg-divider/40" />
          </div>
          <ol className="space-y-5">
            {group.items.map((item) => (
              <li key={item.dateTime + item.name} className="flex gap-4">
                <span className="w-20 shrink-0 pt-0.5 text-end text-sm font-semibold tabular-nums text-foreground">
                  {formatTime(item.dateTime.slice(11, 16), locale)}
                </span>
                <div className="min-w-0 border-s border-divider/40 ps-4">
                  <p className="break-words font-display text-lg font-semibold leading-tight text-primary">
                    {item.name}
                  </p>
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
