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

// LOCKED picks (Gael 2026-07-07, motion lab): hero b (Lando block reveal), steps d
// (masked line rise), reveal c (headings block-reveal system), mark b (ink-dry fade),
// footer b (one crisp entrance). follow: A-or-C pending Gael's browser compare.
export const HOME_DEFAULTS: HomePicks = {
  hero: 'b',
  follow: 'a',
  steps: 'd',
  reveal: 'c',
  mark: 'b',
  footer: 'b',
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
