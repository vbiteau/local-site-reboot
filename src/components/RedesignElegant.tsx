import type { BusinessData } from "@/lib/types";

// Elegant: serif type, warm cream, generous whitespace — salons, spas, boutiques, fine dining.
// Shares the ".rd" root class so the Download-HTML export works.
export default function RedesignElegant({ d }: { d: BusinessData }) {
  const accent = d.color && /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#8a6a3b";
  const services = d.services.length ? d.services : ["Signature Services", "Private Appointments", "Gift Cards"];
  const hero = d.heroImage;

  return (
    <div className="rd" style={{ ["--accent" as string]: accent }}>
      <style>{css}</style>

      <header className="el-nav">
        <nav className="el-left">{(d.nav.length ? d.nav : ["About", "Services"]).slice(0, 2).map((n, i) => <a key={i} href="#">{n}</a>)}</nav>
        <div className="el-brand">{d.logo ? <img src={d.logo} alt="" /> : d.name}</div>
        <nav className="el-right">{d.phone ? <a href={`tel:${d.phone}`}>Book · {d.phone}</a> : <a href="#visit">Visit</a>}</nav>
      </header>

      <section className="el-hero">
        <div className="el-hero-text">
          <span className="el-kicker">Est. locally · {d.domain}</span>
          <h1>{d.tagline || d.name}</h1>
          <p>{d.description || `An intimate experience, thoughtfully crafted. Welcome to ${d.name}.`}</p>
          {d.phone && <a className="el-btn" href={`tel:${d.phone}`}>Reserve your visit</a>}
        </div>
        <div className="el-hero-img" style={hero ? { backgroundImage: `url(${hero})` } : undefined} />
      </section>

      <section className="el-services">
        <h2>Offerings</h2>
        <ul>
          {services.slice(0, 6).map((s, i) => (
            <li key={i}><span>{s}</span><i /><em>Enquire</em></li>
          ))}
        </ul>
      </section>

      {d.images.length > 1 && (
        <section className="el-gallery">
          {d.images.slice(1, 4).map((src, i) => <div key={i} style={{ backgroundImage: `url(${src})` }} />)}
        </section>
      )}

      <section className="el-visit" id="visit">
        <h2>Visit us</h2>
        {d.address && <p>{d.address}</p>}
        {d.hours.length > 0 && <p className="el-hours">{d.hours.slice(0, 3).join(" · ")}</p>}
        <p className="el-contact">
          {d.phone && <a href={`tel:${d.phone}`}>{d.phone}</a>}
          {d.email && <a href={`mailto:${d.email}`}>{d.email}</a>}
        </p>
        <div className="el-social">{d.social.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.type}</a>)}</div>
      </section>

      <footer className="el-foot">{d.name} — {new Date().getFullYear()}</footer>
    </div>
  );
}

const css = `
.rd{--ink:#2b2520;--mut:#7a6e62;--bg:#faf6ef;--line:#e7dccb;color:var(--ink);background:var(--bg);
  font-family:Georgia,"Times New Roman",serif;line-height:1.6}
.rd *{box-sizing:border-box} .rd a{color:inherit;text-decoration:none} .rd img{max-width:100%}
.el-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:26px 40px;border-bottom:1px solid var(--line)}
.el-left,.el-right{display:flex;gap:26px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--mut)}
.el-right{justify-content:flex-end}
.el-brand{font-size:28px;font-style:italic;letter-spacing:.02em;text-align:center}
.el-brand img{height:46px}
.el-hero{display:grid;grid-template-columns:1fr 1fr;min-height:68vh}
.el-hero-text{padding:80px 56px;display:flex;flex-direction:column;justify-content:center}
.el-kicker{font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:var(--accent);margin-bottom:22px}
.el-hero h1{font-size:clamp(36px,5vw,62px);line-height:1.08;font-weight:400;margin:0 0 22px}
.el-hero p{font-size:18px;color:var(--mut);max-width:440px;margin:0 0 32px}
.el-btn{align-self:flex-start;border:1px solid var(--ink);padding:14px 30px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:12px;letter-spacing:.2em;text-transform:uppercase}
.el-btn:hover{background:var(--ink);color:var(--bg)}
.el-hero-img{background:#e9dfcf center/cover no-repeat;min-height:340px}
.el-services{max-width:760px;margin:0 auto;padding:90px 32px}
.el-services h2,.el-visit h2{font-weight:400;font-style:italic;font-size:38px;text-align:center;margin:0 0 40px}
.el-services ul{list-style:none;padding:0;margin:0}
.el-services li{display:flex;align-items:baseline;gap:14px;padding:16px 0;font-size:20px}
.el-services li i{flex:1;border-bottom:1px dotted var(--line);transform:translateY(-5px)}
.el-services li em{font-family:ui-sans-serif,system-ui,sans-serif;font-style:normal;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
.el-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:0 6px}
.el-gallery div{aspect-ratio:3/4;background:#e9dfcf center/cover no-repeat}
.el-visit{text-align:center;padding:90px 32px;border-top:1px solid var(--line)}
.el-visit p{color:var(--mut);font-size:18px;margin:6px 0}
.el-contact{display:flex;gap:26px;justify-content:center;flex-wrap:wrap}
.el-contact a{color:var(--accent);border-bottom:1px solid var(--line)}
.el-social{display:flex;gap:18px;justify-content:center;margin-top:18px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--mut)}
.el-foot{text-align:center;padding:30px;font-style:italic;color:var(--mut);border-top:1px solid var(--line)}
@media(max-width:720px){.el-hero{grid-template-columns:1fr}.el-nav{grid-template-columns:1fr;gap:10px;text-align:center}.el-left,.el-right{justify-content:center}}
`;
