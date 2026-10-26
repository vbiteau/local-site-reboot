import type { BusinessData } from "@/lib/types";

// Friendly: rounded shapes, warm pastel, playful — cafés, bakeries, pet groomers, daycares.
// Shares the ".rd" root class so the Download-HTML export works.
export default function RedesignFriendly({ d }: { d: BusinessData }) {
  const accent = d.color && /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#f2734a";
  const services = d.services.length ? d.services : ["Fresh Every Day", "Made with Love", "Come Say Hi"];
  const hero = d.heroImage;
  const emoji = ["☕", "🥐", "🌼", "🐾", "🎈", "🍰"];

  return (
    <div className="rd" style={{ ["--accent" as string]: accent }}>
      <style>{css}</style>

      <header className="fr-nav">
        <div className="fr-brand">{d.logo ? <img src={d.logo} alt="" /> : <span className="fr-blob">{(d.name || "?").slice(0, 1)}</span>}{d.name}</div>
        <nav>
          {(d.nav.length ? d.nav : ["Menu", "About", "Visit"]).slice(0, 3).map((n, i) => <a key={i} href="#">{n}</a>)}
          {d.phone && <a className="fr-pill" href={`tel:${d.phone}`}>Say hi 👋</a>}
        </nav>
      </header>

      <section className="fr-hero">
        <div>
          <span className="fr-tag">👋 Welcome, neighbor!</span>
          <h1>{d.tagline || d.name}</h1>
          <p>{d.description || `${d.name} is your cozy local spot. Come in, stay a while.`}</p>
          <div className="fr-btns">
            {d.phone && <a className="fr-btn" href={`tel:${d.phone}`}>Give us a call</a>}
            <a className="fr-btn soft" href="#visit">Find us</a>
          </div>
        </div>
        <div className="fr-photo" style={hero ? { backgroundImage: `url(${hero})` } : undefined}>{!hero && "🏡"}</div>
      </section>

      <section className="fr-cards">
        {services.slice(0, 6).map((s, i) => (
          <div className="fr-card" key={i}><span className="fr-emoji">{emoji[i % emoji.length]}</span><h3>{s}</h3><p>Something we think you’ll love.</p></div>
        ))}
      </section>

      {d.images.length > 1 && (
        <section className="fr-gallery">
          {d.images.slice(1, 5).map((src, i) => <div key={i} style={{ backgroundImage: `url(${src})` }} />)}
        </section>
      )}

      <section className="fr-visit" id="visit">
        <h2>Come visit us! 📍</h2>
        {d.address && <p className="fr-addr">{d.address}</p>}
        <div className="fr-chips">
          {d.phone && <a href={`tel:${d.phone}`}>📞 {d.phone}</a>}
          {d.email && <a href={`mailto:${d.email}`}>✉️ {d.email}</a>}
          {d.hours.slice(0, 3).map((h, i) => <span key={i}>🕐 {h}</span>)}
          {d.social.map((s, i) => <a key={`s${i}`} href={s.url} target="_blank" rel="noreferrer">{s.type}</a>)}
        </div>
      </section>

      <footer className="fr-foot">Made with ♥ by {d.name} · {new Date().getFullYear()}</footer>
    </div>
  );
}

const css = `
.rd{--ink:#3a2e2a;--mut:#806c63;--bg:#fff8f1;--soft:#ffe9da;color:var(--ink);background:var(--bg);
  font-family:"Trebuchet MS","Segoe UI",ui-rounded,system-ui,sans-serif;line-height:1.55}
.rd *{box-sizing:border-box} .rd a{color:inherit;text-decoration:none} .rd img{max-width:100%}
.fr-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 30px}
.fr-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:22px}
.fr-brand img{height:42px;border-radius:12px}
.fr-blob{width:42px;height:42px;border-radius:40% 60% 55% 45%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
.fr-nav nav{display:flex;align-items:center;gap:20px;font-weight:700;color:var(--mut)}
.fr-pill{background:var(--accent);color:#fff!important;padding:9px 18px;border-radius:999px}
.fr-hero{display:grid;grid-template-columns:1.1fr 1fr;gap:34px;align-items:center;padding:40px 30px 70px;max-width:1080px;margin:0 auto}
.fr-tag{display:inline-block;background:var(--soft);color:var(--accent);font-weight:800;padding:7px 14px;border-radius:999px;font-size:14px;margin-bottom:16px}
.fr-hero h1{font-size:clamp(34px,5vw,54px);line-height:1.08;margin:0 0 16px;font-weight:800}
.fr-hero p{font-size:19px;color:var(--mut);margin:0 0 26px}
.fr-btns{display:flex;gap:12px;flex-wrap:wrap}
.fr-btn{background:var(--accent);color:#fff;padding:14px 26px;border-radius:999px;font-weight:800;box-shadow:0 6px 0 rgba(0,0,0,.12)}
.fr-btn.soft{background:var(--soft);color:var(--ink);box-shadow:none}
.fr-photo{aspect-ratio:1;border-radius:46% 54% 42% 58% / 52% 44% 56% 48%;background:var(--soft) center/cover no-repeat;display:flex;align-items:center;justify-content:center;font-size:90px}
.fr-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;padding:0 30px 70px;max-width:1080px;margin:0 auto}
.fr-card{background:#fff;border-radius:24px;padding:26px;box-shadow:0 10px 30px rgba(120,70,40,.08)}
.fr-emoji{font-size:34px}
.fr-card h3{margin:10px 0 4px;font-size:20px} .fr-card p{margin:0;color:var(--mut);font-size:15px}
.fr-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;padding:0 30px 70px;max-width:1080px;margin:0 auto}
.fr-gallery div{aspect-ratio:1;border-radius:22px;background:var(--soft) center/cover no-repeat}
.fr-visit{background:var(--soft);text-align:center;padding:70px 30px;border-radius:40px 40px 0 0}
.fr-visit h2{font-size:34px;margin:0 0 10px}
.fr-addr{color:var(--mut);font-size:18px}
.fr-chips{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px}
.fr-chips a,.fr-chips span{background:#fff;padding:9px 16px;border-radius:999px;font-weight:700;font-size:14px;text-transform:none}
.fr-foot{background:var(--soft);text-align:center;padding:0 0 30px;color:var(--mut);font-size:14px}
@media(max-width:720px){.fr-hero{grid-template-columns:1fr}.fr-nav nav a:not(.fr-pill){display:none}}
`;
