// TIER 3 - homepage choreography (/home, /en/home). Composes tier-2 effects; the only
// numbers here are local relationships. Section roles, not pixel positions.

import {
  baselineReveals,
  footerMoment,
  heroMoment,
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

export interface HomePicks {
  hero: HeroPick;
  follow: FollowPick;
  steps: StepsPick;
  reveal: RevealPick;
  mark: MarkPick;
  footer: FooterPick;
}

// hero 'b' LOCKED (Gael 2026-07-07, motion lab). The rest defaults to the pre-deep-dive
// treatment until its pick lands in the WDEC.
export const HOME_DEFAULTS: HomePicks = {
  hero: 'b',
  follow: 'a',
  steps: 'a',
  reveal: 'a',
  mark: 'a',
  footer: 'a',
};

export function homeChoreography(picks: HomePicks, ctx: ChoreoCtx): void {
  // Breathing budget audit (design-language 4.2, max 2/page):
  //   slot #1 = hero entrance (+ the mark's colon settle, part of the same moment)
  //   slot #2 = step band (picks a/b/d) OR the closing heading (pick c)
  heroMoment(picks.hero, picks.follow, '.hero__headline', ctx);
  markMoment(picks.mark);
  baselineReveals(picks.reveal, ctx, picks.steps === 'c');
  stepsMoment(picks.steps, ctx);
  footerMoment(picks.footer, ctx);
}
