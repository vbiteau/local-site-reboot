import type { BusinessData } from "@/lib/types";

// A single polished, modern, responsive template. Scraped content pours in;
// the business's brand colour drives the accents.
export default function Redesign({ d }: { d: BusinessData }) {
  const accent = d.color || "#2563eb";
  const services = d.services.length ? d.services : ["Our Services", "Quality Work", "Trusted Locally"];
  const hero = d.heroImage;

  return (
    <div className="rd" style={{ ["--accent" as string]: accent }}>
      <style>{css}</style>

      <header className="rd-nav">
        <div className="rd-brand">
          {d.logo ? <img src={d.logo} alt="" className="rd-logo" /> : <span className="rd-dot" />}
          <span>{d.name}</span>
        </div>
        <nav className="rd-links">
          {(d.nav.length ? d.nav : ["Services", "About", "Contact"]).slice(0, 5).map((n, i) => (
            <a key={i} href="#">{n}</a>
          ))}
          {d.phone && <a className="rd-cta" href={`tel:${d.phone}`}>Call {d.phone}</a>}
        </nav>
      </header>

      <section className="rd-hero" style={hero ? { backgroundImage: `linear-gradient(to right, rgba(10,12,20,.82), rgba(10,12,20,.45)), url(${hero})` } : undefined}>
        <div className="rd-hero-in">
          <h1>{d.tagline || d.name}</h1>
          <p>{d.description || `${d.name} — proudly serving our community with care and quality.`}</p>
          <div className="rd-hero-btns">
            {d.phone && <a className="rd-btn" href={`tel:${d.phone}`}>Call Now</a>}
            <a className="rd-btn ghost" href="#contact">Get in touch</a>
          </div>
        </div>
      </section>

      <section className="rd-services">
        <h2>What we offer</h2>
        <div className="rd-grid">
          {services.slice(0, 6).map((s, i) => (
            <div className="rd-card" key={i}>
              <span className="rd-num">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s}</h3>
              <p>Dependable, professional {s.toLowerCase()} you can count on.</p>
            </div>
          ))}
        </div>
      </section>

      {d.images.length > 1 && (
        <section className="rd-gallery">
          {d.images.slice(0, 6).map((src, i) => (
            <div key={i} className="rd-ph" style={{ backgroundImage: `url(${src})` }} />
          ))}
        </section>
      )}

      <section className="rd-contact" id="contact">
        <div>
          <h2>Visit or get in touch</h2>
          {d.address && <p className="rd-addr">{d.address}</p>}
          <ul className="rd-contact-list">
            {d.phone && <li><b>Phone</b> <a href={`tel:${d.phone}`}>{d.phone}</a></li>}
            {d.email && <li><b>Email</b> <a href={`mailto:${d.email}`}>{d.email}</a></li>}
            {d.address && <li><b>Address</b> {d.address}</li>}
          </ul>
          <div className="rd-social">
            {d.social.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.type}</a>)}
          </div>
        </div>
        {d.hours.length > 0 && (
          <div className="rd-hours">
            <h3>Hours</h3>
            <ul>{d.hours.map((h, i) => <li key={i}>{h}</li>)}</ul>
          </div>
        )}
      </section>

      <footer className="rd-foot">
        <span>© {new Date().getFullYear()} {d.name}</span>
        <span>{d.domain}</span>
      </footer>
    </div>
  );
}

const css = `
.rd{--ink:#101828;--muted:#667085;--line:#e4e7ec;--bg:#fff;color:var(--ink);background:var(--bg);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.5}
.rd *{box-sizing:border-box}
.rd img{max-width:100%}
.rd a{color:inherit;text-decoration:none}
.rd-nav{display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid var(--line);position:sticky;top:0;background:rgba(255,255,255,.9);backdrop-filter:blur(8px);z-index:5}
.rd-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:19px;letter-spacing:-.02em}
.rd-logo{height:34px;width:auto;object-fit:contain}
.rd-dot{width:28px;height:28px;border-radius:8px;background:var(--accent);display:inline-block}
.rd-links{display:flex;align-items:center;gap:22px;font-weight:600;font-size:14px;color:var(--muted)}
.rd-links a:hover{color:var(--ink)}
.rd-cta{background:var(--accent);color:#fff!important;padding:9px 16px;border-radius:999px;font-weight:700}
.rd-hero{background:#0a0c14 center/cover no-repeat;color:#fff;padding:92px 28px}
.rd-hero-in{max-width:720px}
.rd-hero h1{font-size:clamp(32px,5vw,56px);line-height:1.05;letter-spacing:-.03em;margin:0 0 16px;font-weight:800}
.rd-hero p{font-size:19px;color:#d0d5dd;max-width:560px;margin:0 0 28px}
.rd-hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.rd-btn{background:var(--accent);color:#fff;padding:13px 24px;border-radius:999px;font-weight:700;font-size:15px}
.rd-btn.ghost{background:transparent;border:1.5px solid rgba(255,255,255,.5)}
.rd-services{padding:72px 28px;max-width:1060px;margin:0 auto}
.rd-services h2,.rd-contact h2{font-size:30px;letter-spacing:-.02em;margin:0 0 32px;font-weight:800}
.rd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
.rd-card{border:1px solid var(--line);border-radius:16px;padding:26px;transition:.15s}
.rd-card:hover{box-shadow:0 12px 30px rgba(16,24,40,.08);transform:translateY(-2px)}
.rd-num{font-size:13px;font-weight:800;color:var(--accent)}
.rd-card h3{font-size:19px;margin:8px 0 6px;letter-spacing:-.01em}
.rd-card p{color:var(--muted);font-size:14px;margin:0}
.rd-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;padding:0 28px 8px;max-width:1060px;margin:0 auto}
.rd-ph{aspect-ratio:4/3;background:#f2f4f7 center/cover no-repeat;border-radius:12px}
.rd-contact{padding:72px 28px;max-width:1060px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr;gap:40px;border-top:1px solid var(--line)}
.rd-addr{color:var(--muted);font-size:17px}
.rd-contact-list{list-style:none;padding:0;margin:20px 0;display:grid;gap:12px}
.rd-contact-list li{display:flex;gap:12px;font-size:15px}
.rd-contact-list b{width:72px;color:var(--muted);font-weight:600}
.rd-social{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
.rd-social a{font-size:12px;text-transform:capitalize;border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-weight:600}
.rd-hours h3{margin:0 0 12px}
.rd-hours ul{list-style:none;padding:0;margin:0;color:var(--muted);font-size:14px;display:grid;gap:6px}
.rd-foot{display:flex;justify-content:space-between;padding:24px 28px;border-top:1px solid var(--line);color:var(--muted);font-size:13px;flex-wrap:wrap;gap:8px}
@media(max-width:720px){.rd-contact{grid-template-columns:1fr}.rd-links a:not(.rd-cta){display:none}}
`;
