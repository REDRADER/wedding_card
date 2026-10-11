import type { Metadata, Viewport } from "next";
import { Amiri, Aref_Ruqaa, Cormorant_Garamond, Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

// Mincho for names and headings, a clean gothic for body text, Cormorant italic for accents.
const shippori = Shippori_Mincho({ variable: "--font-shippori", subsets: ["latin"], weight: ["400", "500", "600"] });
const zenKaku = Zen_Kaku_Gothic_New({ variable: "--font-zen-kaku", subsets: ["latin"], weight: ["300", "400", "500"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});
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
  themeColor: "#fbf4f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={[shippori, zenKaku, cormorant, arefRuqaa, amiri].map((f) => f.variable).join(" ")}>
      <body>{children}</body>
    </html>
  );
}
