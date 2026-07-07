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
    // Amendment A4 (brief 01 stress-test): Robin Tier 3 proof points. Optional so it
    // does not break the bare-bones ship. Each entry is a short label plus optional body.
    proof: z
      .array(z.object({ label: z.string(), body: z.string().optional() }))
      .optional(),
    // Amendment A2: for the v1 slice the verticals teaser is ONE generic editorial line,
    // not a per-vertical /secteurs/* menu. Kept optional so the section can be omitted.
    verticalTeasers: z
      .array(z.object({ label: z.string(), blurb: z.string(), href: z.string() }))
      .optional(),
    verticalsTeaserLine: z.string().optional(),
    // WDEC-012 (2026-07-04): the three locked sector umbrellas, rendered as a mono
    // numbered-index strip. href added 2026-07-07 (WDEC-013 fork): the sector pages
    // now exist, so each item may link to its umbrella page.
    sectors: z
      .object({
        intro: z.string(),
        items: z.array(
          z.object({ name: z.string(), line: z.string(), href: z.string().optional() }),
        ),
      })
      .optional(),
    closingCta: z.object({ heading: z.string(), body: z.string(), cta: z.string() }),
  }),
});

// Sector umbrella pages (WDEC-012 taxonomy: hospitalite-evenementiel, terroir-producteurs,
// formation-enseignement). Added 2026-07-07 for the lane fork. Supersedes the stale
// `verticals` collection (old WDEC-006 set) as the /secteurs/ content model; `verticals`
// is kept for per-trade outreach landing pages later (WDEC-009 lanes).
const sectors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sectors' }),
  schema: z.object({
    locale: z.enum(['fr', 'en']),
    slug: z.string(),
    order: z.number(), // matches strip order 01/02/03
    name: z.string(), // umbrella name (matches the homepage strip)
    heroHeadline: z.string(),
    heroSub: z.string(),
    heroCta: z.string(),
    intro: z.string(), // who this page is for
    // Verified pains with proof captions. OPTIONAL: formation has no verified
    // evidence pre-R4 (WDEC-012), so its page carries no pains section.
    pains: z
      .array(z.object({ title: z.string(), body: z.string(), proof: z.string().optional() }))
      .optional(),
    approach: z.object({
      heading: z.string(),
      items: z.array(z.object({ title: z.string(), body: z.string() })),
    }),
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

export const collections = { verticals, homepage, pages, sectors };
