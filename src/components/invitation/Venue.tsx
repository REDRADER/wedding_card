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
      <p className="mb-2 font-display text-xl font-semibold text-foreground">{venue.name}</p>
      {venue.address && <p className="whitespace-pre-line text-muted">{venue.address}</p>}
      <div className="mx-auto mt-8 overflow-hidden rounded-xl border border-field-border bg-field shadow-[0_10px_28px_rgba(60,70,50,0.15)] md:max-w-xl">
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
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-cream transition hover:bg-primary/90"
      >
        {t.viewOnMaps}
      </a>
    </div>
  );
}
