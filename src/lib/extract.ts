import * as cheerio from "cheerio";
import type { BusinessData, Social } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";

function abs(base: string, href?: string): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, base).toString();
  } catch {
    return undefined;
  }
}

const NAV_SKIP = /^(home|about|about us|our story|contact|contact us|get in touch|menu|gallery|photos|blog|news|login|log in|sign in|sign up|register|cart|checkout|search|privacy|privacy policy|terms|faq|faqs|reviews|testimonials|hours|location|locations|directions|pricing|prices|order|order online|order now|book|book now|book online|reserve|subscribe|newsletter|welcome|get started|more|learn more|shop|store|products|services|portfolio|careers|jobs|events)$/i;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const EMAIL_JUNK = /\.(png|jpe?g|gif|svg|webp|css|js)$|^[0-9]|sentry|example\.com|wixpress|@sentry|godaddy|squarespace|\.wix/i;

async function fetchHtml(url: string): Promise<{ ok: boolean; html: string; finalUrl?: string; note?: string }> {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, signal: ctrl.signal, redirect: "follow" });
    clearTimeout(to);
    if (!res.ok) return { ok: false, html: "", note: `Site returned HTTP ${res.status}.` };
    return { ok: true, html: await res.text(), finalUrl: res.url || url };
  } catch {
    return { ok: false, html: "", note: "Could not reach the site (it may block bots or be offline)." };
  }
}

/** All plausible contact emails from a page's HTML + mailto links, junk filtered. */
function collectEmails($: cheerio.CheerioAPI, html: string): string[] {
  const out = new Set<string>();
  $('a[href^="mailto:"]').each((_, el) => {
    const m = $(el).attr("href")!.replace(/^mailto:/i, "").split("?")[0].trim().toLowerCase();
    if (m && !EMAIL_JUNK.test(m)) out.add(m);
  });
  for (const m of html.match(EMAIL_RE) || []) {
    const e = m.toLowerCase();
    if (!EMAIL_JUNK.test(e)) out.add(e);
  }
  return [...out];
}

/** Fetch a business site and pull out the bits we need to rebuild it. */
export async function extractSite(input: string): Promise<BusinessData> {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  const domain = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  const base: BusinessData = {
    url, domain, name: domain, images: [], color: "#2563eb",
    services: [], hours: [], social: [], nav: [], signals: [], emails: [], fetchedOk: false,
  };

  let html = "";
  try {
    const got = await fetchHtml(url);
    if (!got.ok) { base.note = got.note; return base; }
    html = got.html;
    base.url = got.finalUrl || url;
  } catch (e) {
    base.note = "Could not reach the site (it may block bots or be offline).";
    return base;
  }

  const $ = cheerio.load(html);
  const meta = (sel: string) => $(sel).attr("content")?.trim() || undefined;
  const text = (sel: string) => $(sel).first().text().trim() || undefined;

  // name — the title's first segment is usually the business name; the h1 is usually a headline
  const titleName = ($("title").text().split(/[|\-–—:·•]/)[0] || "").trim().replace(/^welcome to\s+/i, "");
  const h1 = text("h1"), h2 = text("h2");
  base.name =
    meta('meta[property="og:site_name"]') ||
    (titleName && titleName.length >= 2 && titleName.length < 50 ? titleName : undefined) ||
    (h1 && h1.length < 40 ? h1 : undefined) ||
    domain;

  // tagline / description — the h1 headline, if it reads like a tagline (not the name)
  const looksTagline = (s?: string) => !!s && s !== base.name && !NAV_SKIP.test(s) && s.length <= 90 && (s.includes(" ") || s.length >= 12);
  base.tagline = looksTagline(h1) ? h1 : looksTagline(h2) ? h2 : undefined;
  base.description = meta('meta[name="description"]') || meta('meta[property="og:description"]');

  // brand color
  base.color = meta('meta[name="theme-color"]') || meta('meta[name="msapplication-TileColor"]') || base.color;
  if (!/^#?[0-9a-f]{3,8}$/i.test(base.color.replace("#", ""))) base.color = "#2563eb";
  if (!base.color.startsWith("#")) base.color = "#" + base.color;

  // logo
  base.logo =
    abs(base.url, $('img[src*="logo" i], img[alt*="logo" i]').first().attr("src")) ||
    abs(base.url, $('link[rel="apple-touch-icon"]').attr("href")) ||
    abs(base.url, $('link[rel~="icon"]').attr("href"));

  // hero + images — score candidates: prefer big images inside hero/banner/header areas
  const ogImg = abs(base.url, meta('meta[property="og:image"]'));
  const imgs = new Set<string>();
  const cands: { src: string; score: number }[] = [];
  $("img").each((_, el) => {
    const $el = $(el);
    const src = abs(base.url, $el.attr("src") || $el.attr("data-src"));
    if (!src) return;
    if (/\.svg($|\?)/i.test(src)) return;
    const hint = (($el.attr("alt") || "") + " " + src).toLowerCase();
    if (/sprite|icon|pixel|spacer|blank|1x1|logo|favicon|avatar|badge/.test(hint)) return;
    imgs.add(src);
    const w = parseInt($el.attr("width") || "0", 10) || 0;
    const inHero = $el.closest('header,.hero,[class*="hero" i],[class*="banner" i],[class*="jumbo" i],[id*="hero" i]').length > 0;
    cands.push({ src, score: (inHero ? 5000 : 0) + w });
  });
  cands.sort((a, b) => b.score - a.score);
  base.images = [...imgs].slice(0, 12);
  base.heroImage = ogImg || cands[0]?.src;

  // nav items
  const nav = new Set<string>();
  $("nav a, header a").each((_, el) => {
    const t = $(el).text().trim().replace(/\s+/g, " ");
    if (t && t.length <= 24 && !/https?:|@|\d{3}/.test(t)) nav.add(t);
  });
  base.nav = [...nav].slice(0, 8);

  // services: headings + non-boilerplate nav items, deduped case-insensitively
  const services: string[] = [];
  const seenSvc = new Set<string>();
  const addSvc = (t?: string) => {
    if (!t) return;
    t = t.replace(/\s+/g, " ").trim();
    const key = t.toLowerCase();
    if (t.length < 3 || t.length > 40 || NAV_SKIP.test(t) || seenSvc.has(key)) return;
    if (!/[a-z]/i.test(t)) return;                 // skip symbol/number-only
    seenSvc.add(key); services.push(t);
  };
  $("h2, h3").each((_, el) => addSvc($(el).text()));
  for (const n of base.nav) addSvc(n);
  base.services = services.slice(0, 6);

  // contact
  const bodyText = $("body").text().replace(/\s+/g, " ");
  base.phone =
    $('a[href^="tel:"]').first().attr("href")?.replace("tel:", "").trim() ||
    bodyText.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0];
  base.emails = collectEmails($, html);
  base.email = base.emails[0];
  base.address =
    text("address") ||
    bodyText.match(/\d{1,5}\s+[A-Za-z0-9.\s]{3,40},?\s+[A-Za-z\s]{2,20},?\s+[A-Z]{2}\s+\d{5}/)?.[0];

  // hours (best effort)
  // capture full ranges like "Tue-Sat 6:00 am - 2:00 pm", not just the opening time
  const hoursMatch = bodyText.match(/(mon|tue|wed|thu|fri|sat|sun)[a-z]*[\s:.-]+.{0,30}?\d{1,2}(:\d{2})?\s?(am|pm)(\s*(?:-|–|to)\s*\d{1,2}(:\d{2})?\s?(am|pm))?/gi);
  if (hoursMatch) base.hours = [...new Set(hoursMatch.map((h) => h.trim()))].slice(0, 7);

  // socials
  const social: Social[] = [];
  $('a[href*="facebook."], a[href*="instagram."], a[href*="twitter."], a[href*="x.com"], a[href*="linkedin."], a[href*="yelp."], a[href*="tiktok."]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const type = /facebook/.test(href) ? "facebook" : /instagram/.test(href) ? "instagram"
      : /twitter|x\.com/.test(href) ? "twitter" : /linkedin/.test(href) ? "linkedin"
      : /yelp/.test(href) ? "yelp" : /tiktok/.test(href) ? "tiktok" : "link";
    if (!social.find((s) => s.type === type)) social.push({ type, url: href });
  });
  base.social = social;

  // pitch-strength signals: concrete reasons the current site needs help
  const sig: string[] = [];
  if (!/^https:/i.test(base.url)) sig.push("No HTTPS — browsers flag it “Not secure”");
  if (!$('meta[name="viewport"]').length) sig.push("Not mobile-friendly (no responsive viewport)");
  if (/<font\b|<center\b|<marquee\b|<frameset\b/i.test(html)) sig.push("Built with outdated HTML (pre-mobile era)");
  if (/document\.write/i.test(html)) sig.push("Uses legacy scripting (document.write)");
  if (!base.description) sig.push("Missing meta description (weak Google SEO)");
  if (!base.heroImage) sig.push("No prominent hero image");
  if (base.social.length === 0) sig.push("No linked social media");
  base.signals = sig;

  // owner-email finder: if the homepage had no email, check the contact / about page
  if (!base.email) {
    const link = $("a[href]").filter((_, el) =>
      /contact|about|reach|get-?in-?touch/i.test((($(el).attr("href") || "") + " " + $(el).text()))).first().attr("href");
    const curl = abs(base.url, link);
    if (curl && curl !== base.url) {
      const sub = await fetchHtml(curl);
      if (sub.ok) {
        const $$ = cheerio.load(sub.html);
        base.emails = collectEmails($$, sub.html);
        base.email = base.emails[0];
      }
    }
  }
  // last resort: a likely address to try (clearly a guess, surfaced as such in the UI)
  if (!base.email) base.emailGuess = `info@${domain}`;

  base.fetchedOk = true;
  return base;
}
