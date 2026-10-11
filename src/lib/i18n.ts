// Used by client components only (React context).
import { createContext, useContext } from "react";
import type { InvitationData } from "./invitation";

export type Lang = "en" | "ar";

const en = {
  switchTo: "العربية",
  openInvitation: "Open the invitation",
  playMusic: "Play music",
  muteMusic: "Mute music",
  scroll: "Scroll",
  scratchTitle: "Scratch to Reveal",
  scratchHint: "Scratch the heart",
  scratchAria: "Scratch the heart to reveal the date",
  youreInvited: "You're Invited!",
  saveTheDate: "Save the Date",
  googleCalendar: "Google Calendar",
  outlook: "Outlook",
  appleCalendar: "Apple Calendar (.ics)",
  showPhoto: (n: number) => `Show photo ${n}`,
  countdownTitle: "Counting Down to Forever",
  units: ["Days", "Hours", "Minutes", "Seconds"],
  celebrationBegun: "The celebration has begun!",
  program: "Program Timeline",
  venue: "Venue",
  mapOf: (name: string) => `Map of ${name}`,
  viewOnMaps: "View on Google Maps",
  dressCode: "Dress Code",
  women: "Women",
  men: "Men",
  preEvents: "Pre-Wedding Events",
  transportation: "Transportation",
  accommodation: "Accommodation",
  gifts: "Gifts",
  rsvp: "RSVP",
  yourName: "Your Name",
  fullNamePlaceholder: "Your full name",
  attending: "Will you be attending?",
  select: "Select...",
  yes: "Yes, I'll be there!",
  no: "Sorry, I can't make it",
  guests: "Number of guests",
  yourMessage: "Your Message",
  messagePlaceholder: "Write your wishes...",
  send: "Send Message",
  sending: "Sending...",
  thanks: "Thank you!",
  thanksSub: "Your reply means the world to us.",
  sendError: "Something went wrong. Please try again.",
  unconfigured: "RSVP isn't connected yet. Add rsvp.whatsappNumber or rsvp.formEndpoint to this invitation's JSON.",
  rsvpFor: (names: string) => `RSVP for ${names}`,
  rsvpName: "Name",
  rsvpAttendingYes: (n: number) => `Attending: Yes (${n} guest${n === 1 ? "" : "s"})`,
  rsvpAttendingNo: "Attending: No",
  rsvpMessage: "Message",
  closing: "We can't wait to celebrate with you!",
  and: "&",
  joinNames: (a: string, b: string) => `${a} & ${b}`,
  weddingOf: (names: string) => `${names} - Wedding`,
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  switchTo: "English",
  openInvitation: "افتح الدعوة",
  playMusic: "تشغيل الموسيقى",
  muteMusic: "كتم الموسيقى",
  scroll: "مرّر",
  scratchTitle: "امسح لتكشف",
  scratchHint: "امسح القلب",
  scratchAria: "امسح القلب لتكشف الموعد",
  youreInvited: "أنتم مدعوون!",
  saveTheDate: "احفظ الموعد",
  googleCalendar: "تقويم Google",
  outlook: "Outlook",
  appleCalendar: "تقويم Apple (.ics)",
  showPhoto: (n) => `عرض الصورة ${n}`,
  countdownTitle: "العد التنازلي ليومنا",
  units: ["أيام", "ساعات", "دقائق", "ثوانٍ"],
  celebrationBegun: "لقد بدأ الاحتفال!",
  program: "برنامج الحفل",
  venue: "المكان",
  mapOf: (name) => `خريطة ${name}`,
  viewOnMaps: "عرض على خرائط Google",
  dressCode: "قواعد اللباس",
  women: "السيدات",
  men: "الرجال",
  preEvents: "مناسبات ما قبل الزفاف",
  transportation: "المواصلات",
  accommodation: "الإقامة",
  gifts: "الهدايا",
  rsvp: "تأكيد الحضور",
  yourName: "الاسم",
  fullNamePlaceholder: "اسمك الكامل",
  attending: "هل ستحضر؟",
  select: "اختر...",
  yes: "نعم، سأحضر بإذن الله",
  no: "أعتذر، لن أتمكن من الحضور",
  guests: "عدد الضيوف",
  yourMessage: "رسالتك",
  messagePlaceholder: "اكتب تهانيك...",
  send: "إرسال",
  sending: "جارٍ الإرسال...",
  thanks: "شكراً لكم!",
  thanksSub: "ردّكم يعني لنا الكثير.",
  sendError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  unconfigured: "لم يتم ربط تأكيد الحضور بعد. أضف rsvp.whatsappNumber أو rsvp.formEndpoint إلى ملف الدعوة.",
  rsvpFor: (names) => `تأكيد حضور - ${names}`,
  rsvpName: "الاسم",
  rsvpAttendingYes: (n) => `الحضور: نعم (${n} ${n === 1 ? "ضيف" : "ضيوف"})`,
  rsvpAttendingNo: "الحضور: لا",
  rsvpMessage: "الرسالة",
  closing: "بانتظاركم لنحتفل معاً!",
  and: "و",
  joinNames: (a, b) => `${a} و${b}`,
  weddingOf: (names) => `زفاف ${names}`,
};

export const DICTIONARIES: Record<Lang, Dictionary> = { en, ar };

/** Intl locale per language. Arabic uses Arabic-Indic digits (٣١). */
export const LOCALES: Record<Lang, string> = { en: "en-US", ar: "ar-u-nu-arab" };

export type I18n = { lang: Lang; t: Dictionary; locale: string };

export const I18nContext = createContext<I18n>({ lang: "en", t: en, locale: LOCALES.en });

export function useI18n() {
  return useContext(I18nContext);
}

// Headings fall back to the dictionary, never to the English JSON value, so a page in
// Arabic never mixes in English section titles the author didn't translate.
const LABEL_KEYS = new Set(["title", "revealLabel"]);

function merge(base: unknown, over: unknown, dropLabels: boolean): unknown {
  if (Array.isArray(base)) {
    const o = Array.isArray(over) ? over : [];
    return base.map((item, i) => merge(item, o[i], dropLabels));
  }
  if (base && typeof base === "object") {
    // A text section written as an object in English but as a plain string in Arabic.
    if (typeof over === "string" && "text" in base) over = { text: over };
    const o = over && typeof over === "object" ? (over as Record<string, unknown>) : {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(base)) {
      if (dropLabels && LABEL_KEYS.has(k) && o[k] === undefined) continue;
      out[k] = merge(v, o[k], dropLabels);
    }
    for (const [k, v] of Object.entries(o)) if (!(k in base)) out[k] = v;
    return out;
  }
  // Strings in the base can be replaced by a plain string, e.g. transportation: "..."
  return over ?? base;
}

/** The invitation as seen in `lang`: the `ar` block's text laid over the English content. */
export function localize<T extends InvitationData>(inv: T, lang: Lang): T {
  if (lang === "en" || !inv.ar) return inv;
  return merge(inv, inv.ar, true) as T;
}
