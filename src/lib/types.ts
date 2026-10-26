export type Social = { type: string; url: string };

export type BusinessData = {
  url: string;
  domain: string;
  name: string;
  tagline?: string;
  description?: string;
  logo?: string;
  heroImage?: string;
  images: string[];
  color: string;        // brand accent, hex
  services: string[];
  phone?: string;
  email?: string;
  address?: string;
  hours: string[];
  social: Social[];
  nav: string[];
  signals: string[];    // pitch ammo: what's wrong with the current site
  fetchedOk: boolean;
  note?: string;        // if scrape was partial / failed
};

export type LeadStatus = "new" | "contacted" | "interested" | "won" | "dead";

export type Lead = {
  name: string;
  category: string;     // human label, e.g. "Restaurant"
  website?: string;
  phone?: string;
  address?: string;
  lat: number;
  lon: number;
};
