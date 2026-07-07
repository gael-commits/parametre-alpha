// TIER 3 shared choreography pieces used by both page choreographies (home.ts, sector.ts):
// the hero moment, the mark moment, the baseline scroll reveals, the steps moment and the
// footer moment. Timelines are code; the only numbers allowed here are local staggers,
// distances, delays and trigger positions. Durations/eases come from effects (tier 2),
// which read tokens (tier 1).
//
// LAB PHASE NOTE: the a/b/c branches are the /motion-lab candidates for the 2026-07-07
// taste picks. After the WDEC lock, losing branches are deleted and the pick types collapse.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revertSplits } from './effects';

export interface ChoreoCtx {
  mobile: boolean; // max-width 639: per-item triggers, shorter distances, later starts
}

export type HeroPick = 'a' | 'b' | 'c'; // a fade-up breathe | b ink block reveal (LOCKED, Gael 2026-07-07) | c SplitText lines
export type FollowPick = 'a' | 'b' | 'c'; // hero followers (sub + CTA): a crisp fade-up | b masked line rise | c mini block reveal
export type StepsPick = 'a' | 'b' | 'c' | 'd'; // a fade-up breathe | b mask wipe | c crisp steps + closing heading breathes | d masked line rise
export type RevealPick = 'a' | 'b' | 'c'; // a uniform 12px | b differentiated by weight | c headings block-reveal + body offset
export type MarkPick = 'a' | 'b' | 'c'; // a scale settle | b ink-dry fade | c static
export type FooterPick = 'a' | 'b'; // a still | b one crisp reveal

// Scroll-start convention: desktop fires at 85% of the viewport (75% for the step band,
// which needs its full width read as one gesture). Mobile fires later (88%) so a short
// viewport does not burn every trigger in the first screen and a half.
export const START = { base: 'top 85%', steps: 'top 75%', mobileItem: 'top 88%' } as const;

// Load chain (Gael 2026-07-07): a section already inside the first viewport at init must
// NOT fire parallel to the hero; it continues the hero's line cadence, in document order.
// Below-fold sections keep their scroll triggers. The chain delay = the hero's own delay
// plus its line slots, then one step per queued section.
// Chain base = when the hero headline's peel is landing (delay 0.1 + line-2 start 0.15
// + clip 0.6 + half-overlap 0.3 at breathing tempo, rounded). Starting the next block
// here reads as "after the hero, in sequence"; earlier reads as parallel (Gael's note).
const CHAIN_BASE = 1.0;
const CHAIN_STEP = 0.15;
let chainIndex = 0;
export function resetLoadChain(): void {
  chainIndex = 0;
}
function loadChainDelay(el: HTMLElement, ctx: ChoreoCtx): number | null {
  const pct = ctx.mobile ? 0.88 : 0.85; // mirrors the trigger starts above
  if (el.getBoundingClientRect().top >= window.innerHeight * pct) return null;
  return CHAIN_BASE + chainIndex++ * CHAIN_STEP;
}

export function heroMoment(
  pick: HeroPick,
  follow: FollowPick,
  headlineSel: string,
  ctx: ChoreoCtx,
): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const items = gsap.utils.toArray<HTMLElement>('[data-hero-item]', hero);
  if (!items.length) return;
  const headline = hero.querySelector<HTMLElement>(headlineSel);
  const rest = items.filter((el) => el !== headline);
  const dist = ctx.mobile ? 12 : 16;

  // The followers (sub + CTA) enter as part of the same hero gesture, offset past the
  // headline's first phase. One hero moment in the breathing count, not three.
  // The CTA button always wipes its fill in (maskReveal crisp): a filled button fading
  // was the flat note Gael flagged; the wipe is the button's own gesture on every variant.
  const followers = (delay: number) => {
    if (!rest.length) return;
    const cta = rest[rest.length - 1];
    const texts = rest.slice(0, -1);
    if (follow === 'b') {
      // Masked line rise at crisp tempo on the text lines.
      if (texts.length) {
        gsap.set(texts, { autoAlpha: 1 });
        gsap.effects.linesUp(texts, { breathe: false, delay, stagger: 0.07 });
      }
    } else if (follow === 'c') {
      // Mini block reveals echoing the headline (Lando uses tint blocks on body text).
      if (texts.length) {
        gsap.set(texts, { autoAlpha: 1 });
        gsap.effects.blockReveal(texts, { breathe: false, delay, stagger: 0.12 });
      }
    } else if (texts.length) {
      gsap.effects.revealUp(texts, { stagger: 0.09, delay });
    }
    gsap.effects.maskReveal(cta, { breathe: false, delay: delay + 0.2 });
  };

  if (pick === 'b' && headline) {
    // Breathing slot #1 spent on the ink wipe (LOCKED hero treatment).
    gsap.set(rest, { autoAlpha: 0 });
    gsap.effects.blockReveal(headline, { delay: 0.1 });
    followers(0.5);
  } else if (pick === 'c' && headline) {
    gsap.set(rest, { autoAlpha: 0 });
    gsap.effects.linesUp(headline, { delay: 0.1, stagger: 0.1 });
    followers(0.55);
  } else {
    // Previous live treatment: the whole hero rises at breathing tempo.
    gsap.effects.revealUp(items, { breathe: true, distance: dist, stagger: 0.12, delay: 0.1 });
  }
}

// The quieter sector-hero sibling: crisp baseline, no breathing slot spent on entry.
export function heroQuiet(ctx: ChoreoCtx): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const items = gsap.utils.toArray<HTMLElement>('[data-hero-item]', hero);
  gsap.effects.revealUp(items, { distance: ctx.mobile ? 8 : 12, stagger: 0.08, delay: 0.1 });
}

export function markMoment(pick: MarkPick): void {
  const colon = document.querySelector('[data-breathe-mark]');
  if (!colon || pick === 'c') return; // c: the colon just is; no entrance
  gsap.effects.colonSettle(colon, { mode: pick === 'b' ? 'inkdry' : 'settle' });
}

// Baseline scroll reveals for every [data-reveal] surface, excluding the step band
// (which is a dedicated moment) and optionally the closing section (steps pick c).
export function baselineReveals(pick: RevealPick, ctx: ChoreoCtx, skipClosing = false): void {
  const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  reveals.forEach((el) => {
    if (skipClosing && el.classList.contains('closing')) return;
    const stagger = el.dataset.revealStagger === 'true';

    // Pick c (Gael's direction 2026-07-07): every section HEADING takes the block
    // reveal at crisp tempo (the hero gesture as the heading signature, baseline
    // pattern because the tempo is crisp, not breathing), slightly offset from its
    // body, which enters differently (fade-up; CTAs wipe their fill).
    if (pick === 'c' && !stagger) {
      // Structural headings only (section level or one wrapper deep) - never headings
      // inside list items (the sector strip's h3s belong to their card's flow).
      const heading = el.matches('h1, h2, h3')
        ? el
        : el.querySelector<HTMLElement>(
            ':scope > h1, :scope > h2, :scope > h3, :scope > * > h1, :scope > * > h2, :scope > * > h3',
          );
      if (heading) {
        // The body = the heading's SIBLINGS (same wrapper), not the section's wrapper div.
        const body =
          heading === el
            ? []
            : (Array.from(heading.parentElement!.children) as HTMLElement[]).filter(
                (ch) => ch !== heading,
              );
        const ctas = body.filter((b) => b.matches('a'));
        const prose = body.filter((b) => !b.matches('a'));
        gsap.set(el, { autoAlpha: 1, y: 0 });
        gsap.set(heading, { autoAlpha: 0 });
        if (prose.length) gsap.set(prose, { autoAlpha: 0, y: ctx.mobile ? 8 : 12 });
        const fire = (at: number) => {
          gsap.set(heading, { autoAlpha: 1 }); // blockReveal's clip re-hides it instantly
          gsap.effects.blockReveal(heading, { breathe: false, stagger: 0.1, delay: at });
          if (prose.length)
            gsap.effects.revealUp(prose, { delay: at + 0.2, stagger: 0.08 });
          if (ctas.length)
            gsap.effects.maskReveal(ctas, { breathe: false, delay: at + 0.35 });
        };
        const chained = loadChainDelay(el, ctx);
        if (chained !== null) fire(chained);
        else
          ScrollTrigger.create({
            trigger: el,
            start: ctx.mobile ? START.mobileItem : START.base,
            once: true,
            onEnter: () => fire(0),
          });
        return;
      }
    }

    const children = stagger ? (Array.from(el.children) as HTMLElement[]) : [el];
    // Differentiated weights (pick b): metadata bands (proof strip, sector strip) fade
    // in place; prose sections keep the rise. Weight is semantic (section role), never
    // a pixel position, so a later grid re-seat does not invalidate the choreography.
    const minor =
      pick === 'b' && (el.classList.contains('proof__row') || !!el.closest('.proof, .sectors'));
    const distance = minor ? 0 : ctx.mobile ? 8 : 12;

    if (stagger) {
      // Explicit inline values: the CSS [data-reveal] pre-hide must be overridden, not cleared.
      gsap.set(el, { autoAlpha: 1, y: 0 });
      gsap.set(children, { autoAlpha: 0, y: distance });
      if (ctx.mobile) {
        // Single-column lists: one trigger per item, or off-screen items animate unseen.
        children.forEach((child) => {
          const chained = loadChainDelay(child, ctx);
          if (chained !== null) {
            gsap.effects.revealUp(child, { distance, delay: chained });
            return;
          }
          ScrollTrigger.create({
            trigger: child,
            start: START.mobileItem,
            once: true,
            onEnter: () => gsap.effects.revealUp(child, { distance }),
          });
        });
        return;
      }
    }
    const chained = loadChainDelay(el, ctx);
    if (chained !== null) {
      gsap.effects.revealUp(children, { distance, stagger: stagger ? 0.09 : 0, delay: chained });
      return;
    }
    ScrollTrigger.create({
      trigger: el,
      start: START.base,
      once: true,
      onEnter: () => gsap.effects.revealUp(children, { distance, stagger: stagger ? 0.09 : 0 }),
    });
  });
}

// The step band ([data-steps]): breathing slot #2 on picks a/b; pick c demotes the steps
// to the crisp baseline and moves the slot to the closing heading's masked line rise.
export function stepsMoment(pick: StepsPick, ctx: ChoreoCtx): void {
  const wrap = document.querySelector<HTMLElement>('[data-steps]');
  if (wrap) {
    const items = gsap.utils.toArray<HTMLElement>('[data-step]', wrap);
    gsap.set(items, {
      autoAlpha: 0,
      y: pick === 'b' || pick === 'd' ? 0 : ctx.mobile ? 12 : 20,
    });

    const play = (targets: HTMLElement | HTMLElement[], stagger: number, at = 0) => {
      if (pick === 'b') gsap.effects.maskReveal(targets, { stagger, delay: at });
      else if (pick === 'c')
        gsap.effects.revealUp(targets, { stagger, distance: ctx.mobile ? 8 : 12, delay: at });
      else if (pick === 'd') {
        // Masked line rise inside each step (the hero-C gesture at the second slot):
        // every text line of the band rises behind its mask, breathing tempo.
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        gsap.effects.linesUp(targets, { stagger: 0.07, delay: at });
      } else
        gsap.effects.revealUp(targets, {
          breathe: true,
          distance: ctx.mobile ? 12 : 20,
          stagger,
          delay: at,
        });
    };

    if (ctx.mobile) {
      items.forEach((item) => {
        const chained = loadChainDelay(item, ctx);
        if (chained !== null) {
          play(item, 0, chained);
          return;
        }
        ScrollTrigger.create({
          trigger: item,
          start: START.mobileItem,
          once: true,
          onEnter: () => play(item, 0),
        });
      });
    } else {
      const chained = loadChainDelay(wrap, ctx);
      if (chained !== null) play(items, pick === 'c' ? 0.09 : 0.22, chained);
      else
        ScrollTrigger.create({
          trigger: wrap,
          start: START.steps,
          once: true,
          onEnter: () => play(items, pick === 'c' ? 0.09 : 0.22),
        });
    }
  }

  if (pick === 'c') {
    // Slot #2 relocated: the closing invitation breathes instead of the working steps.
    const closing = document.querySelector<HTMLElement>('.closing');
    const heading = closing?.querySelector<HTMLElement>('.closing__heading');
    if (!closing || !heading) return;
    const rest = (Array.from(closing.querySelectorAll('.closing__body, .closing__cta')) as HTMLElement[]);
    gsap.set(closing, { autoAlpha: 1, y: 0 });
    gsap.set(heading, { autoAlpha: 0 });
    gsap.set(rest, { autoAlpha: 0 });
    ScrollTrigger.create({
      trigger: closing,
      start: START.base,
      once: true,
      onEnter: () => {
        gsap.set(heading, { autoAlpha: 1 });
        gsap.effects.linesUp(heading, { stagger: 0.1 });
        gsap.effects.revealUp(rest, { stagger: 0.09, delay: 0.35 });
      },
    });
  }
}

// The footer: still by default (pick a). Pick b licenses ONE crisp entrance for the
// footer block, baseline tempo, no breathing slot spent.
export function footerMoment(pick: FooterPick, ctx: ChoreoCtx): void {
  if (pick !== 'b') return;
  const inner = document.querySelector<HTMLElement>('.site-footer__inner');
  if (!inner) return;
  const children = Array.from(inner.children) as HTMLElement[];
  gsap.set(children, { autoAlpha: 0, y: 8 });
  ScrollTrigger.create({
    trigger: inner,
    start: ctx.mobile ? START.mobileItem : 'top 92%',
    once: true,
    onEnter: () => gsap.effects.revealUp(children, { distance: 8, stagger: 0.08 }),
  });
}

// Letter-roll hover on the CTA buttons (the Lando text-hover: every letter in a span,
// the label rolls up and its duplicate rolls in from below, per-letter delay). Pure CSS
// does the animation (HomeLayout, gated behind prefers-reduced-motion); this only builds
// the DOM once. No-JS: buttons stay plain text.
export function initButtonRoll(): void {
  const buttons = document.querySelectorAll<HTMLElement>('.hero__cta, .closing__cta, .shero__cta');
  buttons.forEach((btn) => {
    if (btn.dataset.roll) return;
    const label = btn.textContent?.trim() ?? '';
    if (!label) return;
    btn.dataset.roll = 'true';
    btn.setAttribute('aria-label', label);
    const layer = (cls: string) => {
      const s = document.createElement('span');
      s.className = `roll__layer ${cls}`;
      s.setAttribute('aria-hidden', 'true');
      [...label].forEach((ch, i) => {
        const c = document.createElement('span');
        c.className = 'roll__ch';
        c.style.setProperty('--i', String(i));
        c.textContent = ch === ' ' ? ' ' : ch;
        s.appendChild(c);
      });
      return s;
    };
    btn.textContent = '';
    const wrap = document.createElement('span');
    wrap.className = 'roll';
    wrap.appendChild(layer('roll__a'));
    wrap.appendChild(layer('roll__b'));
    btn.appendChild(wrap);
  });
}

export { revertSplits };
