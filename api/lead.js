// /api/lead - Vercel serverless function for the Catchment Visibility Audit form.
//
// Drop-in mode: set environment variables in Vercel and the right adapter activates.
// Configure ONE of these in Vercel → Project Settings → Environment Variables:
//
//   A) FORWARD_URL              - existing qlarify.health form endpoint (proxies the POST)
//   B) RESEND_API_KEY + LEAD_TO - sends an email via Resend (free tier: 100/day)
//   C) WEBHOOK_URL              - generic webhook (Slack, Make.com, n8n, Zapier, etc.)
//
// If none are set, the function logs to the Vercel function log and returns 200 so the form
// still feels responsive while you wire up your backend.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel parses JSON automatically for application/json content-type
  const body = req.body || {};
  const required = ['hospital', 'doctor', 'city', 'specialty', 'phone', 'email'];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    return res.status(400).json({ error: 'Missing required fields', fields: missing });
  }

  // Honeypot / basic abuse guard
  if (body.website || body.url) {
    return res.status(200).json({ ok: true }); // silently drop bots
  }

  const lead = {
    hospital: String(body.hospital).slice(0, 200),
    doctor: String(body.doctor).slice(0, 200),
    city: String(body.city).slice(0, 100),
    specialty: String(body.specialty).slice(0, 100),
    phone: String(body.phone).slice(0, 30),
    email: String(body.email).slice(0, 200),
    source: body.source || '180daysprint.qlarify.health',
    submitted_at: body.submitted_at || new Date().toISOString(),
    user_agent: req.headers['user-agent'] || '',
    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '',
  };

  try {
    // ─── Adapter A: Forward to existing qlarify.health endpoint ─────────────
    if (process.env.FORWARD_URL) {
      const r = await fetch(process.env.FORWARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!r.ok) throw new Error('Forward failed: ' + r.status);
      return res.status(200).json({ ok: true });
    }

    // ─── Adapter B: Send an email via Resend ────────────────────────────────
    if (process.env.RESEND_API_KEY && process.env.LEAD_TO) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.LEAD_FROM || 'leads@qlarify.health',
          to: process.env.LEAD_TO,
          reply_to: lead.email,
          subject: `New audit request: ${lead.hospital} (${lead.city})`,
          html: leadEmailHtml(lead),
        }),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error('Resend failed: ' + r.status + ' ' + txt);
      }
      return res.status(200).json({ ok: true });
    }

    // ─── Adapter C: Generic webhook (Slack / Make.com / n8n / Zapier) ──────
    if (process.env.WEBHOOK_URL) {
      const r = await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!r.ok) throw new Error('Webhook failed: ' + r.status);
      return res.status(200).json({ ok: true });
    }

    // ─── Fallback: log only (use Vercel logs to retrieve) ───────────────────
    console.log('AUDIT_LEAD', JSON.stringify(lead));
    return res.status(200).json({ ok: true, note: 'No backend configured; logged to function output.' });

  } catch (err) {
    console.error('AUDIT_LEAD_ERROR', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
}

function leadEmailHtml(lead) {
  const row = (k, v) =>
    `<tr><td style="padding:6px 14px 6px 0; color:#5a7a94; font-size:12px; text-transform:uppercase; letter-spacing:0.06em; font-weight:600;">${k}</td><td style="padding:6px 0; color:#163460; font-size:15px;">${escape(v)}</td></tr>`;
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background:#f5f5f0;">
    <div style="background:white; border:1px solid #d0dde8; border-radius:14px; padding:28px;">
      <div style="font-size:11px; color:#c96830; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; margin-bottom:6px;">NEW AUDIT REQUEST</div>
      <h2 style="font-family: Georgia, serif; color:#163460; font-size:22px; margin:0 0 4px;">${escape(lead.hospital)}</h2>
      <div style="color:#5a7a94; font-size:14px; margin-bottom:18px;">${escape(lead.city)} &middot; ${escape(lead.specialty)}</div>
      <table style="width:100%; border-collapse:collapse;">
        ${row('Doctor', lead.doctor)}
        ${row('Phone', lead.phone)}
        ${row('Email', lead.email)}
        ${row('Source', lead.source)}
        ${row('Submitted', lead.submitted_at)}
      </table>
      <div style="margin-top:20px; padding-top:16px; border-top:1px solid #e8eef4; color:#5a7a94; font-size:12px;">
        Reply to this email to respond to <strong style="color:#163460;">${escape(lead.email)}</strong>.
      </div>
    </div>
  </div>`;
}

function escape(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
}
