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
  type FooterPick,
  type HeroPick,
  type MarkPick,
  type RevealPick,
  type StepsPick,
} from './shared';

export interface SectorPicks {
  hero: 'same' | 'quiet';
  homeHero: HeroPick; // which homepage hero pattern 'same' mirrors
  steps: StepsPick;
  reveal: RevealPick;
  mark: MarkPick;
  footer: FooterPick;
}

export const SECTOR_DEFAULTS: SectorPicks = {
  hero: 'same',
  homeHero: 'a',
  steps: 'a',
  reveal: 'a',
  mark: 'a',
  footer: 'a',
};

export function sectorChoreography(picks: SectorPicks, ctx: ChoreoCtx): void {
  // Breathing budget audit: 'same' spends slot #1 on the hero; 'quiet' leaves the hero
  // at the crisp baseline (only the mark's colon breathes above the fold).
  // Slot #2 = approach steps (picks a/b) or the closing heading (pick c).
  if (picks.hero === 'quiet') heroQuiet(ctx);
  else heroMoment(picks.homeHero, '.shero__headline', ctx);
  markMoment(picks.mark);
  baselineReveals(picks.reveal, ctx, picks.steps === 'c');
  stepsMoment(picks.steps, ctx);
  footerMoment(picks.footer, ctx);
}
