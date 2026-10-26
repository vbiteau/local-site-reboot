"use client";
import { useState } from "react";
import Redesign from "@/components/Redesign";
import { buildOutreach } from "@/lib/outreach";
import type { BusinessData, Lead } from "@/lib/types";

export default function Home() {
  const [tab, setTab] = useState<"leads" | "redesign" | "outreach">("leads");

  // lead finder
  const [city, setCity] = useState("");
  const [stateAbbr, setStateAbbr] = useState("");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [area, setArea] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadErr, setLeadErr] = useState("");
  const [filter, setFilter] = useState<"all" | "none" | "has">("all");

  // redesign
  const [url, setUrl] = useState("");
  const [data, setData] = useState<BusinessData | null>(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeErr, setScrapeErr] = useState("");
  const [view, setView] = useState<"after" | "before">("after");

  // outreach
  const [oBiz, setOBiz] = useState("");
  const [oName, setOName] = useState("");
  const [oPhone, setOPhone] = useState("");
  const [oPreview, setOPreview] = useState("");
  const [oNoSite, setONoSite] = useState(false);
  const [copied, setCopied] = useState("");

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!city.trim() || !stateAbbr.trim()) return;
    setLeadLoading(true); setLeadErr(""); setLeads(null);
    try {
      const r = await fetch(`/api/leads?city=${encodeURIComponent(city)}&state=${encodeURIComponent(stateAbbr)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Search failed");
      setLeads(j.leads); setArea(j.area);
    } catch (e) { setLeadErr(e instanceof Error ? e.message : "Search failed"); }
    finally { setLeadLoading(false); }
  }

  async function generate(target?: string) {
    const u = (target ?? url).trim();
    if (!u) return;
    setUrl(u); setTab("redesign"); setScrapeLoading(true); setScrapeErr(""); setData(null); setView("after");
    try {
      const r = await fetch(`/api/scrape?url=${encodeURIComponent(u)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Scrape failed");
      setData(j); setOBiz(j.name); setONoSite(false);
    } catch (e) { setScrapeErr(e instanceof Error ? e.message : "Scrape failed"); }
    finally { setScrapeLoading(false); }
  }

  function pitchNew(l: Lead) {
    setOBiz(l.name); setONoSite(true); setOPreview(""); setTab("outreach");
  }
  function copy(label: string, txt: string) {
    navigator.clipboard?.writeText(txt).then(() => { setCopied(label); setTimeout(() => setCopied(""), 1500); });
  }

  const shown = leads?.filter((l) => filter === "all" ? true : filter === "none" ? !l.website : !!l.website) ?? [];
  const hot = leads?.filter((l) => !l.website).length ?? 0;
  const mail = buildOutreach({ business: oBiz, yourName: oName, yourPhone: oPhone, previewUrl: oPreview, noSite: oNoSite });

  return (
    <main className="app">
      <header className="top">
        <div className="logo">◧ Local Site <b>Reboot</b></div>
        <nav className="tabs">
          <button className={tab === "leads" ? "on" : ""} onClick={() => setTab("leads")}>1 · Find leads</button>
          <button className={tab === "redesign" ? "on" : ""} onClick={() => setTab("redesign")}>2 · Redesign</button>
          <button className={tab === "outreach" ? "on" : ""} onClick={() => setTab("outreach")}>3 · Outreach</button>
        </nav>
      </header>

      {tab === "leads" && (
        <section className="panel">
          <h1>Find local businesses to pitch</h1>
          <p className="sub">Enter a town and state. Businesses with <b>no website</b> are your hottest leads — pitch them a brand-new site. Ones with a dated site are redesign candidates.</p>
          <form className="row" onSubmit={search}>
            <input placeholder="Town / city (e.g. Scranton)" value={city} onChange={(e) => setCity(e.target.value)} />
            <input placeholder="State (e.g. PA)" value={stateAbbr} onChange={(e) => setStateAbbr(e.target.value)} style={{ maxWidth: 140 }} />
            <button className="primary" disabled={leadLoading}>{leadLoading ? "Searching…" : "Find businesses"}</button>
          </form>
          {leadErr && <p className="err">{leadErr}</p>}
          {leadLoading && <p className="muted">Querying OpenStreetMap… this can take a few seconds.</p>}

          {leads && (
            <>
              <div className="bar">
                <span className="muted">{leads.length} businesses in <b>{area.split(",").slice(0, 2).join(",")}</b> · <b style={{ color: "#f97316" }}>{hot} with no website</b></span>
                <div className="chips">
                  <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
                  <button className={filter === "none" ? "on" : ""} onClick={() => setFilter("none")}>🔥 No website</button>
                  <button className={filter === "has" ? "on" : ""} onClick={() => setFilter("has")}>Has website</button>
                </div>
              </div>
              <div className="leads">
                {shown.map((l, i) => (
                  <div className="lead" key={i}>
                    <div className="lead-main">
                      <div className="lead-name">{l.name} {!l.website && <span className="hot">HOT LEAD</span>}</div>
                      <div className="lead-meta">{l.category}{l.address ? ` · ${l.address}` : ""}{l.phone ? ` · ${l.phone}` : ""}</div>
                    </div>
                    {l.website
                      ? <button className="mini" onClick={() => generate(l.website)}>Redesign ↗</button>
                      : <button className="mini warn" onClick={() => pitchNew(l)}>Pitch new site ✎</button>}
                  </div>
                ))}
                {shown.length === 0 && <p className="muted">No businesses match this filter.</p>}
              </div>
            </>
          )}
        </section>
      )}

      {tab === "redesign" && (
        <section className="panel">
          <h1>Redesign a site</h1>
          <form className="row" onSubmit={(e) => { e.preventDefault(); generate(); }}>
            <input placeholder="Paste a business website (e.g. joespizza.com)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <button className="primary" disabled={scrapeLoading}>{scrapeLoading ? "Building…" : "Generate redesign"}</button>
          </form>
          {scrapeErr && <p className="err">{scrapeErr}</p>}
          {scrapeLoading && <p className="muted">Fetching the site and rebuilding it…</p>}

          {data && (
            <>
              {!data.fetchedOk && <p className="err">Heads up: {data.note || "couldn't fully read the site"} — the redesign below uses whatever was found.</p>}
              <div className="viewbar">
                <div className="seg">
                  <button className={view === "after" ? "on" : ""} onClick={() => setView("after")}>✨ After (new)</button>
                  <button className={view === "before" ? "on" : ""} onClick={() => setView("before")}>Before (original)</button>
                </div>
                <div className="vb-right">
                  <span className="muted">{data.name} · {data.domain}</span>
                  <button className="mini" onClick={() => { setOBiz(data.name); setONoSite(false); setTab("outreach"); }}>Write outreach →</button>
                </div>
              </div>
              <div className="frame">
                <div className="chrome"><span /><span /><span /><div className="addr">{view === "after" ? "your-new-site.com" : data.domain}</div></div>
                <div className="screen">
                  {view === "after"
                    ? <Redesign d={data} />
                    : <iframe src={data.url} title="original" sandbox="allow-same-origin allow-scripts" />}
                </div>
              </div>
              {view === "before" && <p className="muted small">Some sites block being embedded — if the “before” is blank, that’s the original site refusing to load in a frame, not a bug.</p>}
            </>
          )}
        </section>
      )}

      {tab === "outreach" && (
        <section className="panel">
          <h1>Outreach to the owner</h1>
          <p className="sub">A ready-to-send cold email + text, personalized to the business. Fill in your details and copy.</p>
          <div className="ogrid">
            <label>Business<input value={oBiz} onChange={(e) => setOBiz(e.target.value)} placeholder="Joe's Pizza" /></label>
            <label>Your name<input value={oName} onChange={(e) => setOName(e.target.value)} placeholder="Alex" /></label>
            <label>Your phone<input value={oPhone} onChange={(e) => setOPhone(e.target.value)} placeholder="(555) 123-4567" /></label>
            <label>Preview link<input value={oPreview} onChange={(e) => setOPreview(e.target.value)} placeholder="https://…" /></label>
          </div>
          <label className="toggle"><input type="checkbox" checked={oNoSite} onChange={(e) => setONoSite(e.target.checked)} /> They have no website (pitch a brand-new site)</label>

          <div className="mail">
            <div className="mail-head"><b>Subject</b><button className="mini" onClick={() => copy("subject", mail.subject)}>{copied === "subject" ? "Copied!" : "Copy"}</button></div>
            <div className="mail-body subj">{mail.subject}</div>
            <div className="mail-head"><b>Email</b><button className="mini" onClick={() => copy("email", mail.email)}>{copied === "email" ? "Copied!" : "Copy"}</button></div>
            <pre className="mail-body">{mail.email}</pre>
            <div className="mail-head"><b>Text message</b><button className="mini" onClick={() => copy("sms", mail.sms)}>{copied === "sms" ? "Copied!" : "Copy"}</button></div>
            <pre className="mail-body">{mail.sms}</pre>
          </div>
        </section>
      )}

      <style>{appCss}</style>
    </main>
  );
}

const appCss = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0}
.app{min-height:100vh;background:#0b0f17;color:#e6edf6;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
.top{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid #1b2433;position:sticky;top:0;background:#0b0f17;z-index:10}
.logo{font-weight:700;letter-spacing:-.01em}.logo b{color:#4f9dff}
.tabs{display:flex;gap:6px}
.tabs button{background:transparent;border:1px solid #1b2433;color:#9fb0c3;padding:8px 14px;border-radius:8px;font-weight:600;cursor:pointer;font-size:14px}
.tabs button.on{background:#13203a;color:#fff;border-color:#2f4a7a}
.panel{max-width:960px;margin:0 auto;padding:34px 22px}
h1{font-size:28px;letter-spacing:-.02em;margin:0 0 8px}
.sub{color:#9fb0c3;margin:0 0 22px;max-width:640px;line-height:1.55}
.row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
input{flex:1;min-width:180px;background:#0e1420;border:1px solid #243149;color:#e6edf6;border-radius:9px;padding:11px 13px;font-size:15px}
input::placeholder{color:#5e708a}
button.primary{background:#2f6df6;color:#fff;border:0;border-radius:9px;padding:11px 20px;font-weight:700;cursor:pointer;font-size:15px}
button.primary:disabled{opacity:.6}
.err{color:#ff7a7a;font-size:14px}
.muted{color:#8698ad;font-size:14px}.small{font-size:12px}
.bar{display:flex;align-items:center;justify-content:space-between;margin:20px 0 12px;flex-wrap:wrap;gap:10px}
.chips{display:flex;gap:6px}
.chips button{background:#0e1420;border:1px solid #243149;color:#9fb0c3;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer}
.chips button.on{background:#13203a;color:#fff;border-color:#2f4a7a}
.leads{display:grid;gap:8px}
.lead{display:flex;align-items:center;justify-content:space-between;gap:14px;background:#0e1420;border:1px solid #1b2433;border-radius:11px;padding:13px 16px}
.lead-name{font-weight:600}
.hot{background:#f97316;color:#1a0f00;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;margin-left:8px;vertical-align:middle}
.lead-meta{color:#7f92a8;font-size:13px;margin-top:3px}
.mini{background:#1a2b4d;color:#bcd4ff;border:1px solid #2f4a7a;border-radius:8px;padding:8px 13px;font-weight:600;cursor:pointer;font-size:13px;white-space:nowrap}
.mini.warn{background:#3a2a12;color:#f0bd7f;border-color:#6a4a1f}
.viewbar{display:flex;align-items:center;justify-content:space-between;margin:18px 0 12px;flex-wrap:wrap;gap:10px}
.vb-right{display:flex;align-items:center;gap:12px}
.seg{display:flex;background:#0e1420;border:1px solid #243149;border-radius:9px;overflow:hidden}
.seg button{background:transparent;border:0;color:#9fb0c3;padding:9px 16px;font-weight:600;cursor:pointer;font-size:14px}
.seg button.on{background:#2f6df6;color:#fff}
.frame{border:1px solid #243149;border-radius:14px;overflow:hidden;background:#fff}
.chrome{display:flex;align-items:center;gap:7px;background:#e9edf3;padding:10px 14px;border-bottom:1px solid #d7dde6}
.chrome>span{width:11px;height:11px;border-radius:50%;background:#c3cbd6}
.chrome .addr{margin-left:12px;background:#fff;border-radius:6px;padding:4px 12px;font-size:12px;color:#5b6675;flex:1;max-width:340px}
.screen{height:72vh;overflow:auto;background:#fff}
.screen iframe{width:100%;height:100%;border:0}
.ogrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.ogrid label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#9fb0c3;font-weight:600}
.toggle{display:flex;align-items:center;gap:8px;color:#cdd8e5;font-size:14px;margin-bottom:18px;cursor:pointer}
.toggle input{flex:none;width:auto;min-width:0}
.mail{display:grid;gap:8px}
.mail-head{display:flex;align-items:center;justify-content:space-between;margin-top:8px;color:#8698ad;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.mail-body{background:#0e1420;border:1px solid #1b2433;border-radius:10px;padding:14px 16px;white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.55;color:#dbe5f0;margin:0}
.mail-body.subj{font-weight:600}
@media(max-width:720px){.ogrid{grid-template-columns:1fr}.tabs button{padding:7px 9px;font-size:12px}}
`;
