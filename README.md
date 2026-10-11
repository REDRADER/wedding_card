<img src="assets/icon.svg" width="64" height="64" alt="">

# zaid wedding card

Animated digital wedding invitations. Each JSON file in `data/invitations/` becomes its own page at
`/invite/<file-name>`.

Built with Next.js (App Router), Tailwind CSS v4, `motion` and `lucide-react`.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

`/` lists every invitation; `/invite/zaid-aisha` is the full English/Arabic demo and `/invite/sample-minimal`
shows how sections disappear when you leave them out.

## Make a new invitation

1. Copy `data/invitations/zaid-aisha.json` to `data/invitations/<slug>.json` (lowercase letters, digits
   and dashes; the slug is the URL).
2. Edit the details. Delete any section you don't want.
3. Put the couple's photos in `public/images/` and list them under `slideshow`.

Files starting with `_` are ignored, so `_draft.json` won't be published. If a file is broken, the page
error tells you which field is wrong.

### Fields

| Field | Required | Notes |
| --- | --- | --- |
| `template` | yes | `"royal-grace"` |
| `couple.groom` / `couple.bride` | yes | `{ "name": "Zaid", "details": "Son of ...\nB.E." }`. `\n` starts a new line. |
| `couple.brideFirst` | | `true` puts the bride's name first. |
| `event.date` / `event.time` / `event.timezone` | yes | `"2027-01-31"`, `"10:30"` (24h), `"Asia/Kolkata"`. Drives the scratch card, countdown and calendar links. |
| `event.title`, `event.durationHours` | | Used for "Save the Date" calendar entries (default 4 hours). |
| `headline` | | Line above the names, e.g. "We're getting married". |
| `welcomeMessage` | | First section after the hero. |
| `scratchCard` | | `{ "title", "revealLabel" }`, or `false` to show a plain date instead. |
| `slideshow` | | Array of image paths/URLs. |
| `countdown` | | `{ "title" }`, or `false` to hide. |
| `program`, `preEvents` | | `{ "title", "items": [{ "name", "dateTime": "2027-01-31T10:00", "description" }] }`. Grouped by day automatically. |
| `venue` | | `{ "name", "address", "mapsUrl"?, "mapQuery"? }`. The map embed and button are built from name + address unless you override them. |
| `dressCode` | | `{ "women", "men", "title"? }` |
| `transportation`, `accommodation`, `gifts` | | A string, or `{ "title", "text" }`. |
| `rsvp` | | See below. |
| `closing` | | `{ "message", "signature" }` |
| `music` | | `{ "enabled": false }` to turn music off, or `{ "src": "/my-song.mp3" }` to change it. |
| `seo` | | `{ "title", "description" }` for the browser tab and link previews. |
| `ar` | | Arabic text; adds the English/Arabic toggle. See below. |
| `defaultLanguage` | | `"en"` (default) or `"ar"`: the language the page opens in. |

### Arabic

Add an `ar` block with the same shape as the rest of the file, containing only the text in Arabic.
The page then shows an "العربية" / "English" button, and in Arabic it switches to right-to-left with
Arabic fonts: Aref Ruqaa (calligraphy) for names and headings, Amiri for everything else. Dates, times
and the countdown use Arabic month names and digits (٣١ يناير ٢٠٢٧).

```json
"ar": {
  "couple": { "groom": { "name": "زيد" }, "bride": { "name": "عائشة" } },
  "headline": "نحتفل بزفافنا",
  "program": { "items": [{ "name": "استقبال الضيوف" }, { "name": "عقد القران" }] },
  "venue": { "name": "تاج لاندز إند" }
}
```

- Anything you leave out falls back to the English text. Section headings ("برنامج الحفل", "المكان",
  ...) are built in; set a `title` inside `ar` only to override one.
- List items (`program.items`, `preEvents.items`) are matched by position, and dates and times always come
  from the English list.
- The map always searches the English venue name and address.
- Link straight to a language with `?lang=ar` or `?lang=en`, e.g. `/invite/zaid-aisha?lang=ar`.

### RSVP

Replies go wherever the invitation's `rsvp` block points:

- `"whatsappNumber": "919876543210"` (country code + number, digits only) opens WhatsApp with the reply
  pre-filled to that number.
- `"formEndpoint": "https://..."` POSTs the reply as JSON (`invitation`, `name`, `attending`, `guests`,
  `message`) to any form backend, e.g. Formspree or a Google Apps Script that writes to a Sheet.

You can set both. With neither, the form shows a "not connected yet" notice instead of pretending it sent.

## How it's put together

- `src/app/invite/[slug]/page.tsx` loads the JSON (`src/lib/load-invitations.ts`) and prerenders one
  static page per file.
- `src/components/invitation/InvitationView.tsx` lays out the sections in order and owns music and
  the scroll lock.
- `IntroHero.tsx`: the intro video starts paused on its "tap to open" frame. A tap starts the video and
  the music; the names fade in over the final frame, then the page unlocks for scrolling.
- `src/lib/i18n.ts` has the built-in English/Arabic labels and merges the `ar` block over the English
  content. Fonts switch through CSS variables under `[lang="ar"]` in `globals.css`.
- `src/lib/templates.ts` holds each template's asset paths and colors. Colors are CSS variables mapped
  to Tailwind tokens (`text-primary`, `bg-field`, ...) in `src/app/globals.css`, so a new template is
  a new entry there plus its assets in `public/templates/<id>/`.

## Assets

`public/templates/royal-grace/` (intro video, backgrounds, music) is taken from zareqia.com's "Royal
Grace" template as a stand-in. It belongs to them: replace it with your own artwork and music before
publishing these invitations anywhere public. The poster and final-frame JPEGs are stills from the
video, so regenerate them when you swap the video.
