# 180daysprint.qlarify.health

Landing page for the **180-Day OPD Engine** offer, targeting single-unit hospitals in India.

## Stack

- Pure static HTML (no build step)
- One Vercel serverless function for the audit form (`/api/lead`)
- Hosted on Vercel, custom domain via Cloudflare/Vercel DNS

## Local development

Just open `index.html` in a browser. The form will POST to `/api/lead` which only works in Vercel's environment — to test locally, use `vercel dev` from the repo root.

## Deploy

See `DEPLOY.md` for step-by-step instructions.

## Form backend

The form posts to `/api/lead`. The serverless function supports three modes via environment variables:

- `FORWARD_URL` — forward POST to an existing endpoint (e.g. the qlarify.health form backend)
- `RESEND_API_KEY` + `LEAD_TO` — send the lead as an email via Resend
- `WEBHOOK_URL` — forward to Slack / Make.com / n8n / Zapier

If none are set, leads are logged to the Vercel function output and the form returns 200.

## Files

- `index.html` — the landing page
- `qlarify-logo.svg` / `qlarify-logo-light.svg` — brand marks
- `api/lead.js` — form handler (Vercel serverless function)
- `vercel.json` — security headers + cache rules
- `package.json` — sets Node 18+ for the function
- `DEPLOY.md` — deploy + DNS instructions
