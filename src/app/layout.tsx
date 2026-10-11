import type { Metadata, Viewport } from "next";
import {
  Amiri,
  Aref_Ruqaa,
  Cormorant_Garamond,
  Dancing_Script,
  Great_Vibes,
  Lora,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const dancing = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] });
const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400", "500", "600"] });
// Arabic: Ruqʿah calligraphy for names and headings, Naskh for everything else.
// Not preloaded: they're only fetched once a page actually switches to Arabic.
const arefRuqaa = Aref_Ruqaa({
  variable: "--font-aref-ruqaa",
  subsets: ["arabic"],
  weight: ["400", "700"],
  preload: false,
});
const amiri = Amiri({ variable: "--font-amiri", subsets: ["arabic"], weight: ["400", "700"], preload: false });

export const metadata: Metadata = {
  title: "Wedding Invitations",
  description: "Digital wedding invitations",
};

export const viewport: Viewport = {
  themeColor: "#0f0f0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={[dancing, greatVibes, cormorant, playfair, lora, arefRuqaa, amiri].map((f) => f.variable).join(" ")}
    >
      <body>{children}</body>
    </html>
  );
}
