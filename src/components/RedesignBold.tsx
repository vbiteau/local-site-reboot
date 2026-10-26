import type { BusinessData } from "@/lib/types";

// A second template: dark, bold, high-energy — good for restaurants, bars, gyms, salons.
// Shares the ".rd" root class so the Download-HTML export works for either template.
export default function RedesignBold({ d }: { d: BusinessData }) {
  const accent = d.color && /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#ff5a3c";
  const services = d.services.length ? d.services : ["Our Work", "Quality", "Local & Trusted"];
  const hero = d.heroImage;

  return (
    <div className="rd" style={{ ["--accent" as string]: accent }}>
      <style>{css}</style>

      <header className="bd-nav">
        <div className="bd-brand">{d.logo ? <img src={d.logo} alt="" /> : <span className="bd-dot" />}{d.name}</div>
        <nav>
          {(d.nav.length ? d.nav : ["Menu", "About", "Contact"]).slice(0, 4).map((n, i) => <a key={i} href="#">{n}</a>)}
          {d.phone && <a className="bd-call" href={`tel:${d.phone}`}>{d.phone}</a>}
        </nav>
      </header>

      <section className="bd-hero" style={hero ? { backgroundImage: `linear-gradient(180deg, rgba(8,8,10,.55), rgba(8,8,10,.9)), url(${hero})` } : undefined}>
        <span className="bd-eyebrow">{d.domain}</span>
        <h1>{(d.tagline || d.name || "").toUpperCase()}</h1>
        <p>{d.description || `${d.name} — the local favorite. Come see what everyone's talking about.`}</p>
        <div className="bd-btns">
          {d.phone && <a className="bd-btn" href={`tel:${d.phone}`}>Call {d.phone}</a>}
          <a className="bd-btn ghost" href="#contact">Find us</a>
        </div>
      </section>

      <section className="bd-strip">
        {services.slice(0, 4).map((s, i) => <div key={i}><b>{s}</b></div>)}
      </section>

      {d.images.length > 1 && (
        <section className="bd-gallery">
          {d.images.slice(0, 6).map((src, i) => <div key={i} style={{ backgroundImage: `url(${src})` }} />)}
        </section>
      )}

      <section className="bd-contact" id="contact">
        <h2>Come visit</h2>
        {d.address && <p className="bd-addr">{d.address}</p>}
        <div className="bd-info">
          {d.phone && <a href={`tel:${d.phone}`}>{d.phone}</a>}
          {d.email && <a href={`mailto:${d.email}`}>{d.email}</a>}
          {d.hours.slice(0, 3).map((h, i) => <span key={i}>{h}</span>)}
        </div>
        <div className="bd-social">{d.social.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.type}</a>)}</div>
      </section>

      <footer className="bd-foot">© {new Date().getFullYear()} {d.name} · {d.domain}</footer>
    </div>
  );
}

const css = `
.rd{--ink:#f4f4f6;--mut:#9a9aa6;--bg:#0b0b0f;--card:#15151c;color:var(--ink);background:var(--bg);
  font-family:"Helvetica Neue",Arial,ui-sans-serif,system-ui,sans-serif;line-height:1.5}
.rd *{box-sizing:border-box} .rd a{color:inherit;text-decoration:none} .rd img{max-width:100%}
.bd-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 32px;position:sticky;top:0;background:rgba(11,11,15,.85);backdrop-filter:blur(8px);z-index:5;border-bottom:1px solid #20202a}
.bd-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:20px;text-transform:uppercase;letter-spacing:.04em}
.bd-brand img{height:32px;width:auto}
.bd-dot{width:26px;height:26px;background:var(--accent);border-radius:4px;transform:rotate(45deg)}
.bd-nav nav{display:flex;align-items:center;gap:20px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--mut)}
.bd-nav nav a:hover{color:#fff}
.bd-call{background:var(--accent);color:#0b0b0f!important;padding:9px 16px;border-radius:4px}
.bd-hero{min-height:74vh;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;
  padding:60px 32px;background:#0b0b0f center/cover no-repeat}
.bd-eyebrow{color:var(--accent);font-weight:800;text-transform:uppercase;letter-spacing:.2em;font-size:13px;margin-bottom:16px}
.bd-hero h1{font-size:clamp(40px,8vw,88px);line-height:.95;margin:0 0 20px;font-weight:900;letter-spacing:-.02em;max-width:14ch}
.bd-hero p{font-size:20px;color:#d8d8e0;max-width:540px;margin:0 0 30px}
.bd-btns{display:flex;gap:12px;flex-wrap:wrap}
.bd-btn{background:var(--accent);color:#0b0b0f;padding:15px 28px;border-radius:4px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;font-size:14px}
.bd-btn.ghost{background:transparent;color:#fff;border:2px solid #3a3a46}
.bd-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));border-top:1px solid #20202a}
.bd-strip>div{padding:34px 24px;border-right:1px solid #20202a;text-align:center}
.bd-strip b{font-size:18px;text-transform:uppercase;letter-spacing:.03em}
.bd-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:4px;padding:4px}
.bd-gallery>div{aspect-ratio:1;background:#15151c center/cover no-repeat}
.bd-contact{padding:80px 32px;text-align:center}
.bd-contact h2{font-size:clamp(30px,5vw,52px);font-weight:900;text-transform:uppercase;margin:0 0 16px}
.bd-addr{color:var(--mut);font-size:18px}
.bd-info{display:flex;gap:26px;justify-content:center;flex-wrap:wrap;margin:22px 0;font-weight:700;color:var(--accent)}
.bd-info span{color:var(--mut);font-weight:400}
.bd-social{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.bd-social a{border:1px solid #2c2c38;border-radius:999px;padding:7px 16px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--mut)}
.bd-foot{padding:28px;text-align:center;color:var(--mut);font-size:13px;border-top:1px solid #20202a}
@media(max-width:640px){.bd-nav nav a:not(.bd-call){display:none}}
`;
