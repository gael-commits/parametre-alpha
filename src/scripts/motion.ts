// Motion layer for the homepage slice (brief 01), per the design-language charter (section 4).
//
// Baseline: entrance-only, quick (200-350ms), cubic-bezier(0.2,0,0,1). Fires once.
// Exactly TWO breathing moments, 500-700ms, cubic-bezier(0.16,1,0.3,1):
//   1. hero / binome-mark colon reveal (on load)
//   2. how-it-works step reveal (on scroll into view)
// Forbidden: parallax, loops, cursor-follow, bounce, scroll-jacking.
// prefers-reduced-motion: no animation at all (content is visible via CSS default).

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const EASE_OUT = 'cubic-bezier(0.2, 0, 0, 1)';
const EASE_BREATHE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export function initMotion(): void {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion or no window: leave everything as its final (visible) state.
  if (reduce) return;

  gsap.registerPlugin(ScrollTrigger);

  // CustomEase is not bundled; approximate the two named curves with GSAP power eases
  // that match the intent (fast-out settle / slow-settle). Kept deliberately close to
  // the CSS bezier values so hover CSS and JS entrances read as one system.
  const easeOut = 'power2.out'; // ~ cubic-bezier(0.2,0,0,1) crisp settle
  const easeBreathe = 'power4.out'; // ~ cubic-bezier(0.16,1,0.3,1) slow settle

  // --- Breathing moment #1: hero + binome-mark colon reveal (on load) ---
  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const heroBits = hero.querySelectorAll('[data-hero-item]');
    gsap.set(heroBits, { opacity: 0, y: 16 });
    const tl = gsap.timeline({ delay: 0.1 });
    tl.to(heroBits, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: easeBreathe,
      stagger: 0.12,
    });

    // The mark's red colon settles once, character-level (the binome made kinetic).
    const colon = document.querySelector('[data-breathe-mark]');
    if (colon) {
      gsap.fromTo(
        colon,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.6, ease: easeBreathe, delay: 0.25 },
      );
    }
  }

  // --- Baseline: entrance-quick reveals for every [data-reveal] element ---
  const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
  reveals.forEach((el) => {
    const stagger = el.dataset.revealStagger === 'true';
    const children = stagger
      ? Array.from(el.children)
      : [el];
    if (stagger) {
      gsap.set(el, { opacity: 1, y: 0 });
      gsap.set(children, { opacity: 0, y: 12 });
    }
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: easeOut,
          stagger: stagger ? 0.09 : 0,
        });
      },
    });
  });

  // --- Breathing moment #2: how-it-works steps reveal (on scroll into view) ---
  const steps = document.querySelector('[data-steps]');
  if (steps) {
    const items = steps.querySelectorAll('[data-step]');
    gsap.set(items, { opacity: 0, y: 20 });
    ScrollTrigger.create({
      trigger: steps,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: easeBreathe,
          stagger: 0.22,
        });
      },
    });
  }

  // Reference the string constants so tooling knows they document the CSS curves.
  void EASE_OUT;
  void EASE_BREATHE;
}
