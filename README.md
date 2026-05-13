# 180daysprint.qlarify.health

Landing page for the **180-Day OPD Sprint** offer, targeting single-unit hospitals in India.

## Stack

- Pure static HTML (no build step)
- Form submissions go directly to **Web3Forms** (no backend needed)
- Hosted on Vercel, custom domain via Vercel DNS

## Form backend

The audit form POSTs to `https://api.web3forms.com/submit`. Web3Forms emails each submission to whichever address you registered the access key with.

### Setup (3 minutes)

1. Go to https://web3forms.com
2. Enter `info@qlarify.health` and click **Create Access Key**
3. Web3Forms emails you the access key. Copy it.
4. Open `index.html`, find this line:
   ```html
   <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY" />
   ```
   Replace `YOUR_WEB3FORMS_ACCESS_KEY` with the key Web3Forms sent you.
5. Commit and push. Vercel auto-deploys.
6. Test the form. The submission arrives at `info@qlarify.health`.

### Why Web3Forms

- No account creation, no domain verification, no env vars
- Free tier: 250 submissions/month (well above what a niche B2B landing page needs)
- Built-in spam protection (the `botcheck` honeypot in this form supports it)
- Easy to swap to Formspree or Resend later if needed

## Local development

Open `index.html` in a browser. The form will POST to Web3Forms even from `file://` because Web3Forms accepts cross-origin requests.

## Files

- `index.html` — the landing page (with Web3Forms wired in)
- `qlarify-logo.svg` / `qlarify-logo-light.svg` — brand marks
- `api/lead.js` — kept as a backup serverless function (unused now; can be deleted)
- `vercel.json` — security headers + cache rules
- `package.json`, `.gitignore`
- `DEPLOY.md` — step-by-step deploy + form-setup instructions
