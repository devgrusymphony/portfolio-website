# wheredoiclick.ai — site

Static one-page site. No build step, no framework. Deploy this folder as-is to Vercel, Netlify or Cloudflare Pages (`vercel.json` and `_headers` are included).

Preview locally: `python3 -m http.server 8000` in this folder → http://localhost:8000
(Asset paths are relative, so it works on GitHub Pages under /portfolio-website/ and on the custom domain.)

## Fill in before launch (brief §10.1)
| What | Where | How |
|---|---|---|
| WhatsApp number | `index.html` — 2 places (`WHATSAPP_NUMBER`) | Replace with digits only, e.g. `14165551234`. Test on a real phone. |
| Email | `index.html` (contact + footer), `llms.txt`, `llms-full.txt` | Confirm `hello@wheredoiclick.ai` or replace. |
| Project outcome numbers | `index.html`, 8 × `[ADD REAL NUMBER]` | Real figure → `<span class="p-metric-num" data-count="37">37</span><span class="p-metric-unit">leads recovered / month</span>` (counts up on scroll). No real figure → delete that card's `.p-metric` div. |
| Demo links | `index.html`, 8 × `<!-- [ADD DEMO LINK] -->` | Uncomment / add `<a class="p-link" href="…">See how it works</a>` only when the Loom/demo exists. |
| Prices | Not published | Pricing line under Services is a placeholder pending Raj's OK. |
| Analytics | `<head>` comment | Uncomment the Plausible line (or swap for Cloudflare Web Analytics) once the account exists. |
| Phase 2 tracking | `<!-- PHASE 2 TRACKING -->` in `<head>` | Don't add at launch. When added: cookie banner + update the footer privacy line. |

Find every placeholder: `grep -n "WHATSAPP_NUMBER\|ADD REAL NUMBER\|ADD DEMO LINK\|CONFIRM" index.html`

## Files
`index.html` · `styles.css` · `main.js` · `favicon.svg` · `apple-touch-icon.png` · `og-image.jpg` · `images/raj-photo.{webp,jpg}` · `sitemap.xml` · `robots.txt` · `llms.txt` · `llms-full.txt`

When content changes: update `<lastmod>` in `sitemap.xml`, keep `llms-full.txt` in sync, and keep the FAQPage JSON-LD **identical** to the visible FAQ text.
