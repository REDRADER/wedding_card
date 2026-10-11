"use client";

import { useI18n } from "@/lib/i18n";
import type { InvitationData } from "@/lib/invitation";

export function Venue({ venue }: { venue: NonNullable<InvitationData["venue"]> }) {
  const { t, lang } = useI18n();
  const query = venue.mapQuery ?? [venue.name, venue.address].filter(Boolean).join(", ");
  const mapsUrl = venue.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&hl=${lang}&output=embed`;

  return (
    <div>
      <p className="mb-2 font-display text-2xl font-medium text-ink">{venue.name}</p>
      {venue.address && <p className="whitespace-pre-line text-muted">{venue.address}</p>}
      <div className="mx-auto mt-8 overflow-hidden rounded-[1.4rem] border-4 border-white/90 bg-field shadow-[0_16px_36px_-18px_rgba(110,80,130,0.55)] md:max-w-xl">
        <iframe
          title={t.mapOf(venue.name)}
          src={embed}
          className="block h-64 w-full md:h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-xs font-medium uppercase tracking-[0.2em] text-cream shadow-[0_10px_24px_-8px_rgba(143,106,143,0.7)] transition hover:-translate-y-0.5 md:text-sm rtl:text-sm"
      >
        {t.viewOnMaps}
      </a>
    </div>
  );
}
