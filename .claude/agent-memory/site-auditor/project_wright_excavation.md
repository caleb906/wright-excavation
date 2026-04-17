---
name: Wright Excavation Site Context
description: Tech stack, site structure, and pre-launch SEO status for Wright Excavation
type: project
---

Static HTML site (6 pages: index, services, about, contact, estimate, privacy) deploying to Vercel. No framework, no SSR. Tailwind via CDN, custom CSS inline per page.

**Pages:** index.html, services.html, about.html, contact.html, estimate.html, privacy.html

**Tech:** Pure HTML/CSS/JS, Google Fonts (Anton + DM Sans), images from cdn.prod.website-files.com (Webflow CDN), Formspree for forms.

**Key facts:**
- Phone used throughout: (541) 555-0100 — flagged as likely placeholder (555 number)
- Email: info@wrightexcavation.com
- Business: Based in Bend, OR; serves Deschutes, Jefferson, Crook counties; Oregon CCB licensed
- vercel.json: cleanUrls=true, trailingSlash=false, three security headers present

**Pre-launch SEO gaps (as of 2026-04-17):**
- No robots.txt, sitemap.xml, 404.html, or favicon
- No canonical tags on any page
- No Open Graph or Twitter Card meta tags on any page
- No JSON-LD structured data (LocalBusiness schema)
- Both contact.html and estimate.html have placeholder Formspree IDs (YOUR_FORMSPREE_ID)
- Title tags on inner pages are bare ("About | Wright Excavation") — not keyword-rich
- No <main> landmark on any page
- Missing HSTS header in vercel.json

**Why:** Pre-launch audit completed; site going live on Vercel shortly.
**How to apply:** When making changes, prioritize adding canonical tags, OG tags, robots.txt, sitemap, and JSON-LD first as those are the critical blockers.
