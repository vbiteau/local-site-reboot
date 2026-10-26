# Local Site Reboot

A lead-generation tool for selling web design to local businesses. Find businesses in a
town, instantly rebuild their website as a modern redesign, and generate a personalized
outreach email to the owner — all in one app.

> **The pitch:** the businesses with *no website* are your hottest leads. Local Site Reboot
> surfaces them, shows the owner what a modern site could look like, and writes the cold
> email for you.

---

## What it does

**1 · Find leads**
Type a town and state. The app pulls local businesses from OpenStreetMap and flags each one:
- 🔥 **No website** → a hot lead (pitch a brand-new site)
- **Has website** → a redesign candidate (often dated)

Filter by either, then jump straight into a redesign or an outreach email.

**2 · Redesign**
Paste (or click) a business URL. The server scrapes the site and extracts its name,
tagline, brand color, logo, hero image, services, phone/email/address, hours, and social
links — then pours it all into one polished, responsive template. See it side-by-side with
the original in a **before / after** view.

**3 · Outreach**
Generates a ready-to-send cold **email + text message** to the owner, personalized to the
business. It adapts automatically:
- *Has a site* → "I rebuilt your website as a modern version — free preview."
- *No site* → "I noticed you don't have a website yet — here's one I can build you."

---

## How it works

| Piece | How |
|---|---|
| **Lead search** | Geocode the town (Nominatim) → query businesses in its bounds (Overpass / OpenStreetMap). The `website` tag's presence is the lead signal. |
| **Scraping** | A Next.js server route fetches the page and parses it with [cheerio](https://cheerio.js.org/) — meta tags, Open Graph, headings, `tel:`/`mailto:` links, address & hours heuristics. |
| **Redesign** | A single hand-built responsive template (`Redesign.tsx`) driven by the scraped content and the site's own brand color. Deterministic — it always looks good. |
| **Outreach** | A template-based generator (`outreach.ts`) that merges the business + your details into an email and SMS. |

No API keys required. All data sources are free and keyless.

## Tech

Next.js 16 (App Router, TypeScript) · cheerio · OpenStreetMap (Nominatim + Overpass).

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** (use `localhost`, not `127.0.0.1` — Next's dev server
blocks cross-origin dev resources otherwise).

## Deploy

Import the repo on [Vercel](https://vercel.com/new) — it's a standard Next.js app and
deploys with zero configuration. The server-side scraping and lead search run on Vercel's
serverless functions out of the box.

## Project layout

```
src/
  app/
    page.tsx              # the 3-tab UI (leads -> redesign -> outreach)
    api/leads/route.ts    # GET ?city=&state=  -> businesses from OSM
    api/scrape/route.ts   # GET ?url=          -> extracted BusinessData
  components/Redesign.tsx # the modern template the new site is rendered with
  lib/
    extract.ts            # fetch + cheerio extraction
    overpass.ts           # geocode + Overpass lead search
    outreach.ts           # cold email / SMS generator
    types.ts
```

## Notes & limitations

- **"Before" previews** load the original site in an iframe. Some sites set
  `X-Frame-Options` and refuse to embed — that's the site blocking frames, not a bug. A
  screenshot-based fallback is a planned enhancement.
- Overpass can be slow under load; results are cached per town for 30 minutes.
- OpenStreetMap coverage of small businesses varies by area — great in towns, patchy in
  very rural spots.
- Scraping and cold outreach should be used responsibly and in line with local
  regulations (e.g. CAN-SPAM) and each site's terms.

## Credits

Business & map data © OpenStreetMap contributors. Built with Next.js.
