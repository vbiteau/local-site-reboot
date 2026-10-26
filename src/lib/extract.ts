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

const NAV_SKIP = /^(home|about|about us|contact|contact us|menu|gallery|blog|news|login|sign in|cart|search|privacy|terms|faq)$/i;

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
    services: [], hours: [], social: [], nav: [], signals: [], fetchedOk: false,
  };

  let html = "";
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, signal: ctrl.signal, redirect: "follow" });
    clearTimeout(to);
    if (!res.ok) { base.note = `Site returned HTTP ${res.status}.`; return base; }
    html = await res.text();
    base.url = res.url || url;
  } catch (e) {
    base.note = "Could not reach the site (it may block bots or be offline).";
    return base;
  }

  const $ = cheerio.load(html);
  const meta = (sel: string) => $(sel).attr("content")?.trim() || undefined;
  const text = (sel: string) => $(sel).first().text().trim() || undefined;

  // name
  base.name =
    meta('meta[property="og:site_name"]') ||
    (text("h1") && text("h1")!.length < 60 ? text("h1") : undefined) ||
    ($("title").text().split(/[|\-–—:·]/)[0] || "").trim() ||
    domain;

  // tagline / description
  base.tagline = (text("h1") && text("h1") !== base.name ? text("h1") : undefined) || text("h2");
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

  // hero + images
  base.heroImage = abs(base.url, meta('meta[property="og:image"]'));
  const imgs = new Set<string>();
  if (base.heroImage) imgs.add(base.heroImage);
  $("img").each((_, el) => {
    const src = abs(base.url, $(el).attr("src") || $(el).attr("data-src"));
    if (!src) return;
    if (/\.(svg)$/i.test(src)) return;
    if (/sprite|icon|pixel|spacer|blank|1x1/i.test(src)) return;
    imgs.add(src);
  });
  base.images = [...imgs].slice(0, 12);
  if (!base.heroImage && base.images.length) base.heroImage = base.images[0];

  // nav items
  const nav = new Set<string>();
  $("nav a, header a").each((_, el) => {
    const t = $(el).text().trim().replace(/\s+/g, " ");
    if (t && t.length <= 24 && !/https?:|@|\d{3}/.test(t)) nav.add(t);
  });
  base.nav = [...nav].slice(0, 8);

  // services: headings + non-boilerplate nav items
  const services = new Set<string>();
  $("h2, h3").each((_, el) => {
    const t = $(el).text().trim().replace(/\s+/g, " ");
    if (t && t.length >= 3 && t.length <= 40 && !NAV_SKIP.test(t)) services.add(t);
  });
  for (const n of base.nav) if (!NAV_SKIP.test(n)) services.add(n);
  base.services = [...services].slice(0, 6);

  // contact
  const bodyText = $("body").text().replace(/\s+/g, " ");
  base.phone =
    $('a[href^="tel:"]').first().attr("href")?.replace("tel:", "").trim() ||
    bodyText.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0];
  base.email =
    $('a[href^="mailto:"]').first().attr("href")?.replace("mailto:", "").split("?")[0].trim() ||
    bodyText.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0];
  base.address =
    text("address") ||
    bodyText.match(/\d{1,5}\s+[A-Za-z0-9.\s]{3,40},?\s+[A-Za-z\s]{2,20},?\s+[A-Z]{2}\s+\d{5}/)?.[0];

  // hours (best effort)
  const hoursMatch = bodyText.match(/(mon|tue|wed|thu|fri|sat|sun)[a-z]*[\s:.-]+.{0,30}?\d{1,2}(:\d{2})?\s?(am|pm)/gi);
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

  base.fetchedOk = true;
  return base;
}
