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

  // blockReveal - the per-line two-phase block wipe (knowledge capture: Codegrid block
  // reveal, 2026-07-07). Each SplitText line gets its own cover: the block expands
  // left-to-right over the empty line (--ease-wipe, in-out: a cover crossing the frame
  // accelerates in and decelerates out), the text appears at full cover, the origin
  // flips and the block collapses off to the right. Both phases together = one breathing
  // duration. The cover is ALWAYS ink here: a red cover counts as a red hit
  // (design-language 2.3) and the hero viewport is already at its 3-hit budget
  // (colon + hero word + CTA).
  gsap.registerEffect({
    name: 'blockReveal',
    effect: (targets: gsap.TweenTarget, c: Record<string, any>) => {
      const tl = gsap.timeline({ delay: c.delay });
      const phase = T.durBreathe / 2;
      gsap.utils.toArray<HTMLElement>(targets).forEach((host) => {
        // split.revert() restores the host's ORIGINAL markup, so the wrappers and
        // covers added below disappear with it (matchMedia cleanup / lab replay).
        const split = SplitText.create(host, { type: 'lines' });
        splits.push(split);
        split.lines.forEach((line, i) => {
          const el = line as HTMLElement;
          // Wrapper hugging the line's text width; line and cover are SIBLINGS so the
          // hidden line cannot hide its own cover (and nested colored spans stay covered).
          const wrapper = document.createElement('div');
          Object.assign(wrapper.style, { position: 'relative', width: 'fit-content' });
          el.parentNode!.insertBefore(wrapper, el);
          wrapper.appendChild(el);
          const cover = document.createElement('span');
          cover.setAttribute('aria-hidden', 'true');
          Object.assign(cover.style, {
            position: 'absolute',
            inset: '0',
            background: c.color,
            transformOrigin: 'left center',
            transform: 'scaleX(0)',
            pointerEvents: 'none',
            zIndex: '2',
          });
          wrapper.appendChild(cover);
          gsap.set(el, { autoAlpha: 0 });
          const lineTl = gsap.timeline();
          lineTl
            .to(cover, { scaleX: 1, duration: phase, ease: T.easeWipe })
            .set(el, { autoAlpha: 1 })
            .set(cover, { transformOrigin: 'right center' })
            .to(cover, {
              scaleX: 0,
              duration: phase,
              ease: T.easeWipe,
              onComplete: () => cover.remove(),
            });
          tl.add(lineTl, i * c.stagger);
        });
      });
      return tl;
    },
    defaults: { stagger: 0.15, delay: 0, color: 'var(--color-ink)' },
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
  // breakpoint is handled by matchMedia revert + revertSplits(). Breathing tempo only:
  // this pattern is licensed exclusively as a breathing-slot candidate.
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
            duration: T.durBreathe,
            ease: T.easeBreathe,
            stagger: c.stagger,
          });
          tl.add(tween, 0);
          return tween; // lets autoSplit rewind/replay coherently on re-split
        },
      });
      splits.push(split);
      return tl;
    },
    defaults: { stagger: 0.08, delay: 0 },
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
