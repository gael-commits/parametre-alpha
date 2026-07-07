// TIER 1 of the 3-tier motion architecture (locked, Gael 2026-07-07).
// The CSS custom properties in src/styles/tokens.css are the SINGLE source for every
// duration and ease. This module reads them at init via getComputedStyle and registers
// the exact charter beziers with CustomEase, so CSS transitions (hovers) and GSAP
// entrances resolve from the same values. No motion literal may live anywhere else.

import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

// Breakpoints: MUST mirror the CSS media queries (max-width: 1023px / 639px) in
// HomeSections.astro + SectorSections.astro. Media queries cannot consume var(), so
// the values are declared once here as the convention (no PostCSS custom-media step,
// by decision). If a CSS breakpoint ever changes, change it here in the same commit.
export const BP = {
  desktopMin: 1024, // CSS: @media (max-width: 1023px)
  mobileMax: 639, // CSS: @media (max-width: 639px)
} as const;

export interface MotionTokens {
  durFast: number; // seconds
  durBase: number;
  durBreathe: number;
  easeOut: string; // CustomEase id for --ease-out (crisp Swiss baseline)
  easeBreathe: string; // CustomEase id for --ease-breathe (the 2 licensed moments ONLY)
  easeWipe: string; // CustomEase id for --ease-wipe (cover/wipe travel ONLY, in-out)
}

// Fallbacks mirror tokens.css so a failed read degrades to the charter values.
export const T: MotionTokens = {
  durFast: 0.2,
  durBase: 0.35,
  durBreathe: 0.6,
  easeOut: 'tokenEaseOut',
  easeBreathe: 'tokenEaseBreathe',
  easeWipe: 'tokenEaseWipe',
};

let loaded = false;

export function loadTokens(): MotionTokens {
  if (loaded || typeof window === 'undefined') return T;
  gsap.registerPlugin(CustomEase);

  const cs = getComputedStyle(document.documentElement);
  const seconds = (prop: string, fallback: number): number => {
    const v = cs.getPropertyValue(prop).trim();
    if (v.endsWith('ms')) return parseFloat(v) / 1000;
    if (v.endsWith('s')) return parseFloat(v);
    return fallback;
  };
  const bezier = (prop: string, fallback: string): string => {
    const m = cs.getPropertyValue(prop).match(/cubic-bezier\(([^)]+)\)/);
    return m ? m[1] : fallback;
  };

  T.durFast = seconds('--dur-fast', T.durFast);
  T.durBase = seconds('--dur-base', T.durBase);
  T.durBreathe = seconds('--dur-breathe', T.durBreathe);

  // The exact charter curves, not power-ease approximations (design-language 4.1/4.2).
  CustomEase.create(T.easeOut, bezier('--ease-out', '0.2, 0, 0, 1'));
  CustomEase.create(T.easeBreathe, bezier('--ease-breathe', '0.16, 1, 0.3, 1'));
  CustomEase.create(T.easeWipe, bezier('--ease-wipe', '0.65, 0, 0.35, 1'));

  loaded = true;
  return T;
}
