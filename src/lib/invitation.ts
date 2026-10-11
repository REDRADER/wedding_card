/**
 * Shape of one invitation JSON file in `data/invitations/<slug>.json`.
 * Every section except `couple` and `event` is optional: leave it out of the
 * JSON and the section is not rendered.
 */
export type InvitationData = {
  template: TemplateId;
  /** Language the page opens in. Visitors can switch when an `ar` block exists. */
  defaultLanguage?: "en" | "ar";
  /**
   * Arabic text, same shape as the rest of the file. Only text fields are read;
   * anything left out falls back to the English value (headings fall back to
   * built-in Arabic headings). List items are matched by position.
   */
  ar?: Translation;
  seo?: { title?: string; description?: string };
  couple: {
    groom: Person;
    bride: Person;
    /** Show the bride's name first in the hero. Defaults to groom first. */
    brideFirst?: boolean;
  };
  /** Small line above the names, e.g. "We're getting married". */
  headline?: string;
  welcomeMessage?: string;
  event: {
    /** YYYY-MM-DD */
    date: string;
    /** HH:mm, 24h */
    time: string;
    /** IANA zone the date/time is written in, e.g. "Asia/Kolkata". */
    timezone: string;
    /** Used for "Save the date" calendar entries. */
    title?: string;
    durationHours?: number;
  };
  scratchCard?: { title?: string; revealLabel?: string } | false;
  slideshow?: string[];
  countdown?: { title?: string } | false;
  program?: Schedule;
  venue?: {
    name: string;
    address?: string;
    /** Full Google Maps link for the button. Built from name + address when omitted. */
    mapsUrl?: string;
    /** Text the embedded map searches for. Defaults to "name, address". */
    mapQuery?: string;
  };
  dressCode?: { title?: string; women?: string; men?: string };
  preEvents?: Schedule;
  transportation?: TextSection;
  accommodation?: TextSection;
  gifts?: TextSection;
  rsvp?: {
    title?: string;
    /** Country code + number, digits only, e.g. "919876543210". Replies open in WhatsApp. */
    whatsappNumber?: string;
    /** Optional URL that receives the reply as a JSON POST (Formspree, Apps Script, ...). */
    formEndpoint?: string;
  };
  closing?: { message?: string; signature?: string };
  music?: { enabled?: boolean; src?: string };
};

export type TemplateId = "royal-grace";

type DeepPartial<T> = T extends string
  ? string
  : T extends (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export type Translation = DeepPartial<
  Pick<
    InvitationData,
    | "seo"
    | "couple"
    | "headline"
    | "welcomeMessage"
    | "scratchCard"
    | "countdown"
    | "program"
    | "venue"
    | "dressCode"
    | "preEvents"
    | "transportation"
    | "accommodation"
    | "gifts"
    | "rsvp"
    | "closing"
  >
> & { event?: { title?: string } };

export type Person = { name: string; details?: string };

export type ScheduleItem = {
  name: string;
  /** YYYY-MM-DDTHH:mm in the event timezone */
  dateTime: string;
  description?: string;
};

export type Schedule = { title?: string; items: ScheduleItem[] };

/** Either a plain string or an object with a custom heading. */
export type TextSection = string | { title?: string; text: string };

export type Invitation = InvitationData & { slug: string };

export const TEMPLATE_IDS: TemplateId[] = ["royal-grace"];

export function textOf(section: TextSection | undefined): { title?: string; text: string } | null {
  if (!section) return null;
  return typeof section === "string" ? { text: section } : section;
}

export function coupleNames(inv: InvitationData): string {
  const { groom, bride, brideFirst } = inv.couple;
  return brideFirst ? `${bride.name} & ${groom.name}` : `${groom.name} & ${bride.name}`;
}
