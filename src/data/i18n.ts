// ============================================================================
// SPLASH COPY VARIANT — flip this ONE line to swap the splash copy, then rebuild.
//   'tourism' → tourism-economy positioning (the original copy)
//   'generic' → sector-generic positioning (independent businesses)
// ============================================================================
const SPLASH_VARIANT: 'tourism' | 'generic' = 'generic';
// ============================================================================
// Only the keys below differ between variants. Everything else (titles, FR
// tagline, CTA, labels, form) is shared and lives in the `i18n` object.
// ============================================================================

const splashVariants = {
  tourism: {
    fr: {
      description: 'Studio de conception digitale pour l\'économie touristique des Alpes et du Léman. Le site, la visibilité, les demandes entrantes et leur suivi, tenus dans la durée.',
      comingSoon: 'Lancement prochain',
      valueProp: 'parametre, studio digital pour ceux qui font l\'économie touristique des Alpes et du Léman. Le site, la visibilité, les demandes entrantes et leur suivi\u00A0: conçus ensemble, puis tenus dans la durée.',
    },
    en: {
      description: 'A digital design studio for the tourism economy of the Alps and Lake Geneva. Your site, your visibility, the enquiries that come in and their follow-up, looked after over time.',
      comingSoon: 'Coming soon',
      valueProp: 'parametre, a digital studio for the businesses of the tourism economy of the Alps and Lake Geneva. Your site, your visibility, the enquiries that come in and their follow-up: built together, then looked after.',
      tagline: {
        before: 'Your guests return, and your house ',
        accent: 'grows',
        after: ' with them.',
        sub: 'Without lifting a finger.',
      },
    },
  },
  generic: {
    fr: {
      description: 'Studio de conception digitale pour les entreprises indépendantes des Alpes et du Léman. Le site, la visibilité, les demandes entrantes et leur suivi, tenus dans la durée.',
      comingSoon: 'Refonte du site en cours',
      valueProp: 'parametre, studio digital pour les entreprises indépendantes des Alpes et du Léman. Le site, la visibilité, les demandes entrantes et leur suivi\u00A0: conçus ensemble, puis tenus dans la durée.',
    },
    en: {
      description: 'A digital design studio for the independent businesses of the Alps and Lake Geneva. Your site, your visibility, the enquiries that come in and their follow-up, looked after over time.',
      comingSoon: 'Website redesign in progress',
      valueProp: 'parametre, a digital studio for the independent businesses of the Alps and Lake Geneva. Your site, your visibility, the enquiries that come in and their follow-up: built together, then looked after.',
      tagline: {
        before: 'Your clients come back, and your business ',
        accent: 'grows',
        after: ' with them.',
        sub: 'Without lifting a finger.',
      },
    },
  },
} as const;

const splash = splashVariants[SPLASH_VARIANT];

export const i18n = {
  fr: {
    lang: 'fr' as const,
    htmlLang: 'fr',
    title: 'parametre.art — Studio de conception digitale',
    // description, comingSoon, valueProp — from SPLASH_VARIANT above
    ...splash.fr,
    ogLocale: 'fr_FR',
    tagline: {
      before: 'Vos clients reviennent, votre maison ',
      accent: 'grandit',
      after: '.',
      sub: 'Sans vous en occuper.',
    },
    contactLabel: 'Contact',
    ctaButton: 'Parlons de votre projet',
    closeModal: 'Fermer',
    linkedinLabel: 'LinkedIn',
    linkedinUrl: 'https://www.linkedin.com/in/montouchet/',
    langToggleLabel: 'EN',
    langToggleHref: '/en',
    langToggleTitle: 'Switch to English',
    alternateHref: '/en',
    alternateLang: 'en',
    canonicalPath: '/',
    // Form
    form: {
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      projectType: 'Type de projet',
      projectTypes: {
        website: 'Site web',
        redesign: 'Refonte',
        consulting: 'Conseil',
        other: 'Autre',
      },
      message: 'Message',
      messagePlaceholder: 'Décrivez votre projet en quelques mots...',
      gdpr: 'J\'accepte que parametre.art conserve mes données pour répondre à ma demande.',
      submit: 'Envoyer',
      sending: 'Envoi...',
      success: 'Message envoyé. Nous revenons vers vous dans les 48h.',
      error: 'Une erreur est survenue. Réessayez ou contactez-nous sur LinkedIn.',
    },
  },
  en: {
    lang: 'en' as const,
    htmlLang: 'en',
    title: 'parametre.art — Digital Design Studio',
    // description, comingSoon, valueProp, tagline — from SPLASH_VARIANT above
    ...splash.en,
    ogLocale: 'en_US',
    contactLabel: 'Contact',
    ctaButton: 'Let\'s talk about your project',
    closeModal: 'Close',
    linkedinLabel: 'LinkedIn',
    linkedinUrl: 'https://www.linkedin.com/in/montouchet/',
    langToggleLabel: 'FR',
    langToggleHref: '/',
    langToggleTitle: 'Passer en français',
    alternateHref: '/',
    alternateLang: 'fr',
    canonicalPath: '/en',
    // Form
    form: {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      projectType: 'Project type',
      projectTypes: {
        website: 'New website',
        redesign: 'Redesign',
        consulting: 'Consulting',
        other: 'Other',
      },
      message: 'Message',
      messagePlaceholder: 'Tell us about your project...',
      gdpr: 'I consent to parametre.art storing my data to respond to my inquiry.',
      submit: 'Send',
      sending: 'Sending...',
      success: 'Message sent. We\'ll get back to you within 48 hours.',
      error: 'Something went wrong. Please try again or reach out on LinkedIn.',
    },
  },
} as const;

export type Lang = keyof typeof i18n;
