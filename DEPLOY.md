# Deploying 180daysprint.qlarify.health

GitHub + Vercel. ~5 minutes from "now" to "live page with HTTPS." Another ~2 minutes to wire up the form.

## Part 1 — Push to GitHub (2 min)

From this folder on your machine:

```bash
cd 180daysprint-deploy
git init
git add .
git commit -m "Initial: 180-Day OPD Engine landing page"
```

Create a new GitHub repo (private is fine) at https://github.com/new — suggested name: `180daysprint-qlarify`. Then:

```bash
git remote add origin git@github.com:YOUR_USER/180daysprint-qlarify.git
git branch -M main
git push -u origin main
```

## Part 2 — Import into Vercel (2 min)

1. Go to https://vercel.com/new
2. Pick the GitHub repo you just pushed
3. Framework preset: **Other** (it's static HTML, Vercel detects this)
4. Root directory: leave as `.`
5. Build command: leave **empty**
6. Output directory: leave **empty**
7. Click **Deploy**

In ~30 seconds you'll get a `*.vercel.app` URL. Click it and verify the page loads correctly.

## Part 3 — Add the custom subdomain (1 min)

1. In the Vercel project → **Settings** → **Domains**
2. Add: `180daysprint.qlarify.health`
3. Since qlarify.health is already on Vercel, this should work automatically and provision SSL within a few seconds. If qlarify.health's DNS is on Cloudflare instead, Vercel will show a CNAME record to add:

   | Type   | Name             | Value                    |
   |--------|------------------|--------------------------|
   | CNAME  | `180daysprint`   | `cname.vercel-dns.com`   |

   In Cloudflare, set the cloud icon to **DNS only** (gray, not orange) for Vercel-hosted subdomains.

4. Wait 1-5 minutes for SSL. Done.

## Part 4 — Wire up the audit form (2 min)

Pick ONE of three options. Set the env vars in Vercel → Project Settings → Environment Variables → add for **Production**, then redeploy.

### Option A — Forward to qlarify.health's existing form backend

If your main site already has a form-submission endpoint, just point this form there.

```
FORWARD_URL = https://qlarify.health/api/contact     ← whatever the real endpoint is
```

If you tell me the existing endpoint URL, I'll match its expected payload format exactly.

### Option B — Email via Resend (fastest if no backend exists)

1. Sign up at resend.com (free, 100 emails/day)
2. Verify your sending domain (`qlarify.health`) by adding the DNS records Resend shows
3. Create an API key
4. In Vercel env vars:
   ```
   RESEND_API_KEY = re_xxx
   LEAD_TO        = info@qlarify.health
   LEAD_FROM      = leads@qlarify.health     ← any address on the verified domain
   ```

Every form submission becomes a styled email in your inbox, with reply-to set to the lead's email so you can respond directly.

### Option C — Webhook (Slack channel, Make.com, n8n, Zapier)

1. Get a webhook URL from the platform
2. In Vercel env vars:
   ```
   WEBHOOK_URL = https://hooks.slack.com/services/...
   ```

The function will POST the lead JSON to the URL.

### Fallback (no env vars set)

The form still works — it just logs each lead to the Vercel function output. You can read these in Vercel → Logs. Fine for the first day or two while you set up a real backend.

## Part 5 — Update the offer one-pager PDF

Once live, the PDF's CTA should point here. Edit `build_offer_pdf.py` and change the contact line to:

```
Claim the audit: 180daysprint.qlarify.health · WhatsApp: +91 81474 10751 · Email: info@qlarify.health
```

Then rebuild: `python3 build_offer_pdf.py`.

## Post-launch checklist

- [ ] Page loads at `https://180daysprint.qlarify.health`
- [ ] HTTPS works, no mixed-content warnings
- [ ] Hospital logos load in the trust band (sourced from `qlarify.health/logos/*`)
- [ ] Submit the form yourself with test data → confirm it lands wherever you configured
- [ ] Mobile layout looks right (test on a phone)
- [ ] WhatsApp link opens correctly (`wa.me/918147410751`)
- [ ] Add to Google Search Console + submit sitemap (optional, just `/`)
- [ ] Add GA4 / Plausible / Fathom for traffic (optional)
- [ ] Update LinkedIn bio + posts to link the new subdomain
- [ ] Update Apollo / outreach sequences with the new URL
- [ ] Add `180daysprint.qlarify.health` link to the qlarify.health main nav (optional, when ready)

## If the form gets spam

The function already has a basic honeypot guard and 30-character limits on phone, but if you start getting bot submissions, add Cloudflare Turnstile or hCaptcha to the form. I can add that whenever you need it.
