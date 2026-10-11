"use client";

import { useId, type CSSProperties } from "react";

/** useId() output isn't always safe inside url(#...), so strip it down. */
function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/** One notched sakura petal, pointing up from (0, 0). */
const PETAL = "M0 0 C-3.2 -2.2 -4.8 -6.6 -2.5 -9.4 L0 -8.1 L2.5 -9.4 C4.8 -6.6 3.2 -2.2 0 0 Z";

/** Five-petal cherry blossom, centered in a 20x20 box. */
export function Blossom({
  className = "",
  petal = "#f7c3cf",
  heart = "#e2848f",
  style,
}: {
  className?: string;
  petal?: string;
  heart?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} style={style} aria-hidden>
      <BlossomShape petal={petal} heart={heart} />
    </svg>
  );
}

function BlossomShape({ petal, heart }: { petal: string; heart: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((r) => (
        <path key={r} d={PETAL} fill={petal} transform={`rotate(${r})`} />
      ))}
      {[0, 72, 144, 216, 288].map((r) => (
        <line key={r} x1="0" y1="0" x2="0" y2="-3.6" stroke={heart} strokeWidth="0.5" transform={`rotate(${r + 36})`} />
      ))}
      <circle r="1.3" fill={heart} />
    </g>
  );
}

const BRANCH_BLOSSOMS: [x: number, y: number, scale: number, rotate: number, light: boolean][] = [
  [262, 34, 1.7, 10, false],
  [228, 66, 1.15, -20, true],
  [196, 46, 0.95, 30, true],
  [168, 92, 1.55, 5, false],
  [128, 104, 1.05, 40, true],
  [100, 134, 1.45, -12, false],
  [66, 142, 0.9, 22, true],
  [142, 70, 0.8, 0, false],
];
const BUDS: [number, number][] = [
  [212, 30],
  [84, 116],
  [44, 158],
  [186, 116],
];

/** A cherry branch reaching in from the top-right corner. Flip it with -scale-x-100. */
export function SakuraBranch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 190" className={className} aria-hidden>
      <g fill="none" stroke="#9b7b80" strokeLinecap="round">
        <path d="M302 6 C 250 30, 210 52, 176 84 S 110 124, 34 166" strokeWidth="5" />
        <path d="M232 40 C 214 32, 204 30, 196 26" strokeWidth="2.6" />
        <path d="M176 84 C 172 100, 180 110, 188 118" strokeWidth="2.4" />
        <path d="M128 110 C 112 108, 96 112, 84 118" strokeWidth="2.2" />
        <path d="M60 152 C 52 150, 48 154, 44 158" strokeWidth="1.8" />
        <path d="M160 92 C 152 82, 146 76, 142 70" strokeWidth="2" />
      </g>
      {BUDS.map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="3.2" ry="4.2" fill="#eea1b3" />
      ))}
      {BRANCH_BLOSSOMS.map(([x, y, s, r, light]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
          <BlossomShape petal={light ? "#fde1e7" : "#f6bccb"} heart="#e2848f" />
        </g>
      ))}
    </svg>
  );
}

/** Seigaiha: overlapping rings of waves. Fills its box. */
export function Seigaiha({
  className = "",
  colors = ["var(--color-sky)", "var(--color-lilac)"],
  line = "rgba(255,255,255,0.85)",
  size = 1,
}: {
  className?: string;
  colors?: [string, string];
  line?: string;
  size?: number;
}) {
  const id = useSvgId("seigaiha");
  // Rows top to bottom so each row overlaps the one above it.
  const scales: [number, number][] = [
    [0, -10],
    [40, -10],
    [20, 0],
    [0, 10],
    [40, 10],
    [20, 20],
    [0, 30],
    [40, 30],
  ];
  return (
    <svg className={className} aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="40" height="20" patternUnits="userSpaceOnUse" patternTransform={`scale(${size})`}>
          {scales.map(([x, y]) => (
            <g key={`${x}-${y}`} stroke={line} strokeWidth="1.1">
              <circle cx={x} cy={y} r="19.5" style={{ fill: colors[0] }} />
              <circle cx={x} cy={y} r="14.5" style={{ fill: colors[1] }} />
              <circle cx={x} cy={y} r="9.5" style={{ fill: colors[0] }} />
              <circle cx={x} cy={y} r="4.5" style={{ fill: colors[1] }} />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

const PETAL_COLORS = ["#f7c3cf", "#fbd9e1", "#f3b0c1", "#fde8ed"];

/** Petals drifting down the whole page. Positions are fixed so server and client agree. */
export function FallingPetals({ count = 16 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const size = 9 + ((i * 5) % 9);
        const style = {
          left: `${(i * 37 + 7) % 100}%`,
          "--duration": `${12 + ((i * 7) % 10)}s`,
          "--delay": `${-((i * 2.3) % 20)}s`,
          "--drift": `${(i % 2 ? 1 : -1) * (40 + ((i * 13) % 90))}px`,
          "--spin": `${(i % 3 ? 1 : -1) * (240 + ((i * 41) % 300))}deg`,
        } as CSSProperties;
        return (
          <span key={i} className="animate-petal-fall absolute top-0" style={style}>
            <span className="animate-petal-flutter block" style={{ animationDelay: `${-i * 0.7}s` }}>
              <svg viewBox="-5 -10 10 10" width={size} height={size} style={{ opacity: 0.85 }}>
                <path d={PETAL} fill={PETAL_COLORS[i % PETAL_COLORS.length]} />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Vermilion name seal with the couple's initials stacked, like a hanko. */
export function HankoSeal({ initials, className = "" }: { initials: [string, string]; className?: string }) {
  const id = useSvgId("hanko");
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        {/* Uneven ink, as if pressed by hand. */}
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" result="rough" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -4 3.1"
            result="speckle"
          />
          <feComposite in="rough" in2="speckle" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <rect x="6" y="6" width="88" height="88" rx="16" fill="var(--color-accent)" />
        <rect x="13" y="13" width="74" height="74" rx="11" fill="none" stroke="#fffaf7" strokeWidth="2.2" />
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fill="#fffaf7"
          fontSize="30"
          fontFamily="var(--f-display)"
          fontWeight="600"
        >
          {initials[0]}
        </text>
        <text
          x="50"
          y="77"
          textAnchor="middle"
          fill="#fffaf7"
          fontSize="30"
          fontFamily="var(--f-display)"
          fontWeight="600"
        >
          {initials[1]}
        </text>
      </g>
    </svg>
  );
}
