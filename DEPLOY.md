# Deploying 180daysprint.qlarify.health

GitHub → Vercel → custom subdomain. Form goes through Web3Forms (no backend setup).

## Part 1 — Push to GitHub (done if you've already pushed)

```bash
cd 180daysprint-deploy
git init -b main
git add .
git commit -m "Initial: 180-Day OPD Sprint landing page"
git remote add origin https://github.com/Qlarify/180-days-.git
git push -u origin main
```

## Part 2 — Import to Vercel

1. vercel.com/new → import the `Qlarify/180-days-` repo
2. Framework: **Other** · build/output: **leave empty**
3. Click **Deploy**

## Part 3 — Attach subdomain

1. Vercel project → Settings → Domains
2. Add: `180daysprint.qlarify.health`
3. Since qlarify.health DNS is on Vercel, SSL provisions automatically in ~1 minute.

## Part 4 — Wire up the form (3 minutes)

### Step 1 — Get a Web3Forms access key

1. Visit https://web3forms.com
2. Enter `info@qlarify.health` in the form on the homepage
3. Click **Create Access Key**
4. Web3Forms emails the key to info@qlarify.health. Copy it.

### Step 2 — Paste the key into index.html

Open `index.html` in your editor. Find this line near the top of the `<form>`:

```html
<input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY" />
```

Replace `YOUR_WEB3FORMS_ACCESS_KEY` with the actual key from the email. Save.

### Step 3 — Commit and push

```bash
git add index.html
git commit -m "Wire up Web3Forms access key"
git push
```

Vercel auto-deploys within 30 seconds.

### Step 4 — Test

1. Open `https://180daysprint.qlarify.health`
2. Fill out the form with test data and submit
3. Check `info@qlarify.health` — the email should arrive within 5 seconds with all the fields filled in plus `source: 180daysprint.qlarify.health` and a timestamp.

## Post-launch checklist

- [ ] Page loads at `https://180daysprint.qlarify.health`
- [ ] HTTPS works, no mixed-content warnings
- [ ] Hospital logos load (from `qlarify.health/logos/*`)
- [ ] Test form submission lands at `info@qlarify.health`
- [ ] Mobile layout looks right
- [ ] WhatsApp link opens correctly
- [ ] Update the offer one-pager PDF CTA to point here

## If form submissions don't arrive

1. **Check spam folder.** Web3Forms uses their own sending domain, so first submission may land in spam. Mark as "Not spam" and future ones will hit the inbox.
2. **Verify the access key is correct.** Open browser DevTools (F12) → Network tab → submit the form → click the `api.web3forms.com` request → check Response. If it says `Invalid access key`, paste the key again carefully.
3. **Check Vercel logs.** Project → Logs → look for any errors near the time of submission. The form submits to Web3Forms directly (not your Vercel function), so most issues will be visible in the browser's Network tab rather than Vercel.

## Upgrading the form later

If you outgrow Web3Forms (>250 submissions/month) or want to forward submissions to a CRM:

- **Switch to Formspree:** change `action="https://api.web3forms.com/submit"` to `action="https://formspree.io/f/YOUR_ID"`, remove the `access_key` hidden input, add Formspree's account.
- **Use the included `/api/lead.js`:** the bundle has a Vercel serverless function with adapters for Resend (email), webhooks (Slack/Make/n8n/Zapier), and forwarding to your own endpoint. Just change the form's `action` back to `/api/lead` and set the right env vars in Vercel.
- **Forward to qlarify.health's existing form backend:** set the form's `action` directly to whatever URL the parent site's contact form uses.
