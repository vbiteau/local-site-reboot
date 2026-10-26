export type OutreachInput = {
  business: string;
  yourName?: string;
  yourPhone?: string;
  previewUrl?: string;
  noSite: boolean;       // true = they have no website (cold "new site" pitch)
  signal?: string;       // a concrete issue with their current site, woven into the pitch
};

export type Outreach = { subject: string; email: string; sms: string };

/** Build a personalized cold-outreach email + SMS to a local business owner. */
export function buildOutreach(i: OutreachInput): Outreach {
  const b = i.business || "your business";
  const name = i.yourName || "[Your Name]";
  const phone = i.yourPhone ? ` or text me at ${i.yourPhone}` : "";
  const preview = i.previewUrl ? `\n\nHere's the preview I built: ${i.previewUrl}` : "\n\nI can send over the preview link if you'd like to see it.";

  if (i.noSite) {
    return {
      subject: `A website for ${b}?`,
      email:
`Hi,

I'm ${name}, a local web designer. I came across ${b} and noticed you don't have a website yet — which means customers searching online right now are landing on your competitors instead.

I'd love to build you a clean, modern, mobile-friendly site that shows up in search and makes it easy for people to find your hours, call you, and get directions.${preview}

No obligation — if you like it, we can get it live quickly. Could I show you what I have in mind?

Best,
${name}${phone}`,
      sms: `Hi! I'm ${name}, a local web designer. Noticed ${b} doesn't have a website yet — I can build you a modern one that brings in customers. Want me to send a free preview?`,
    };
  }

  const signalLine = i.signal
    ? ` I noticed your current site ${i.signal.charAt(0).toLowerCase() + i.signal.slice(1)}, so I`
    : " I";

  return {
    subject: `Made ${b} a new website — free preview`,
    email:
`Hi,

I'm ${name}, a local web designer. I'm a fan of ${b}, and${signalLine} rebuilt your website as a modern, mobile-friendly version — faster, cleaner, and easier for customers to use on their phones.${preview}

There's no cost to look, and nothing changes on your end unless you love it. If you do, I can have the new site live for you quickly.

Would you be open to a quick look? Happy to answer any questions by reply${phone}.

Best,
${name}`,
    sms: `Hi! I'm ${name}, a local web designer — I'm a fan of ${b} and rebuilt your site as a modern, mobile-friendly version (free to look). Can I send you the preview link?`,
  };
}
