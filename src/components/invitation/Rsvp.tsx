"use client";

import { Check, Users } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { InvitationData } from "@/lib/invitation";

type Status = "idle" | "sending" | "sent" | "error" | "unconfigured";

const field =
  "w-full rounded-md border border-field-border bg-field px-3 text-sm text-foreground placeholder:text-muted/70 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

export function Rsvp({
  config,
  coupleNames,
  slug,
}: {
  config: NonNullable<InvitationData["rsvp"]>;
  coupleNames: string;
  slug: string;
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [attending, setAttending] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!config.formEndpoint && !config.whatsappNumber) {
      setStatus("unconfigured");
      return;
    }
    const form = new FormData(e.currentTarget);
    const reply = {
      invitation: slug,
      name: String(form.get("name") ?? "").trim(),
      attending: form.get("attending") === "yes",
      guests: attending === "yes" ? Number(form.get("guests") || 1) : 0,
      message: String(form.get("message") ?? "").trim(),
    };
    setStatus("sending");
    try {
      if (config.formEndpoint) {
        const res = await fetch(config.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(reply),
        });
        if (!res.ok) throw new Error(String(res.status));
      }
      if (config.whatsappNumber) {
        const lines = [
          t.rsvpFor(coupleNames),
          `${t.rsvpName}: ${reply.name}`,
          reply.attending ? t.rsvpAttendingYes(reply.guests) : t.rsvpAttendingNo,
          reply.message && `${t.rsvpMessage}: ${reply.message}`,
        ].filter(Boolean);
        const url = `https://wa.me/${config.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
        window.open(url, "_blank", "noopener");
      }
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-field-border bg-field/70 px-6 py-8">
        <Check className="mx-auto mb-3 size-8 text-primary" />
        <p className="font-script text-3xl text-primary">{t.thanks}</p>
        <p className="mt-2 text-sm text-muted">{t.thanksSub}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-5 text-start">
      <div className="space-y-2">
        <label htmlFor="rsvp-name" className="block text-sm font-medium text-foreground">
          {t.yourName}
          <span className="ms-0.5 text-red-600">*</span>
        </label>
        <input id="rsvp-name" name="name" required placeholder={t.fullNamePlaceholder} className={`${field} h-10`} />
      </div>
      <div className="space-y-2">
        <label htmlFor="rsvp-attending" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Users className="size-4" /> {t.attending}
          <span className="text-red-600">*</span>
        </label>
        <select
          id="rsvp-attending"
          name="attending"
          required
          value={attending}
          onChange={(e) => setAttending(e.target.value)}
          className={`${field} h-10 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%235f6d55' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10 rtl:bg-[left_12px_center] rtl:pl-10 rtl:pr-3`}
        >
          <option value="" disabled>
            {t.select}
          </option>
          <option value="yes">{t.yes}</option>
          <option value="no">{t.no}</option>
        </select>
      </div>
      {attending === "yes" && (
        <div className="space-y-2">
          <label htmlFor="rsvp-guests" className="block text-sm font-medium text-foreground">
            {t.guests}
          </label>
          <input
            id="rsvp-guests"
            name="guests"
            type="number"
            min={1}
            max={20}
            defaultValue={1}
            className={`${field} h-10`}
          />
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="rsvp-message" className="block text-sm font-medium text-foreground">
          {t.yourMessage}
        </label>
        <textarea
          id="rsvp-message"
          name="message"
          rows={3}
          placeholder={t.messagePlaceholder}
          className={`${field} resize-y py-2`}
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="h-10 w-full rounded-md bg-primary text-sm font-medium text-cream transition hover:bg-primary/90 disabled:opacity-60"
      >
        {status === "sending" ? t.sending : t.send}
      </button>
      {status === "error" && <p className="text-center text-sm text-red-700">{t.sendError}</p>}
      {status === "unconfigured" && <p className="text-center text-sm text-red-700">{t.unconfigured}</p>}
    </form>
  );
}
