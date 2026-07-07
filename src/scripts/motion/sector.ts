// TIER 3 - sector umbrella page choreography (/secteurs/*, /en/sectors/*).
// Same design system as the homepage; the open taste call is whether the sector hero
// repeats the homepage entrance or takes the quieter crisp sibling.

import {
  baselineReveals,
  footerMoment,
  heroMoment,
  heroQuiet,
  markMoment,
  stepsMoment,
  type ChoreoCtx,
  type FollowPick,
  type FooterPick,
  type HeroPick,
  type MarkPick,
  type RevealPick,
  type StepsPick,
} from './shared';

export interface SectorPicks {
  hero: 'same' | 'quiet'; // 'same' LOCKED (Gael 2026-07-07, after browser compare; reversed the earlier quiet lean)
  homeHero: HeroPick; // which homepage hero pattern 'same' mirrors (b = the locked one)
  follow: FollowPick;
  steps: StepsPick;
  reveal: RevealPick;
  mark: MarkPick;
  footer: FooterPick;
}

export const SECTOR_DEFAULTS: SectorPicks = {
  hero: 'same',
  homeHero: 'b',
  follow: 'a',
  steps: 'a',
  reveal: 'a',
  mark: 'a',
  footer: 'a',
};

export function sectorChoreography(picks: SectorPicks, ctx: ChoreoCtx): void {
  // Breathing budget audit: 'same' (LOCKED) spends slot #1 on the hero, mirroring the
  // homepage block reveal; 'quiet' kept for comparison only.
  // Slot #2 = approach steps (picks a/b/d) or the closing heading (pick c).
  if (picks.hero === 'quiet') heroQuiet(ctx);
  else heroMoment(picks.homeHero, picks.follow, '.shero__headline', ctx);
  markMoment(picks.mark);
  baselineReveals(picks.reveal, ctx, picks.steps === 'c');
  stepsMoment(picks.steps, ctx);
  footerMoment(picks.footer, ctx);
}
