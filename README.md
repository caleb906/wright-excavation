# Wright Excavation

Static marketing site for Wright Excavation, a Central Oregon excavation contractor.

## Pages

| URL | File | Purpose |
|-----|------|---------|
| `/` | `home.html` | Homepage |
| `/services` | `services.html` | Services overview |
| `/about` | `about.html` | About & story |
| `/contact` | `contact.html` | Contact form |
| `/estimate` | `index.html` | Full estimate request form |
| `/privacy` | `privacy.html` | Privacy policy |

## Tech Stack

- Pure HTML + inline CSS (no build step)
- DM Sans + Anton fonts (Google Fonts)
- Formspree for contact forms
- Hosted on Vercel
- Source on GitHub

## Local Development

```bash
# Start local server
node serve.mjs
# Opens at http://localhost:3000
```

## Deployment

Auto-deploys to Vercel on every push to `main`.

```bash
git add .
git commit -m "description of change"
git push
# Vercel picks it up in ~10 seconds
```

## Form Setup (TODO)

Both forms currently point to a placeholder Formspree endpoint. To wire up:

1. Sign up at [formspree.io](https://formspree.io) (free tier: 50 submissions/month)
2. Create a new form, copy the form ID (e.g. `xyzabcde`)
3. Replace `YOUR_FORMSPREE_ID` in:
   - `index.html` line ~502 (estimate form)
   - `contact.html` line ~89 (contact form)
4. Commit and push

## Updating Content

All content is in the HTML files. Edit directly:

- Hero headlines: search for `<h1>` in each file
- Service cards: `home.html` has 3, `services.html` has 6
- Contact info: phone/email in nav and footer of each page
- About copy: `about.html`

## Clone from Any Computer

```bash
git clone https://github.com/YOUR_USERNAME/wright-excavation.git
cd wright-excavation
node serve.mjs
```

## Brand Assets

Logo and images are hosted on Webflow's CDN (legacy). To move to self-hosted:
- Download from URLs in HTML
- Place in `/assets/` folder
- Update image src paths
