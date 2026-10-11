import type { CSSProperties } from "react";
import type { TemplateId } from "./invitation";

export type TemplateTheme = {
  assets: { music: string };
  /** Exposed as CSS variables and mapped to Tailwind colors in globals.css. */
  colors: {
    ink: string;
    names: string;
    primary: string;
    foreground: string;
    muted: string;
    accent: string;
    divider: string;
    cream: string;
    field: string;
    fieldBorder: string;
    pageBg: string;
    /** Pastel washes for cards, tiles and patterns. */
    blush: string;
    lilac: string;
    mint: string;
    sky: string;
    butter: string;
  };
  scratch: { gradient: [string, string, string]; speck: [string, string, string]; sparkle: string };
  confetti: string[];
};

// Pastel, modern-Japanese: sakura, wisteria, matcha and a vermilion hanko seal.
const sakura: TemplateTheme = {
  assets: { music: "/templates/sakura/music.mp3" },
  colors: {
    ink: "#463f53",
    names: "#4f3f62",
    primary: "#8f6a8f",
    foreground: "#3d3648",
    muted: "#776d84",
    accent: "#e2848f",
    divider: "#c9b6d4",
    cream: "#fffaf7",
    field: "#f8eff4",
    fieldBorder: "#ead9e4",
    pageBg: "#fbf4f2",
    blush: "#f9d8df",
    lilac: "#e4dbf4",
    mint: "#d4ecdf",
    sky: "#d4e7f5",
    butter: "#fbefd1",
  },
  scratch: {
    gradient: ["#fde4ea", "#e9c8de", "#bfb2e3"],
    speck: ["255, 240, 245", "233, 200, 222", "191, 178, 227"],
    sparkle: "255, 255, 255",
  },
  confetti: ["#f7c6d2", "#e2848f", "#d9cdf2", "#c8e6d5", "#fbe6b8"],
};

const TEMPLATES: Record<TemplateId, TemplateTheme> = {
  sakura,
};

export function getTheme(id: TemplateId): TemplateTheme {
  return TEMPLATES[id];
}

export function themeStyle(theme: TemplateTheme): CSSProperties {
  const c = theme.colors;
  return {
    "--t-ink": c.ink,
    "--t-names": c.names,
    "--t-primary": c.primary,
    "--t-foreground": c.foreground,
    "--t-muted": c.muted,
    "--t-accent": c.accent,
    "--t-divider": c.divider,
    "--t-cream": c.cream,
    "--t-field": c.field,
    "--t-field-border": c.fieldBorder,
    "--t-page-bg": c.pageBg,
    "--t-blush": c.blush,
    "--t-lilac": c.lilac,
    "--t-mint": c.mint,
    "--t-sky": c.sky,
    "--t-butter": c.butter,
  } as CSSProperties;
}
