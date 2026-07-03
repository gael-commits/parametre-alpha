// Content collections = the CONTENT MODEL (the contract the content lane fills).
// Components + tokens.css = the DESIGN SYSTEM (the design lane's side).
// Scaffolded 2026-07-02 for the Fable 5 build week. Additive: the live splash
// (src/pages/index.astro) does not import these, so it is unaffected until wired.
//
// Astro 5 Content Layer API (glob loader). Locale by directory: fr/ and en/.
// See: internal/parametre/projects_active/parametre-website/context/plan-fable5-week.md §5

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// A single quality-gated pain point (from pain-points-filtered.md).
const painPoint = z.object({
  id: z.string(), // e.g. "R1"
  hook: z.string(), // the outcome line that passes Robin's "so what?" filter
  data: z.string().optional(), // backing figure, for a proof caption
});

// One vertical landing page.
const verticals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/verticals' }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    locale: z.enum(['fr', 'en']),
    order: z.number(), // matches outreach priority
    heroHook: z.string(), // one lead hook for this vertical
    painPoints: z.array(painPoint),
    whatWeDo: z.array(z.string()), // Robin Tier 2 applied to this trade
    cta: z.string(),
    photo: z.string().optional(),
  }),
});

// The homepage (singleton per locale).
const homepage = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/homepage' }),
  schema: z.object({
    locale: z.enum(['fr', 'en']),
    heroHeadline: z.string(), // Robin Tier 1 (the outcome, nothing else)
    heroSub: z.string(),
    heroCta: z.string(),
    tension: z.object({ heading: z.string(), body: z.string() }),
    valueCards: z.array(z.object({ title: z.string(), body: z.string() })), // Tier 2, ~4 cards
    howItWorks: z.object({ heading: z.string(), points: z.array(z.string()) }),
    verticalTeasers: z.array(
      z.object({ label: z.string(), blurb: z.string(), href: z.string() }),
    ),
    closingCta: z.object({ heading: z.string(), body: z.string(), cta: z.string() }),
  }),
});

// Static pages: methode (how we work), contact, mentions-legales.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    locale: z.enum(['fr', 'en']),
    slug: z.string(),
    title: z.string(),
  }),
});

export const collections = { verticals, homepage, pages };
