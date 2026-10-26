import type { BusinessData } from "@/lib/types";

// Third template: trades / services (plumbers, electricians, HVAC, contractors, landscapers).
// Phone-forward, trust signals, quote CTA. Shares the ".rd" root so Download-HTML works.
export default function RedesignTrade({ d }: { d: BusinessData }) {
  const accent = d.color && /^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#0e7c4a";
  const services = d.services.length ? d.services : ["Repairs", "Installation", "Maintenance", "Emergency Service"];
  const hero = d.heroImage;
  const area = d.address ? d.address.split(",").slice(1).join(",").trim() : "";

  return (
    <div className="rd" style={{ ["--accent" as string]: accent }}>
      <style>{css}</style>

      <div className="tr-topbar">
        <span>{area ? `Proudly serving ${area}` : "Licensed · Insured · Locally owned"}</span>
        {d.phone && <a href={`tel:${d.phone}`}>☎ {d.phone}</a>}
      </div>

      <header className="tr-nav">
        <div className="tr-brand">{d.logo ? <img src={d.logo} alt="" /> : <span className="tr-badge">{(d.name || "?").slice(0, 1)}</span>}{d.name}</div>
        {d.phone && <a className="tr-quote" href={`tel:${d.phone}`}>Get a Free Quote</a>}
      </header>

      <section className="tr-hero" style={hero ? { backgroundImage: `linear-gradient(90deg, rgba(14,20,28,.9), rgba(14,20,28,.55)), url(${hero})` } : undefined}>
        <div className="tr-hero-in">
          <div className="tr-trust">★★★★★ Trusted by local homeowners</div>
          <h1>{d.tagline || `${d.name}`}</h1>
          <p>{d.description || `Fast, reliable service you can count on. ${area ? `Serving ${area} and nearby.` : "Call today for a free estimate."}`}</p>
          <div className="tr-btns">
            {d.phone && <a className="tr-btn" href={`tel:${d.phone}`}>Call {d.phone}</a>}
            <a className="tr-btn alt" href="#contact">Request a Quote</a>
          </div>
          <div className="tr-badges"><span>✓ Licensed &amp; Insured</span><span>✓ Free Estimates</span><span>✓ Satisfaction Guaranteed</span></div>
        </div>
      </section>

      <section className="tr-services">
        <h2>Our Services</h2>
        <div className="tr-grid">
          {services.slice(0, 6).map((s, i) => (
            <div className="tr-card" key={i}><span className="tr-check">✓</span><div><h3>{s}</h3><p>Professional {s.toLowerCase()} done right the first time.</p></div></div>
          ))}
        </div>
      </section>

      <section className="tr-why">
        <h2>Why choose {d.name}?</h2>
        <div className="tr-why-grid">
          <div><b>Fast response</b><p>We show up on time and get the job done.</p></div>
          <div><b>Fair pricing</b><p>Upfront quotes, no surprises.</p></div>
          <div><b>Local &amp; trusted</b><p>Your neighbors already rely on us.</p></div>
        </div>
      </section>

      <section className="tr-cta" id="contact">
        <h2>Need help today?</h2>
        <p>{area ? `Serving ${area} and surrounding areas.` : "Call now for fast, friendly service."}</p>
        {d.phone && <a className="tr-btn big" href={`tel:${d.phone}`}>☎ Call {d.phone}</a>}
        <div className="tr-contact">
          {d.email && <a href={`mailto:${d.email}`}>{d.email}</a>}
          {d.address && <span>{d.address}</span>}
          {d.hours.slice(0, 2).map((h, i) => <span key={i}>{h}</span>)}
        </div>
      </section>

      <footer className="tr-foot">© {new Date().getFullYear()} {d.name} · {d.domain}{area ? ` · ${area}` : ""}</footer>
    </div>
  );
}

const css = `
.rd{--ink:#14202c;--mut:#5a6b7a;--line:#e2e8ee;--bg:#fff;color:var(--ink);background:var(--bg);font-family:ui-sans-serif,system-ui,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.55}
.rd *{box-sizing:border-box} .rd a{text-decoration:none;color:inherit} .rd img{max-width:100%}
.tr-topbar{display:flex;justify-content:space-between;align-items:center;background:#14202c;color:#cdd8e2;padding:8px 28px;font-size:13px;font-weight:600}
.tr-topbar a{color:#fff}
.tr-nav{display:flex;align-items:center;justify-content:space-between;padding:16px 28px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#fff;z-index:5}
.tr-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:21px}
.tr-brand img{height:38px}
.tr-badge{width:38px;height:38px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800}
.tr-quote{background:var(--accent);color:#fff!important;padding:12px 20px;border-radius:6px;font-weight:800}
.tr-hero{background:#14202c center/cover no-repeat;color:#fff;padding:80px 28px}
.tr-hero-in{max-width:680px}
.tr-trust{color:#ffd24a;font-weight:700;margin-bottom:14px;font-size:14px}
.tr-hero h1{font-size:clamp(34px,5.5vw,56px);line-height:1.05;margin:0 0 16px;font-weight:900;letter-spacing:-.02em}
.tr-hero p{font-size:19px;color:#d6dee6;margin:0 0 26px;max-width:560px}
.tr-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.tr-btn{background:var(--accent);color:#fff;padding:15px 28px;border-radius:6px;font-weight:800;font-size:16px}
.tr-btn.alt{background:#fff;color:var(--ink)}
.tr-btn.big{font-size:20px;padding:18px 40px;display:inline-block;margin:8px 0 20px}
.tr-badges{display:flex;gap:20px;flex-wrap:wrap;font-weight:700;font-size:14px;color:#aee3c6}
.tr-services{max-width:1060px;margin:0 auto;padding:70px 28px}
.tr-services h2,.tr-why h2,.tr-cta h2{font-size:30px;font-weight:800;letter-spacing:-.01em;margin:0 0 30px;text-align:center}
.tr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
.tr-card{display:flex;gap:14px;border:1px solid var(--line);border-radius:12px;padding:22px;align-items:flex-start}
.tr-check{background:var(--accent);color:#fff;min-width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px}
.tr-card h3{margin:0 0 4px;font-size:18px} .tr-card p{margin:0;color:var(--mut);font-size:14px}
.tr-why{background:#f5f8fb;padding:70px 28px}
.tr-why-grid{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;text-align:center}
.tr-why-grid b{display:block;font-size:19px;margin-bottom:6px;color:var(--accent)}
.tr-why-grid p{margin:0;color:var(--mut)}
.tr-cta{text-align:center;padding:76px 28px}
.tr-cta p{color:var(--mut);font-size:18px;margin:0 0 10px}
.tr-contact{display:flex;gap:22px;justify-content:center;flex-wrap:wrap;color:var(--mut);font-size:14px;margin-top:10px}
.tr-contact a{color:var(--accent);font-weight:700}
.tr-foot{background:#14202c;color:#9fb0c0;text-align:center;padding:24px;font-size:13px}
@media(max-width:640px){.tr-topbar{flex-direction:column;gap:4px}}
`;
