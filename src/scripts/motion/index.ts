// Motion entry point - the 3-tier architecture (locked, Gael 2026-07-07):
//   tier 1  tokens.ts   - CSS custom properties are the single source (CustomEase)
//   tier 2  effects.ts  - named gsap.registerEffect() vocabulary (5 effects)
//   tier 3  home.ts / sector.ts - per-page choreography AS CODE (no data-driven config)
//
// Responsive + reduced motion (locked): everything registers through gsap.matchMedia().
// prefers-reduced-motion is a matchMedia condition (no early return), so a live OS
// toggle reverts every animation and restores visible content. Breakpoints mirror the
// CSS values (1023/639) via the BP constants in tokens.ts.
//
// Charter (design-language section 4): entrance-only, fires once. Baseline crisp
// 200-350ms; exactly TWO breathing moments per page. Forbidden: parallax, loops,
// cursor-follow, bounce, scroll-jacking.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { loadTokens, BP } from './tokens';
import { registerEffects, revertSplits } from './effects';
import { initButtonRoll } from './shared';
import { homeChoreography, HOME_DEFAULTS, type HomePicks } from './home';
import { sectorChoreography, SECTOR_DEFAULTS, type SectorPicks } from './sector';

export type { HomePicks, SectorPicks };
export { HOME_DEFAULTS, SECTOR_DEFAULTS };

export interface MotionHandle {
  revert: () => void;
}

type InitArgs =
  | { page: 'home'; picks?: Partial<HomePicks> }
  | { page: 'sector'; picks?: Partial<SectorPicks> };

export function initMotion(args: InitArgs): MotionHandle {
  if (typeof window === 'undefined') return { revert() {} };

  gsap.registerPlugin(ScrollTrigger);
  loadTokens();
  registerEffects();
  // Hover affordance, breakpoint-independent (CSS gates it behind reduced-motion).
  initButtonRoll();

  // Wait for fonts before choreographing: SplitText line measurements (blockReveal,
  // linesUp) are only correct against the final faces. Resolves in ms on a warm cache.
  let mm: gsap.MatchMedia | null = null;
  let cancelled = false;
  const ready: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();
  ready.then(() => {
    if (cancelled) return;
    mm = buildMatchMedia(args);
  });

  return {
    revert: () => {
      cancelled = true;
      mm?.revert();
    },
  };
}

function buildMatchMedia(args: InitArgs): gsap.MatchMedia {
  const mm = gsap.matchMedia();
  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      mobile: `(max-width: ${BP.mobileMax}px)`,
      notMobile: `(min-width: ${BP.mobileMax + 1}px)`,
    },
    (mmCtx) => {
      const c = mmCtx.conditions as { reduce: boolean; mobile: boolean };
      // Reduced motion: register nothing. Content is visible via the CSS default
      // (the [data-reveal] pre-hide only applies under no-preference).
      if (c.reduce) return;

      const ctx = { mobile: c.mobile };
      if (args.page === 'sector') {
        sectorChoreography({ ...SECTOR_DEFAULTS, ...args.picks }, ctx);
      } else {
        homeChoreography({ ...HOME_DEFAULTS, ...args.picks }, ctx);
      }

      // Cleanup on condition change (breakpoint cross, reduced-motion toggle, revert):
      // matchMedia reverts tweens/ScrollTriggers; SplitText DOM needs the explicit pass.
      return () => revertSplits();
    },
  );
  return mm;
}
