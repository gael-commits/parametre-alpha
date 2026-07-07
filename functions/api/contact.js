/**
 * Cloudflare Pages Function — Contact form handler
 * POST /api/contact
 *
 * Env vars required (set in CF Pages dashboard):
 *   BREVO_API_KEY    — Brevo API key (xkeysib-...)
 *   BREVO_LIST_ID    — Brevo contact list ID (integer as string)
 */

const ALLOWED_ORIGINS = [
  'https://alpha.parametre.art',
  'https://parametre.art',
];

const BREVO_API = 'https://api.brevo.com/v3';

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const PROJECT_TYPES = ['website', 'redesign', 'consulting', 'other'];

// Admin notification email (sent to art@parametre.art)
function buildAdminEmail({ firstName, lastName, email, projectType, message, language }) {
  const langLabel = language === 'fr' ? 'Français' : 'English';
  const typeLabels = {
    fr: { website: 'Site web', redesign: 'Refonte', consulting: 'Conseil', other: 'Autre' },
    en: { website: 'New website', redesign: 'Redesign', consulting: 'Consulting', other: 'Other' },
  };
  const typeLabel = (typeLabels[language] || typeLabels.en)[projectType] || projectType;

  return {
    sender: { name: 'A.R.T. | parametre.art', email: 'art@parametre.art' },
    to: [{ email: 'art@parametre.art', name: 'A.R.T. | parametre.art' }],
    subject: `New inquiry from ${firstName} ${lastName} — ${typeLabel}`,
    htmlContent: `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 600px; color: #1A1A1A;">
        <h2 style="font-size: 18px; margin-bottom: 16px;">New contact form submission</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 12px; font-weight: 500; color: #999; width: 120px;">Name</td><td style="padding: 8px 12px;">${firstName} ${lastName}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: 500; color: #999;">Email</td><td style="padding: 8px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 12px; font-weight: 500; color: #999;">Project</td><td style="padding: 8px 12px;">${typeLabel}</td></tr>
          <tr><td style="padding: 8px 12px; font-weight: 500; color: #999;">Language</td><td style="padding: 8px 12px;">${langLabel}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #F5F5F5; border-radius: 4px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
      </div>
    `,
  };
}

// Auto-reply confirmation email (sent to the submitter)
function buildAutoReply({ firstName, email, language }) {
  const content = {
    fr: {
      subject: 'Bien reçu — parametre.art',
      greeting: `Bonjour ${firstName},`,
      body: 'Votre message a bien été reçu. Nous reviendrons vers vous dans les 48 heures.',
      closing: 'À bientôt,',
      signature: 'A.R.T. | parametre.art',
      footnote: 'Cet email est une confirmation automatique. Pas besoin d\'y répondre — nous avons votre message.',
    },
    en: {
      subject: 'Message received — parametre.art',
      greeting: `Hi ${firstName},`,
      body: 'Your message has been received. We\'ll get back to you within 48 hours.',
      closing: 'Talk soon,',
      signature: 'A.R.T. | parametre.art',
      footnote: 'This is an automatic confirmation. No need to reply — we have your message.',
    },
  };

  const t = content[language] || content.en;

  return {
    sender: { name: 'A.R.T. | parametre.art', email: 'art@parametre.art' },
    to: [{ email, name: firstName }],
    subject: t.subject,
    htmlContent: `
      <div style="font-family: Inter, -apple-system, sans-serif; max-width: 520px; color: #1A1A1A; line-height: 1.65; font-size: 15px;">
        <p>${t.greeting}</p>
        <p style="margin-top: 12px;">${t.body}</p>
        <p style="margin-top: 24px;">${t.closing}<br/><strong>${t.signature}</strong></p>
        <p style="margin-top: 32px; font-size: 12px; color: #999;">${t.footnote}</p>
      </div>
    `,
  };
}

async function brevoRequest(apiKey, endpoint, body) {
  const res = await fetch(`${BREVO_API}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Brevo ${endpoint} failed (${res.status}): ${error}`);
  }

  // 201/204 may have no body
  if (res.status === 204) return {};
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(context.request.headers.get('Origin') || ''),
  });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin') || '';
  const apiKey = context.env.BREVO_API_KEY;
  const listId = parseInt(context.env.BREVO_LIST_ID, 10);

  if (!apiKey || !listId) {
    return json({ success: false, error: 'Server configuration error' }, 500, origin);
  }

  let data;
  try {
    data = await context.request.json();
  } catch {
    return json({ success: false, error: 'Invalid request body' }, 400, origin);
  }

  const { firstName, lastName, email, projectType, message, language, _hp } = data;

  // Honeypot check — if filled, it's a bot
  if (_hp) {
    // Return success to not tip off the bot
    return json({ success: true }, 200, origin);
  }

  // Validate required fields
  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !projectType || !message?.trim()) {
    return json({ success: false, error: 'All fields are required' }, 400, origin);
  }

  if (!validateEmail(email.trim())) {
    return json({ success: false, error: 'Invalid email address' }, 400, origin);
  }

  if (!PROJECT_TYPES.includes(projectType)) {
    return json({ success: false, error: 'Invalid project type' }, 400, origin);
  }

  if (message.trim().length > 5000) {
    return json({ success: false, error: 'Message too long (max 5000 characters)' }, 400, origin);
  }

  const lang = language === 'fr' ? 'fr' : 'en';

  try {
    // 1. Create/update contact in Brevo
    await brevoRequest(apiKey, '/contacts', {
      email: email.trim(),
      attributes: {
        PRENOM: firstName.trim(),
        NOM: lastName.trim(),
        MESSAGE: message.trim(),
        PROJECT_TYPE: projectType,
        LANGUAGE: lang,
        SOURCE: 'alpha-contact-form',
      },
      listIds: [listId],
      updateEnabled: true,
    });

    // 2. Send admin notification
    await brevoRequest(apiKey, '/smtp/email', buildAdminEmail({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      projectType,
      message: message.trim(),
      language: lang,
    }));

    // 3. Send auto-reply to submitter
    await brevoRequest(apiKey, '/smtp/email', buildAutoReply({
      firstName: firstName.trim(),
      email: email.trim(),
      language: lang,
    }));

    return json({ success: true }, 200, origin);
  } catch (err) {
    console.error('Contact form error:', err.message);
    return json({ success: false, error: 'Failed to process your message. Please try again.' }, 500, origin);
  }
}
