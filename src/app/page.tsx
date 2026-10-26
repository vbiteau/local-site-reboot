"use client";
import { useEffect, useState } from "react";
import Redesign from "@/components/Redesign";
import RedesignBold from "@/components/RedesignBold";
import RedesignTrade from "@/components/RedesignTrade";
import RedesignElegant from "@/components/RedesignElegant";
import RedesignFriendly from "@/components/RedesignFriendly";
import { buildOutreach } from "@/lib/outreach";
import type { BusinessData, Lead, LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = ["new", "contacted", "interested", "won", "dead"];
const leadId = (l: Lead) => (l.name + "|" + (l.address || "")).toLowerCase();

export default function Home() {
  const [tab, setTab] = useState<"leads" | "pipeline" | "redesign" | "outreach">("leads");

  // lead finder
  const [city, setCity] = useState("");
  const [stateAbbr, setStateAbbr] = useState("");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [area, setArea] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadErr, setLeadErr] = useState("");
  const [filter, setFilter] = useState<"all" | "none" | "has">("all");
  const [catFilter, setCatFilter] = useState("all");
  const [sort, setSort] = useState<"hot" | "az" | "cat">("hot");
  // dedupe across searches: leadId -> the area it was first found in
  const [seen, setSeen] = useState<Record<string, string>>({});
  const [seenElsewhere, setSeenElsewhere] = useState<Record<string, string>>({});
  const [hideDupes, setHideDupes] = useState(false);
  useEffect(() => { try { const s = localStorage.getItem("lsr-seen"); if (s) setSeen(JSON.parse(s)); } catch {} }, []);

  // lead pipeline (persisted) — stores the full lead so it survives across town searches
  type Saved = { lead: Lead; status: LeadStatus; notes: string };
  const [saved, setSaved] = useState<Record<string, Saved>>({});
  useEffect(() => { try { const s = localStorage.getItem("lsr-leads"); if (s) setSaved(JSON.parse(s)); } catch {} }, []);
  function persistSaved(next: Record<string, Saved>) { try { localStorage.setItem("lsr-leads", JSON.stringify(next)); } catch {} return next; }
  function setLead(lead: Lead, patch: Partial<{ status: LeadStatus; notes: string }>) {
    const id = leadId(lead);
    setSaved((prev) => {
      const cur = prev[id] || { lead, status: "new" as LeadStatus, notes: "" };
      return persistSaved({ ...prev, [id]: { ...cur, lead, ...patch } });
    });
  }
  function removeLead(id: string) { setSaved((prev) => { const n = { ...prev }; delete n[id]; return persistSaved(n); }); }

  // redesign
  const [url, setUrl] = useState("");
  const [data, setData] = useState<BusinessData | null>(null);
  const [edits, setEdits] = useState<Partial<BusinessData>>({});
  const [editing, setEditing] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeErr, setScrapeErr] = useState("");
  const [view, setView] = useState<"after" | "before">("after");
  const [template, setTemplate] = useState<"clean" | "bold" | "trade" | "elegant" | "friendly">("clean");
  const [beforeMode, setBeforeMode] = useState<"shot" | "live">("shot");
  const [shotKey, setShotKey] = useState(0);

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
      // record which of these were already found in a *different* town search
      const here = String(j.area).split(",").slice(0, 2).join(",").trim();
      const elsewhere: Record<string, string> = {};
      const next = { ...seen };
      for (const l of j.leads as Lead[]) {
        const id = leadId(l);
        if (next[id] && next[id] !== here) elsewhere[id] = next[id];
        else if (!next[id]) next[id] = here;
      }
      setSeenElsewhere(elsewhere); setSeen(next);
      try { localStorage.setItem("lsr-seen", JSON.stringify(next)); } catch {}
    } catch (e) { setLeadErr(e instanceof Error ? e.message : "Search failed"); }
    finally { setLeadLoading(false); }
  }

  async function generate(target?: string) {
    const u = (target ?? url).trim();
    if (!u) return;
    setUrl(u); setTab("redesign"); setScrapeLoading(true); setScrapeErr(""); setData(null); setEdits({}); setEditing(false); setView("after");
    try {
      const r = await fetch(`/api/scrape?url=${encodeURIComponent(u)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Scrape failed");
      setData(j); setOBiz(j.name); setONoSite(false);
    } catch (e) { setScrapeErr(e instanceof Error ? e.message : "Scrape failed"); }
    finally { setScrapeLoading(false); }
  }

  function pitchNew(l: Lead) { setOBiz(l.name); setONoSite(true); setOPreview(""); setTab("outreach"); }
  function copy(label: string, txt: string) {
    navigator.clipboard?.writeText(txt).then(() => { setCopied(label); setTimeout(() => setCopied(""), 1500); });
  }

  // merged data for the preview (edits override the scrape)
  const d: BusinessData | null = data ? {
    ...data,
    name: edits.name ?? data.name,
    tagline: edits.tagline ?? data.tagline,
    color: edits.color ?? data.color,
    description: edits.description ?? data.description,
    services: edits.services ?? data.services,
  } : null;

  function downloadHtml() {
    const node = document.querySelector(".rd");
    if (!node || !d) return;
    const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(d.name)}</title></head><body style="margin:0">${node.outerHTML}</body></html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(d.domain || "site").replace(/[^a-z0-9.-]/gi, "_")}-redesign.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function downloadCsv(rows: (string | undefined)[][], filename: string) {
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function exportCsv() {
    if (!leads) return;
    const rows = [["name", "category", "website", "phone", "address", "status", "notes"]];
    for (const l of leads) { const s = saved[leadId(l)]; rows.push([l.name, l.category, l.website || "", l.phone || "", l.address || "", s?.status || "new", s?.notes || ""]); }
    downloadCsv(rows, `leads-${(area.split(",")[0] || "export").trim().replace(/\s+/g, "-").toLowerCase()}.csv`);
  }
  function exportPipelineCsv() {
    const rows = [["name", "category", "website", "phone", "address", "status", "notes"]];
    for (const s of savedList) { const l = s.lead; rows.push([l.name, l.category, l.website || "", l.phone || "", l.address || "", s.status, s.notes]); }
    downloadCsv(rows, "my-leads-pipeline.csv");
  }

  const cats = leads ? [...new Set(leads.map((l) => l.category))].sort() : [];
  const shown = (leads ?? [])
    .filter((l) => filter === "all" ? true : filter === "none" ? !l.website : !!l.website)
    .filter((l) => catFilter === "all" || l.category === catFilter)
    .filter((l) => !hideDupes || !seenElsewhere[leadId(l)])
    .sort((a, b) =>
      sort === "az" ? a.name.localeCompare(b.name)
      : sort === "cat" ? a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
      : Number(!!a.website) - Number(!!b.website) || a.name.localeCompare(b.name));
  const hot = leads?.filter((l) => !l.website).length ?? 0;
  const savedList = Object.values(saved).filter((s) => s && s.lead).sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || a.lead.name.localeCompare(b.lead.name));
  const pipelineCount = savedList.length;
  const mail = buildOutreach({ business: oBiz, yourName: oName, yourPhone: oPhone, previewUrl: oPreview, noSite: oNoSite, signal: !oNoSite ? d?.signals?.[0] : undefined });

  return (
    <main className="app">
      <header className="top">
        <div className="logo">◧ Local Site <b>Reboot</b></div>
        <nav className="tabs">
          <button className={tab === "leads" ? "on" : ""} onClick={() => setTab("leads")}>1 · Find leads</button>
          <button className={tab === "redesign" ? "on" : ""} onClick={() => setTab("redesign")}>2 · Redesign</button>
          <button className={tab === "outreach" ? "on" : ""} onClick={() => setTab("outreach")}>3 · Outreach</button>
          <button className={tab === "pipeline" ? "on" : ""} onClick={() => setTab("pipeline")}>★ My Leads{pipelineCount ? ` (${pipelineCount})` : ""}</button>
        </nav>
      </header>

      {tab === "leads" && (
        <section className="panel">
          <h1>Find local businesses to pitch</h1>
          <p className="sub">Enter a town and state. Businesses with <b>no website</b> are your hottest leads — pitch them a brand-new site. Track each one and export your list.</p>
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
                <span className="muted">{leads.length} in <b>{area.split(",").slice(0, 2).join(",")}</b> · <b style={{ color: "#f97316" }}>{hot} no website</b></span>
                <div className="chips">
                  <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>All</button>
                  <button className={filter === "none" ? "on" : ""} onClick={() => setFilter("none")}>🔥 No website</button>
                  <button className={filter === "has" ? "on" : ""} onClick={() => setFilter("has")}>Has website</button>
                  {Object.keys(seenElsewhere).length > 0 && (
                    <button className={hideDupes ? "on" : ""} onClick={() => setHideDupes((v) => !v)} title="Hide businesses already found in another town search">
                      {hideDupes ? "Showing new only" : `Hide ${Object.keys(seenElsewhere).length} dupes`}
                    </button>
                  )}
                  <select className="sel" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                    <option value="all">All categories</option>
                    {cats.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="sel" value={sort} onChange={(e) => setSort(e.target.value as "hot" | "az" | "cat")}>
                    <option value="hot">Sort: hot first</option>
                    <option value="az">Sort: A–Z</option>
                    <option value="cat">Sort: category</option>
                  </select>
                  <button className="csv" onClick={exportCsv}>⇩ CSV</button>
                </div>
              </div>
              <div className="leads">
                {shown.map((l) => {
                  const id = leadId(l);
                  const s = saved[id] || { status: "new" as LeadStatus, notes: "" };
                  return (
                    <div className="lead" key={id}>
                      <div className="lead-row">
                        <div className="lead-main">
                          <div className="lead-name">{l.name} {!l.website && <span className="hot">HOT LEAD</span>} {saved[id] && <span className="saved" title="In your pipeline">★</span>} {seenElsewhere[id] && <span className="dupe" title="Already found in another search">↺ also in {seenElsewhere[id]}</span>}</div>
                          <div className="lead-meta">{l.category}{l.address ? ` · ${l.address}` : ""}{l.phone ? ` · ${l.phone}` : ""}</div>
                        </div>
                        <select className={`stat stat-${s.status}`} value={s.status} onChange={(e) => setLead(l, { status: e.target.value as LeadStatus })}>
                          {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                        {l.website
                          ? <button className="mini" onClick={() => { setLead(l, {}); generate(l.website); }}>Redesign ↗</button>
                          : <button className="mini warn" onClick={() => { setLead(l, {}); pitchNew(l); }}>Pitch ✎</button>}
                      </div>
                      <input className="note" placeholder="notes…" value={s.notes} onChange={(e) => setLead(l, { notes: e.target.value })} />
                    </div>
                  );
                })}
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

          {d && (
            <>
              {!data?.fetchedOk && <p className="err">Heads up: {data?.note || "couldn't fully read the site"} — the redesign below uses whatever was found.</p>}

              {d.signals.length > 0 && (
                <div className="signals">
                  <b>Why it needs a redesign</b>
                  <ul>{d.signals.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              )}

              <div className="viewbar">
                <div className="seg">
                  <button className={view === "after" ? "on" : ""} onClick={() => setView("after")}>✨ After</button>
                  <button className={view === "before" ? "on" : ""} onClick={() => setView("before")}>Before</button>
                </div>
                <div className="vb-right">
                  <div className="seg sm">
                    <button className={template === "clean" ? "on" : ""} onClick={() => setTemplate("clean")}>Clean</button>
                    <button className={template === "bold" ? "on" : ""} onClick={() => setTemplate("bold")}>Bold</button>
                    <button className={template === "trade" ? "on" : ""} onClick={() => setTemplate("trade")}>Trade</button>
                    <button className={template === "elegant" ? "on" : ""} onClick={() => setTemplate("elegant")}>Elegant</button>
                    <button className={template === "friendly" ? "on" : ""} onClick={() => setTemplate("friendly")}>Friendly</button>
                  </div>
                  <button className="mini" onClick={() => setEditing((v) => !v)}>{editing ? "Done editing" : "✎ Edit"}</button>
                  <button className="mini" onClick={downloadHtml}>⇩ Download HTML</button>
                  <button className="mini" onClick={() => { setOBiz(d.name); setONoSite(false); setTab("outreach"); }}>Outreach →</button>
                </div>
              </div>

              {editing && (
                <div className="editor">
                  <label>Name<input value={d.name} onChange={(e) => setEdits({ ...edits, name: e.target.value })} /></label>
                  <label>Tagline<input value={d.tagline || ""} onChange={(e) => setEdits({ ...edits, tagline: e.target.value })} /></label>
                  <label>Brand color<input type="color" value={/^#[0-9a-f]{6}$/i.test(d.color) ? d.color : "#2563eb"} onChange={(e) => setEdits({ ...edits, color: e.target.value })} /></label>
                  <label className="wide">Services (comma-separated)<input value={d.services.join(", ")} onChange={(e) => setEdits({ ...edits, services: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></label>
                </div>
              )}

              <div className="frame">
                <div className="chrome"><span /><span /><span /><div className="addr">{view === "after" ? "your-new-site.com" : d.domain}</div></div>
                <div className="screen">
                  {view === "after"
                    ? (template === "bold" ? <RedesignBold d={d} />
                      : template === "trade" ? <RedesignTrade d={d} />
                      : template === "elegant" ? <RedesignElegant d={d} />
                      : template === "friendly" ? <RedesignFriendly d={d} />
                      : <Redesign d={d} />)
                    : beforeMode === "shot"
                      ? <img className="shot" key={shotKey} alt={`Screenshot of ${d.domain}`}
                          src={`https://s0.wp.com/mshots/v1/${encodeURIComponent(d.url)}?w=1280&h=1600${shotKey ? `&r=${shotKey}` : ""}`} />
                      : <iframe src={d.url} title="original" sandbox="allow-same-origin allow-scripts" />}
                </div>
              </div>
              {view === "before" && (
                <div className="before-bar">
                  <div className="seg sm">
                    <button className={beforeMode === "shot" ? "on" : ""} onClick={() => setBeforeMode("shot")}>Screenshot</button>
                    <button className={beforeMode === "live" ? "on" : ""} onClick={() => setBeforeMode("live")}>Live</button>
                  </div>
                  {beforeMode === "shot"
                    ? <><span className="muted small">Screenshots are generated on first view — if you see a placeholder, give it a few seconds and refresh.</span>
                        <button className="mini" onClick={() => setShotKey(Date.now())}>↻ Refresh</button></>
                    : <span className="muted small">Live view — some sites block embedding; a blank frame means the site refused, so use Screenshot.</span>}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {tab === "outreach" && (
        <section className="panel">
          <h1>Outreach to the owner</h1>
          <p className="sub">A ready-to-send cold email + text, personalized to the business{!oNoSite && d?.signals?.[0] ? " (and the issue found on their current site)" : ""}.</p>
          <div className="ogrid">
            <label>Business<input value={oBiz} onChange={(e) => setOBiz(e.target.value)} placeholder="Joe's Pizza" /></label>
            <label>Your name<input value={oName} onChange={(e) => setOName(e.target.value)} placeholder="Alex" /></label>
            <label>Your phone<input value={oPhone} onChange={(e) => setOPhone(e.target.value)} placeholder="(555) 123-4567" /></label>
            <label>Preview link<input value={oPreview} onChange={(e) => setOPreview(e.target.value)} placeholder="https://…" /></label>
          </div>
          <label className="toggle"><input type="checkbox" checked={oNoSite} onChange={(e) => setONoSite(e.target.checked)} /> They have no website (pitch a brand-new site)</label>

          {(d?.email || d?.emailGuess) && (
            <div className="recip">
              <span>Send to</span>
              <a href={`mailto:${d.email || d.emailGuess}`}>{d.email || d.emailGuess}</a>
              {!d.email && <em>(guess — no email was published on the site)</em>}
              <button className="mini" onClick={() => copy("to", (d.email || d.emailGuess)!)}>{copied === "to" ? "Copied!" : "Copy"}</button>
              {d.emails && d.emails.length > 1 && <span className="more">+{d.emails.length - 1} more found</span>}
            </div>
          )}

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

      {tab === "pipeline" && (
        <section className="panel">
          <div className="bar" style={{ marginTop: 0 }}>
            <h1 style={{ margin: 0 }}>My leads</h1>
            {savedList.length > 0 && <button className="csv" onClick={exportPipelineCsv}>⇩ Export CSV</button>}
          </div>
          <p className="sub">Every lead you've touched, across all your searches — your working pipeline.</p>

          {savedList.length === 0 ? (
            <p className="muted">No saved leads yet. Set a status or notes on a lead (or redesign/pitch one) and it lands here.</p>
          ) : (
            <>
              <div className="pipe-summary">
                {STATUSES.map((st) => {
                  const n = savedList.filter((s) => s.status === st).length;
                  return <span key={st} className={`pill stat-${st}`}>{n} {st}</span>;
                })}
              </div>
              <div className="leads">
                {savedList.map((s) => {
                  const l = s.lead; const id = leadId(l);
                  return (
                    <div className="lead" key={id}>
                      <div className="lead-row">
                        <div className="lead-main">
                          <div className="lead-name">{l.name} {!l.website && <span className="hot">NO SITE</span>}</div>
                          <div className="lead-meta">{l.category}{l.address ? ` · ${l.address}` : ""}{l.phone ? ` · ${l.phone}` : ""}{l.website ? ` · ${l.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}` : ""}</div>
                        </div>
                        <select className={`stat stat-${s.status}`} value={s.status} onChange={(e) => setLead(l, { status: e.target.value as LeadStatus })}>
                          {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                        {l.website
                          ? <button className="mini" onClick={() => generate(l.website)}>Redesign ↗</button>
                          : <button className="mini warn" onClick={() => pitchNew(l)}>Pitch ✎</button>}
                        <button className="rm" title="Remove from pipeline" onClick={() => removeLead(id)}>✕</button>
                      </div>
                      <input className="note" placeholder="notes…" value={s.notes} onChange={(e) => setLead(l, { notes: e.target.value })} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      <style>{appCss}</style>
    </main>
  );
}

function escapeHtml(s: string) { return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string)); }

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
.sub{color:#9fb0c3;margin:0 0 22px;max-width:660px;line-height:1.55}
.row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}
input,select{background:#0e1420;border:1px solid #243149;color:#e6edf6;border-radius:9px;padding:10px 12px;font-size:15px;font-family:inherit}
.row input{flex:1;min-width:180px}
input::placeholder{color:#5e708a}
button.primary{background:#2f6df6;color:#fff;border:0;border-radius:9px;padding:11px 20px;font-weight:700;cursor:pointer;font-size:15px}
button.primary:disabled{opacity:.6}
.err{color:#ff7a7a;font-size:14px}
.muted{color:#8698ad;font-size:14px}.small{font-size:12px}
.bar{display:flex;align-items:center;justify-content:space-between;margin:20px 0 12px;flex-wrap:wrap;gap:10px}
.chips{display:flex;gap:6px}
.chips button{background:#0e1420;border:1px solid #243149;color:#9fb0c3;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;cursor:pointer}
.chips button.on{background:#13203a;color:#fff;border-color:#2f4a7a}
.chips button.csv{color:#9bd3b0;border-color:#285c3e}
.chips .sel{background:#0e1420;border:1px solid #243149;color:#9fb0c3;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:600}
.saved{color:#ffd24a;font-size:13px}
.leads{display:grid;gap:8px}
.lead{background:#0e1420;border:1px solid #1b2433;border-radius:11px;padding:11px 14px}
.lead-row{display:flex;align-items:center;gap:12px}
.lead-main{flex:1;min-width:0}
.lead-name{font-weight:600}
.hot{background:#f97316;color:#1a0f00;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;margin-left:8px;vertical-align:middle}
.lead-meta{color:#7f92a8;font-size:13px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.stat{padding:6px 8px;font-size:12px;font-weight:700;border-radius:8px;text-transform:capitalize;cursor:pointer}
.stat-new{color:#9fb0c3}.stat-contacted{color:#6fb3ff;border-color:#2f4a7a}.stat-interested{color:#f2c14e;border-color:#6a561f}
.stat-won{color:#7ee0a6;border-color:#285c3e}.stat-dead{color:#8698ad;opacity:.6}
.mini{background:#1a2b4d;color:#bcd4ff;border:1px solid #2f4a7a;border-radius:8px;padding:8px 12px;font-weight:600;cursor:pointer;font-size:13px;white-space:nowrap}
.mini.warn{background:#3a2a12;color:#f0bd7f;border-color:#6a4a1f}
.note{width:100%;margin-top:8px;background:#0b111c;border:1px dashed #243149;font-size:13px;padding:7px 10px}
.pipe-summary{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 16px}
.pill{font-size:12px;font-weight:700;padding:5px 12px;border-radius:999px;border:1px solid #243149;background:#0e1420;text-transform:capitalize}
.rm{background:transparent;border:1px solid #2a3344;color:#8698ad;border-radius:8px;padding:8px 11px;cursor:pointer;font-size:12px}
.rm:hover{color:#ff7a7a;border-color:#5a2f28}
.signals{background:#2a1512;border:1px solid #5a2f28;border-radius:11px;padding:12px 16px;margin-bottom:14px}
.signals b{color:#ff9d7a;font-size:13px;text-transform:uppercase;letter-spacing:.04em}
.signals ul{margin:8px 0 0;padding-left:18px;color:#f0c7b8;font-size:14px;line-height:1.6}
.viewbar{display:flex;align-items:center;justify-content:space-between;margin:4px 0 12px;flex-wrap:wrap;gap:10px}
.vb-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.seg{display:flex;background:#0e1420;border:1px solid #243149;border-radius:9px;overflow:hidden}
.seg button{background:transparent;border:0;color:#9fb0c3;padding:9px 16px;font-weight:600;cursor:pointer;font-size:14px}
.seg button.on{background:#2f6df6;color:#fff}
.seg.sm button{padding:7px 12px;font-size:12px}
.editor{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#0e1420;border:1px solid #1b2433;border-radius:11px;padding:14px;margin-bottom:12px}
.editor label{display:flex;flex-direction:column;gap:5px;font-size:12px;color:#9fb0c3;font-weight:600}
.editor label.wide{grid-column:1/-1}
.editor input[type=color]{height:38px;padding:3px;width:60px}
.frame{border:1px solid #243149;border-radius:14px;overflow:hidden;background:#fff}
.chrome{display:flex;align-items:center;gap:7px;background:#e9edf3;padding:10px 14px;border-bottom:1px solid #d7dde6}
.chrome>span{width:11px;height:11px;border-radius:50%;background:#c3cbd6}
.chrome .addr{margin-left:12px;background:#fff;border-radius:6px;padding:4px 12px;font-size:12px;color:#5b6675;flex:1;max-width:340px}
.screen{height:70vh;overflow:auto;background:#fff}
.screen iframe{width:100%;height:100%;border:0}
.screen .shot{display:block;width:100%;height:auto;min-height:300px;background:#f2f4f7}
.before-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:10px}
.dupe{color:#a99cf0;font-size:11px;font-weight:600;border:1px solid #3e3770;border-radius:999px;padding:1px 8px;margin-left:4px;vertical-align:middle}
.ogrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.ogrid label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#9fb0c3;font-weight:600}
.toggle{display:flex;align-items:center;gap:8px;color:#cdd8e5;font-size:14px;margin-bottom:18px;cursor:pointer}
.toggle input{width:auto}
.recip{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#0e1420;border:1px solid #1b2433;border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:14px}
.recip>span{color:#8698ad;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.recip a{color:#6fb3ff;font-weight:700}
.recip em{color:#f0a868;font-style:normal;font-size:12px}
.recip .more{color:#8698ad;font-size:12px}
.mail{display:grid;gap:8px}
.mail-head{display:flex;align-items:center;justify-content:space-between;margin-top:8px;color:#8698ad;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
.mail-body{background:#0e1420;border:1px solid #1b2433;border-radius:10px;padding:14px 16px;white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.55;color:#dbe5f0;margin:0}
.mail-body.subj{font-weight:600}
@media(max-width:720px){.ogrid,.editor{grid-template-columns:1fr}.tabs button{padding:7px 9px;font-size:12px}.lead-meta{white-space:normal}}
`;
