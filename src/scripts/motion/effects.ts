// TIER 2 of the 3-tier motion architecture (locked, Gael 2026-07-07).
// The licensed pattern vocabulary: named effects registered ONCE via gsap.registerEffect().
// Every effect consumes tier-1 tokens only; no literal duration or ease in this file.
// Local numbers (staggers, distances, delays) belong to the tier-3 caller.
// Ceiling: ~5-6 effects. Adding a 7th means one of these should die first.

import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { T } from './tokens';

let registered = false;

// SplitText instances alter the DOM; gsap.matchMedia cleanup calls revertSplits() so a
// breakpoint change or lab replay restores the original markup before re-choreographing.
const splits: SplitText[] = [];
export function revertSplits(): void {
  while (splits.length) splits.pop()!.revert();
}

export function registerEffects(): void {
  if (registered) return;
  registered = true;
  gsap.registerPlugin(SplitText);

  // revealUp - THE baseline entrance: fade + small rise, crisp. breathe:true upgrades it
  // to breathing tempo (slower, --ease-breathe). The caller owns the 2-breathe-per-page
  // count; this effect cannot know how many times it has been licensed.
  gsap.registerEffect({
    name: 'revealUp',
    effect: (targets: gsap.TweenTarget, c: Record<string, any>) =>
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y: c.distance },
        {
          autoAlpha: 1,
          y: 0,
          duration: c.breathe ? T.durBreathe : T.durBase,
          ease: c.breathe ? T.easeBreathe : T.easeOut,
          stagger: c.stagger,
          delay: c.delay,
          overwrite: 'auto',
        },
      ),
    defaults: { distance: 12, stagger: 0, delay: 0, breathe: false },
  });

  // blockReveal - the highlight-line reveal, reverse-engineered from landonorris.com
  // (Off Brand, data-anim-high; the Codegrid capture recreates the same site). Per
  // SplitText line: the line starts clip-hidden with a full-width cover INSIDE it (the
  // clip hides cover and text together, so nested colored spans cannot leak). The clip
  // opens left-to-right revealing the solid block first (crisp out-curve), and OVERLAPPED
  // at its midpoint the cover peels toward the right on the in-out wipe curve, uncovering
  // the text left-to-right. Lando: 0.6s + 0.6s overlapped at 0.3, line stagger 0.15.
  // Ours maps both phases to --dur-breathe. The cover is ALWAYS ink by default: a red
  // cover counts as a red hit (design-language 2.3) and the hero viewport is already at
  // its 3-hit budget (colon + hero word + CTA).
  gsap.registerEffect({
    name: 'blockReveal',
    effect: (targets: gsap.TweenTarget, c: Record<string, any>) => {
      const tl = gsap.timeline({ delay: c.delay });
      gsap.utils.toArray<HTMLElement>(targets).forEach((host) => {
        // split.revert() restores the host's ORIGINAL markup, so the covers added
        // below disappear with it (matchMedia cleanup / lab replay).
        const split = SplitText.create(host, { type: 'lines' });
        splits.push(split);
        split.lines.forEach((line, i) => {
          const el = line as HTMLElement;
          // fit-content: the cover hugs the rendered text width (Lando behaviour),
          // measured per line so it holds in FR and EN alike.
          Object.assign(el.style, { position: 'relative', width: 'fit-content' });
          gsap.set(el, { clipPath: 'inset(0 100% 0 0)', autoAlpha: 1 });
          const cover = document.createElement('span');
          cover.setAttribute('aria-hidden', 'true');
          Object.assign(cover.style, {
            position: 'absolute',
            inset: '0',
            background: c.color,
            transformOrigin: 'right center',
            pointerEvents: 'none',
            zIndex: '2',
          });
          el.appendChild(cover);
          gsap.set(cover, { scaleX: 1 });
          const at = i * c.stagger;
          // breathe:true = the hero moment (breathing tempo); breathe:false = the same
          // gesture at crisp tempo for section headings (baseline pattern, not a slot).
          const phase = c.breathe ? T.durBreathe : T.durBase;
          tl.to(el, { clipPath: 'inset(0 0% 0 0)', duration: phase, ease: T.easeOut }, at);
          tl.to(
            cover,
            {
              scaleX: 0,
              duration: phase,
              ease: T.easeWipe,
              onComplete: () => cover.remove(),
            },
            at + phase / 2,
          );
        });
      });
      return tl;
    },
    defaults: { stagger: 0.15, delay: 0, color: 'var(--color-ink)', breathe: true },
  });

  // maskReveal - clip-path wipe left-to-right, no extra DOM. The initial state pins
  // autoAlpha 1 so a caller that pre-hid the element for the scroll wait hands over cleanly.
  gsap.registerEffect({
    name: 'maskReveal',
    effect: (targets: gsap.TweenTarget, c: Record<string, any>) =>
      gsap.fromTo(
        targets,
        { clipPath: 'inset(0 100% 0 0)', autoAlpha: 1, y: 0 },
        {
          clipPath: 'inset(0 -2% 0 0)',
          duration: c.breathe ? T.durBreathe : T.durBase,
          ease: c.breathe ? T.easeBreathe : T.easeOut,
          stagger: c.stagger,
          delay: c.delay,
        },
      ),
    defaults: { stagger: 0, delay: 0, breathe: true },
  });

  // linesUp - SplitText line stagger behind a per-line mask (the masked rise).
  // autoSplit re-splits on font load and on rewrap INSIDE a breakpoint; crossing a
  // breakpoint is handled by matchMedia revert + revertSplits(). breathe:true (default)
  // = breathing-slot tempo; breathe:false = crisp tempo for follower lines.
  gsap.registerEffect({
    name: 'linesUp',
    effect: (targets: gsap.TweenTarget, c: Record<string, any>) => {
      const tl = gsap.timeline({ delay: c.delay });
      const split = SplitText.create(targets, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self: SplitText) {
          const tween = gsap.from(self.lines, {
            yPercent: 110,
            duration: c.breathe ? T.durBreathe : T.durBase,
            ease: c.breathe ? T.easeBreathe : T.easeOut,
            stagger: c.stagger,
          });
          tl.add(tween, 0);
          return tween; // lets autoSplit rewind/replay coherently on re-split
        },
      });
      splits.push(split);
      return tl;
    },
    defaults: { stagger: 0.08, delay: 0, breathe: true },
  });

  // colonSettle - the mark's red colon resolves once (the binome made kinetic,
  // design-language 4.2.1). mode 'settle' = scale settle; mode 'inkdry' = pure fade
  // with a 2px drop, no scale (the quieter sibling). Always breathing tempo.
  gsap.registerEffect({
    name: 'colonSettle',
    effect: (targets: gsap.TweenTarget, c: Record<string, any>) =>
      c.mode === 'inkdry'
        ? gsap.fromTo(
            targets,
            { autoAlpha: 0, y: -2 },
            { autoAlpha: 1, y: 0, duration: T.durBreathe, ease: T.easeBreathe, delay: c.delay },
          )
        : gsap.fromTo(
            targets,
            { autoAlpha: 0, scale: 0.6 },
            { autoAlpha: 1, scale: 1, duration: T.durBreathe, ease: T.easeBreathe, delay: c.delay },
          ),
    defaults: { mode: 'settle', delay: 0.25 },
  });
}
