import type { CSSProperties } from "react";
import type { TemplateId } from "./invitation";

export type TemplateTheme = {
  assets: {
    /** Portrait intro video. Its first frame is the "tap to open" screen, its last frame the hero. */
    introVideo: string;
    introPoster: string;
    introFinalFrame: string;
    /** Top of the content area. */
    welcomeBg: string;
    /** Repeats vertically below the welcome background. */
    generalBg: string;
    /** Anchored to the bottom of the closing section. */
    endBg: string;
    music: string;
  };
  /** welcomeBg height / width, used to start the repeating background right below it. */
  welcomeBgRatio: number;
  /** Seconds after the intro starts playing before the hero text fades in. */
  heroTextDelay: number;
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
  };
  scratch: { gradient: [string, string, string]; speck: [string, string, string]; sparkle: string };
};

const royalGrace: TemplateTheme = {
  assets: {
    introVideo: "/templates/royal-grace/intro.mp4",
    introPoster: "/templates/royal-grace/intro-poster.jpg",
    introFinalFrame: "/templates/royal-grace/intro-final.jpg",
    welcomeBg: "/templates/royal-grace/welcome-bg.jpg",
    generalBg: "/templates/royal-grace/general-bg.jpg",
    endBg: "/templates/royal-grace/end-bg.jpg",
    music: "/templates/royal-grace/music.mp3",
  },
  welcomeBgRatio: 1322 / 941,
  heroTextDelay: 6,
  colors: {
    ink: "#3b4432",
    names: "#3e5634",
    primary: "#4a5c3d",
    foreground: "#27331f",
    muted: "#5f6d55",
    accent: "#8a7a4e",
    divider: "#6b7d55",
    cream: "#faf9f4",
    field: "#f3eadb",
    fieldBorder: "#d9cfbd",
    pageBg: "#d6c5ac",
  },
  scratch: {
    gradient: ["#eee6d2", "#9aa584", "#4a5540"],
    speck: ["238, 230, 210", "154, 165, 132", "74, 85, 64"],
    sparkle: "247, 242, 230",
  },
};

const TEMPLATES: Record<TemplateId, TemplateTheme> = {
  "royal-grace": royalGrace,
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
  } as CSSProperties;
}
