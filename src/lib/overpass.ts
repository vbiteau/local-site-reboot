import type { Lead } from "./types";

const UA = "LocalSiteReboot/1.0 (lead finder; contact: you@example.com)";
const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const cache = new Map<string, { at: number; leads: Lead[] }>();
const TTL = 1000 * 60 * 30;

function humanize(tags: Record<string, string>): string {
  const v = tags.shop || tags.amenity || tags.office || tags.craft || "business";
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function geocode(city: string, state: string) {
  const q = encodeURIComponent(`${city}, ${state}, USA`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  const hits = await res.json();
  if (!hits.length) return null;
  const bb = hits[0].boundingbox.map(Number); // [south, north, west, east]
  return { south: bb[0], north: bb[1], west: bb[2], east: bb[3], name: hits[0].display_name };
}

async function runOverpass(query: string): Promise<any> {
  let lastErr: unknown;
  for (const ep of OVERPASS) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
        body: "data=" + encodeURIComponent(query),
        signal: ctrl.signal,
      });
      clearTimeout(to);
      if (res.ok) return res.json();
      lastErr = new Error("overpass " + res.status);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function findLeads(city: string, state: string): Promise<{ leads: Lead[]; area: string }> {
  const key = `${city.toLowerCase()}|${state.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return { leads: hit.leads, area: `${city}, ${state}` };

  const geo = await geocode(city, state);
  if (!geo) throw new Error("Could not find that town/city.");
  const bbox = `${geo.south},${geo.west},${geo.north},${geo.east}`;

  const query =
    `[out:json][timeout:25];(` +
    `nwr["shop"]["name"](${bbox});` +
    `nwr["office"]["name"](${bbox});` +
    `nwr["craft"]["name"](${bbox});` +
    `nwr["amenity"~"^(restaurant|cafe|bar|pub|fast_food|bakery|pharmacy|clinic|dentist|doctors|veterinary|car_repair|fuel|bank|hairdresser|beauty)$"]["name"](${bbox});` +
    `);out center 400;`;

  const data = await runOverpass(query);
  const seen = new Set<string>();
  const leads: Lead[] = [];
  for (const el of data.elements || []) {
    const t = el.tags || {};
    if (!t.name) continue;
    const nameKey = t.name.toLowerCase().trim();
    if (seen.has(nameKey)) continue;
    seen.add(nameKey);
    const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
    const website = t.website || t["contact:website"] || t.url;
    const addr = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ") +
      (t["addr:city"] ? `, ${t["addr:city"]}` : "");
    leads.push({
      name: t.name,
      category: humanize(t),
      website: website && /^https?:\/\//i.test(website) ? website : website ? "http://" + website : undefined,
      phone: t.phone || t["contact:phone"],
      address: addr.trim() || undefined,
      lat, lon,
    });
  }
  // hot leads first: no website, then has website; then alphabetical
  leads.sort((a, b) => Number(!!a.website) - Number(!!b.website) || a.name.localeCompare(b.name));
  cache.set(key, { at: Date.now(), leads });
  return { leads, area: geo.name };
}
