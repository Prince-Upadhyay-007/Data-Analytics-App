import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, Building2, Download, Plus, Search, ShieldCheck, Wallet } from "lucide-react";
import { loadWorkspace, money, portfolioCost, portfolioValue, preciseMoney, saveWorkspace } from "../data/demoWorkspace.js";

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-cyan-300">{eyebrow}</p><h2 className="text-3xl font-semibold tracking-tight text-white">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p></div>{action}</div>;
}
function Stat({ label, value, note, positive = true }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.045] p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p><p className={`mt-2 flex items-center gap-1 text-xs ${positive ? "text-emerald-300" : "text-rose-300"}`}>{positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {note}</p></div>;
}
function Panel({ title, subtitle, children, action }) {
  return <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]"><div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4"><div><h3 className="font-semibold text-white">{title}</h3>{subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}</div>{action}</div>{children}</section>;
}
function SearchBox({ value, onChange, placeholder = "Search..." }) { return <label className="relative block min-w-[190px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>; }
function exportCsv(filename, rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const quote = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const csv = [keys.map(quote).join(","), ...rows.map(row => keys.map(key => quote(row[key])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
function useWorkspace() {
  const [workspace, setWorkspace] = useState(() => loadWorkspace());
  const update = (next) => { setWorkspace(next); saveWorkspace(next); };
  return [workspace, update];
}

export function CompaniesPage() {
  const [workspace, update] = useWorkspace();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const emptyForm = { id: "", name: "", sector: "Technology", revenue: "0", growth: "0", margin: "0", customers: "0", target: "0" };
  const [form, setForm] = useState(emptyForm);
  const isEditing = Boolean(form.id);
  const companies = workspace.companies.filter(c => `${c.name} ${c.sector}`.toLowerCase().includes(query.toLowerCase()));
  const total = workspace.companies.reduce((sum, c) => sum + Number(c.revenue || 0), 0);
  const avgGrowth = workspace.companies.reduce((sum, c) => sum + Number(c.growth || 0), 0) / Math.max(workspace.companies.length, 1);
  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const openAdd = () => { setForm(emptyForm); setShowForm(true); };
  const openEdit = (company) => {
    setForm({ id: company.id, name: company.name || "", sector: company.sector || "Other", revenue: String(company.revenue ?? 0), growth: String(company.growth ?? 0), margin: String(company.margin ?? 0), customers: String(company.customers ?? 0), target: String(company.target ?? 0) });
    setShowForm(true);
  };
  const saveCompany = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const revenue = Math.max(0, Number(form.revenue) || 0);
    const target = Math.max(0, Number(form.target) || 0);
    const company = {
      id: form.id || `co-${Date.now()}`,
      name: form.name.trim(), sector: form.sector,
      revenue, growth: Number(form.growth) || 0,
      margin: Number(form.margin) || 0,
      customers: Math.max(0, Math.round(Number(form.customers) || 0)),
      target,
      status: target > 0 && revenue < target * 0.7 ? "Needs attention" : "On track"
    };
    const nextCompanies = isEditing
      ? workspace.companies.map(item => item.id === company.id ? company : item)
      : [...workspace.companies, company];
    update({ ...workspace, companies: nextCompanies });
    setForm(emptyForm);
    setShowForm(false);
  };
  const deleteCompany = (id) => {
    if (!window.confirm("Delete this company from your browser-saved DataPulse workspace?")) return;
    update({ ...workspace, companies: workspace.companies.filter(company => company.id !== id) });
    if (form.id === id) { setForm(emptyForm); setShowForm(false); }
  };
  const fields = [
    { key: "revenue", label: "Revenue (USD)", type: "number", min: "0", step: "0.01" },
    { key: "growth", label: "Revenue growth (%)", type: "number", step: "0.1" },
    { key: "margin", label: "Profit margin (%)", type: "number", step: "0.1", min: "0", max: "100" },
    { key: "customers", label: "Customers", type: "number", min: "0", step: "1" },
    { key: "target", label: "Revenue target (USD)", type: "number", min: "0", step: "0.01" },
  ];
  return <div className="space-y-6">
    <PageHeading eyebrow="Business intelligence" title="Company performance" description="Add or edit company revenue, growth, profit margin, customer counts and targets." action={<button className="primary-btn gap-2" onClick={showForm ? () => { setShowForm(false); setForm(emptyForm); } : openAdd}><Plus size={16}/>{showForm ? "Close form" : "Add company"}</button>}/>
    {showForm && <Panel title={isEditing ? "Edit company statistics" : "Add company and statistics"} subtitle="Values are saved in this browser's DataPulse workspace.">
      <form onSubmit={saveCompany} className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
        <label className="block text-sm text-slate-300">Company name<input className="input mt-2 w-full" value={form.name} onChange={e=>setField("name", e.target.value)} placeholder="e.g. Example Technologies" required /></label>
        <label className="block text-sm text-slate-300">Sector<select className="input mt-2 w-full" value={form.sector} onChange={e=>setField("sector", e.target.value)}><option>Technology</option><option>Retail</option><option>Healthcare</option><option>Consumer goods</option><option>Finance</option><option>Manufacturing</option><option>Energy</option><option>Other</option></select></label>
        {fields.map(field=><label key={field.key} className="block text-sm text-slate-300">{field.label}<input className="input mt-2 w-full" type={field.type} min={field.min} max={field.max} step={field.step} value={form[field.key]} onChange={e=>setField(field.key, e.target.value)} required /></label>)}
        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-3"><button className="primary-btn" type="submit">{isEditing ? "Save changes" : "Save company"}</button><button className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5" type="button" onClick={()=>{setShowForm(false);setForm(emptyForm);}}>Cancel</button></div>
      </form>
    </Panel>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Tracked companies" value={workspace.companies.length} note="In your workspace"/><Stat label="Combined revenue" value={money(total)} note="Demo reporting period"/><Stat label="Average growth" value={`${avgGrowth.toFixed(1)}%`} note="Across tracked companies" positive={avgGrowth>=0}/><Stat label="Needs attention" value={workspace.companies.filter(c=>c.status==="Needs attention").length} note="Review performance targets" positive={false}/></div>
    <Panel title="Company portfolio" subtitle="Use Edit to change the statistics; Export downloads the visible company data as CSV." action={<button className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5" onClick={()=>exportCsv("datapulse-companies.csv",companies)}><Download className="mr-2 inline" size={14}/>Export CSV</button>}>
      <div className="border-b border-white/10 p-4"><SearchBox value={query} onChange={setQuery} placeholder="Search company or sector"/></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-white/[.025] text-xs uppercase tracking-wide text-slate-500"><tr>{["Company","Sector","Revenue","Growth","Margin","Customers","Target progress","Actions"].map(x=><th key={x} className="px-5 py-3 font-medium">{x}</th>)}</tr></thead><tbody>
        {companies.map(c=><tr key={c.id} className="border-t border-white/[.07]"><td className="px-5 py-4 font-medium text-white"><div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300"><Building2 size={17}/></span>{c.name}</div></td><td className="px-5 py-4 text-slate-400">{c.sector}</td><td className="px-5 py-4 text-white">{money(c.revenue)}</td><td className={`px-5 py-4 ${c.growth>=0?"text-emerald-300":"text-rose-300"}`}>{c.growth>0?"+":""}{c.growth}%</td><td className="px-5 py-4 text-slate-300">{c.margin}%</td><td className="px-5 py-4 text-slate-300">{Number(c.customers || 0).toLocaleString()}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400" style={{width:`${Math.min(100,c.target?c.revenue/c.target*100:0)}%`}}/></div><span className="text-xs text-slate-400">{c.target?Math.round(c.revenue/c.target*100):0}%</span></div></td><td className="px-5 py-4"><div className="flex gap-2"><button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-white/5" onClick={()=>openEdit(c)}>Edit</button><button className="rounded-lg border border-rose-400/20 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/10" onClick={()=>deleteCompany(c.id)}>Delete</button></div></td></tr>)}
      </tbody></table>{!companies.length&&<p className="p-8 text-center text-sm text-slate-400">No companies match your search.</p>}</div>
    </Panel>
  </div>;
}

export function PortfoliosPage() {
  const [workspace, update] = useWorkspace();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("all");
  const [portfolioForm, setPortfolioForm] = useState(null);
  const [holdingForm, setHoldingForm] = useState(null);
  const blankPortfolio = { id: "", name: "", owner: "Personal", risk: "Moderate", cash: "0" };
  const blankHolding = { portfolioId: "", originalSymbol: "", symbol: "", name: "", shares: "1", price: "0", cost: "0", sector: "Technology" };
  const portfolios = workspace.portfolios;
  const value = portfolios.reduce((sum, portfolio) => sum + portfolioValue(portfolio), 0);
  const cost = portfolios.reduce((sum, portfolio) => sum + portfolioCost(portfolio), 0);
  const pnl = value - cost;
  const holdings = portfolios.flatMap(portfolio => portfolio.holdings.map(holding => ({
    ...holding, portfolio: portfolio.name, portfolioId: portfolio.id,
    marketValue: holding.shares * holding.price,
    pnl: (holding.price - holding.cost) * holding.shares,
  }))).filter(holding => (selected === "all" || holding.portfolioId === selected) && `${holding.symbol} ${holding.name} ${holding.portfolio}`.toLowerCase().includes(query.toLowerCase()));

  const savePortfolio = (event) => {
    event.preventDefault();
    if (!portfolioForm?.name.trim()) return;
    const entry = { id: portfolioForm.id || `pf-${Date.now()}`, name: portfolioForm.name.trim(), owner: portfolioForm.owner.trim() || "Personal", risk: portfolioForm.risk, cash: Math.max(0, Number(portfolioForm.cash) || 0), holdings: portfolioForm.id ? (portfolios.find(p => p.id === portfolioForm.id)?.holdings || []) : [] };
    update({ ...workspace, portfolios: portfolioForm.id ? portfolios.map(p => p.id === entry.id ? entry : p) : [...portfolios, entry] });
    setPortfolioForm(null);
    if (selected !== "all" && !portfolioForm.id) setSelected("all");
  };
  const saveHolding = (event) => {
    event.preventDefault();
    if (!holdingForm?.symbol.trim() || !holdingForm?.name.trim()) return;
    const nextHolding = { symbol: holdingForm.symbol.trim().toUpperCase(), name: holdingForm.name.trim(), shares: Math.max(0, Number(holdingForm.shares) || 0), price: Math.max(0, Number(holdingForm.price) || 0), cost: Math.max(0, Number(holdingForm.cost) || 0), sector: holdingForm.sector };
    const nextPortfolios = portfolios.map(portfolio => {
      if (portfolio.id !== holdingForm.portfolioId) return portfolio;
      const exists = holdingForm.originalSymbol && portfolio.holdings.some(h => h.symbol === holdingForm.originalSymbol);
      const nextHoldings = exists
        ? portfolio.holdings.map(h => h.symbol === holdingForm.originalSymbol ? nextHolding : h)
        : [...portfolio.holdings, nextHolding];
      return { ...portfolio, holdings: nextHoldings };
    });
    update({ ...workspace, portfolios: nextPortfolios });
    setHoldingForm(null);
  };
  const deleteHolding = (portfolioId, symbol) => {
    if (!window.confirm(`Remove ${symbol} from this portfolio?`)) return;
    update({ ...workspace, portfolios: portfolios.map(p => p.id === portfolioId ? { ...p, holdings: p.holdings.filter(h => h.symbol !== symbol) } : p) });
  };
  const deletePortfolio = (portfolioId) => {
    if (!window.confirm("Delete this portfolio and its holdings from this browser's saved workspace?")) return;
    update({ ...workspace, portfolios: portfolios.filter(p => p.id !== portfolioId) });
    if (selected === portfolioId) setSelected("all");
  };

  return <div className="space-y-6">
    <PageHeading eyebrow="Investment workspace" title="Portfolio manager" description="Add and edit portfolios and holdings, including share counts, current prices and cost basis. Prices are illustrative demo values, not live quotes." action={<div className="flex flex-wrap gap-2"><button className="primary-btn gap-2" onClick={() => { setPortfolioForm({ ...blankPortfolio }); setHoldingForm(null); }}><Plus size={15}/>Add portfolio</button><button className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5" onClick={() => exportCsv("datapulse-holdings.csv", holdings)}><Download className="mr-2 inline" size={15}/>Export holdings</button></div>}/>
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[.05] p-4 text-sm text-cyan-100">Analysts can create, edit, and remove portfolio records and holdings. Changes are saved in this browser's DataPulse workspace.</div>

    {portfolioForm && <Panel title={portfolioForm.id ? "Edit portfolio" : "Add portfolio"} subtitle="Portfolio details"><form onSubmit={savePortfolio} className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4"><label className="block text-sm text-slate-300">Portfolio name<input className="input mt-2 w-full" required value={portfolioForm.name} onChange={e => setPortfolioForm({ ...portfolioForm, name: e.target.value })} placeholder="e.g. Long-term growth"/></label><label className="block text-sm text-slate-300">Owner / label<input className="input mt-2 w-full" value={portfolioForm.owner} onChange={e => setPortfolioForm({ ...portfolioForm, owner: e.target.value })} placeholder="Personal"/></label><label className="block text-sm text-slate-300">Risk profile<select className="input mt-2 w-full" value={portfolioForm.risk} onChange={e => setPortfolioForm({ ...portfolioForm, risk: e.target.value })}><option>Conservative</option><option>Moderate</option><option>Aggressive</option></select></label><label className="block text-sm text-slate-300">Cash balance (USD)<input className="input mt-2 w-full" type="number" min="0" step="0.01" value={portfolioForm.cash} onChange={e => setPortfolioForm({ ...portfolioForm, cash: e.target.value })}/></label><div className="flex gap-2 sm:col-span-2 xl:col-span-4"><button className="primary-btn" type="submit">Save portfolio</button><button className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300" type="button" onClick={() => setPortfolioForm(null)}>Cancel</button></div></form></Panel>}

    {holdingForm && <Panel title={holdingForm.originalSymbol ? "Edit holding" : "Add holding"} subtitle="Enter illustrative prices or your own figures"><form onSubmit={saveHolding} className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3"><label className="block text-sm text-slate-300">Portfolio<select className="input mt-2 w-full" required value={holdingForm.portfolioId} onChange={e => setHoldingForm({ ...holdingForm, portfolioId: e.target.value })}>{portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="block text-sm text-slate-300">Ticker / symbol<input className="input mt-2 w-full" required value={holdingForm.symbol} onChange={e => setHoldingForm({ ...holdingForm, symbol: e.target.value })} placeholder="e.g. AAPL"/></label><label className="block text-sm text-slate-300">Asset name<input className="input mt-2 w-full" required value={holdingForm.name} onChange={e => setHoldingForm({ ...holdingForm, name: e.target.value })} placeholder="Company or fund name"/></label><label className="block text-sm text-slate-300">Shares / units<input className="input mt-2 w-full" type="number" min="0" step="0.0001" required value={holdingForm.shares} onChange={e => setHoldingForm({ ...holdingForm, shares: e.target.value })}/></label><label className="block text-sm text-slate-300">Current price (USD)<input className="input mt-2 w-full" type="number" min="0" step="0.01" required value={holdingForm.price} onChange={e => setHoldingForm({ ...holdingForm, price: e.target.value })}/></label><label className="block text-sm text-slate-300">Purchase price / cost (USD)<input className="input mt-2 w-full" type="number" min="0" step="0.01" required value={holdingForm.cost} onChange={e => setHoldingForm({ ...holdingForm, cost: e.target.value })}/></label><label className="block text-sm text-slate-300">Sector<select className="input mt-2 w-full" value={holdingForm.sector} onChange={e => setHoldingForm({ ...holdingForm, sector: e.target.value })}><option>Technology</option><option>Semiconductors</option><option>Healthcare</option><option>Consumer staples</option><option>Consumer goods</option><option>ETF</option><option>Bonds</option><option>Finance</option><option>Energy</option><option>Other</option></select></label><div className="flex gap-2 sm:col-span-2 xl:col-span-3"><button className="primary-btn" type="submit">Save holding</button><button className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300" type="button" onClick={() => setHoldingForm(null)}>Cancel</button></div></form></Panel>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Total portfolio value" value={money(value)} note="Including cash balances"/><Stat label="Invested cost basis" value={money(cost)} note="Sample purchase cost"/><Stat label="Unrealized P/L" value={`${pnl >= 0 ? "+" : "−"}${money(Math.abs(pnl))}`} note={`${cost ? ((pnl / cost) * 100).toFixed(2) : "0.00"}% versus cost basis`} positive={pnl >= 0}/><Stat label="Portfolios" value={portfolios.length} note="Editable portfolios"/></div>

    <div className="grid gap-4 xl:grid-cols-2">{portfolios.map(portfolio => { const v = portfolioValue(portfolio); return <div key={portfolio.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-400/10 p-3 text-violet-300"><Wallet size={20}/></span><div><h3 className="font-semibold text-white">{portfolio.name}</h3><p className="mt-1 text-xs text-slate-400">{portfolio.owner} · {portfolio.risk} risk</p></div></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-300">{portfolio.holdings.length} holdings</span></div><p className="mt-6 text-3xl font-semibold text-white">{money(v)}</p><p className="mt-1 text-sm text-slate-400">{money(portfolio.cash)} cash included</p><div className="mt-4 flex flex-wrap gap-2"><button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-white/5" onClick={() => { setPortfolioForm({ id: portfolio.id, name: portfolio.name, owner: portfolio.owner || "Personal", risk: portfolio.risk || "Moderate", cash: String(portfolio.cash ?? 0) }); setHoldingForm(null); }}>Edit portfolio</button><button className="rounded-lg border border-cyan-400/20 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-400/10" onClick={() => { setHoldingForm({ ...blankHolding, portfolioId: portfolio.id }); setPortfolioForm(null); }}>Add holding</button><button className="rounded-lg border border-rose-400/20 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/10" onClick={() => deletePortfolio(portfolio.id)}>Delete portfolio</button></div><div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/10">{portfolio.holdings.map((holding, index) => <div key={`${holding.symbol}-${index}`} className="h-full" style={{ width: `${v ? holding.shares * holding.price / v * 100 : 0}%`, background: ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#fb7185"][index % 5] }}/>)}</div></div>; })}</div>

    <Panel title="Holdings" subtitle="Use Edit to change the symbol, quantity, prices, or sector."><div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row"><SearchBox value={query} onChange={setQuery} placeholder="Search portfolio or holding"/><select className="input sm:max-w-[220px]" value={selected} onChange={e => setSelected(e.target.value)}><option value="all">All portfolios</option>{portfolios.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-white/[.025] text-xs uppercase text-slate-500"><tr>{["Asset","Portfolio","Shares","Price","Market value","Unrealized P/L","Actions"].map(label => <th key={label} className="px-5 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{holdings.map(holding => <tr key={`${holding.portfolioId}-${holding.symbol}`} className="border-t border-white/[.07]"><td className="px-5 py-4"><p className="font-semibold text-white">{holding.symbol}</p><p className="mt-1 text-xs text-slate-500">{holding.name}</p></td><td className="px-5 py-4 text-slate-400">{holding.portfolio}</td><td className="px-5 py-4 text-slate-300">{holding.shares}</td><td className="px-5 py-4 text-slate-300">{preciseMoney(holding.price)}</td><td className="px-5 py-4 font-medium text-white">{money(holding.marketValue)}</td><td className={`px-5 py-4 ${holding.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{holding.pnl >= 0 ? "+" : "−"}{money(Math.abs(holding.pnl))}</td><td className="px-5 py-4"><div className="flex gap-2"><button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-white/5" onClick={() => { setHoldingForm({ portfolioId: holding.portfolioId, originalSymbol: holding.symbol, symbol: holding.symbol, name: holding.name, shares: String(holding.shares), price: String(holding.price), cost: String(holding.cost), sector: holding.sector || "Other" }); setPortfolioForm(null); }}>Edit</button><button className="rounded-lg border border-rose-400/20 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-400/10" onClick={() => deleteHolding(holding.portfolioId, holding.symbol)}>Delete</button></div></td></tr>)}</tbody></table>{!holdings.length && <p className="p-8 text-center text-sm text-slate-400">No holdings match your search.</p>}</div></Panel>
  </div>;
}

export function PerformancePage() {
  const [workspace] = useWorkspace();
  const rows = useMemo(()=>workspace.portfolios.flatMap(p=>p.holdings.map(h=>({...h,portfolio:p.name,marketValue:h.shares*h.price,costValue:h.shares*h.cost,change:(h.price-h.cost)*h.shares}))),[workspace]);
  const bySector=Object.values(rows.reduce((acc,h)=>{const key=h.sector;acc[key]??={sector:key,value:0,cost:0};acc[key].value+=h.marketValue;acc[key].cost+=h.costValue;return acc;},{})).sort((a,b)=>b.value-a.value);
  const total=rows.reduce((s,h)=>s+h.marketValue,0), totalCost=rows.reduce((s,h)=>s+h.costValue,0);
  return <div className="space-y-6"><PageHeading eyebrow="Analysis" title="Performance & allocation" description="Compare holdings by sector and review returns against sample cost basis. This view uses demo data, not real-time market feeds."/><div className="grid gap-4 sm:grid-cols-3"><Stat label="Invested market value" value={money(total)} note="Across all demo holdings"/><Stat label="Cost basis" value={money(totalCost)} note="Illustrative purchase values"/><Stat label="Total return" value={`${totalCost?((total-totalCost)/totalCost*100).toFixed(2):"0.00"}%`} note={`${money(total-totalCost)} unrealized`} positive={total>=totalCost}/></div><Panel title="Sector allocation" subtitle="Share of total invested market value"><div className="space-y-5 p-5">{bySector.map(s=><div key={s.sector}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="text-slate-200">{s.sector}</span><span className="text-slate-400">{money(s.value)} · {total?(s.value/total*100).toFixed(1):0}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{width:`${total?s.value/total*100:0}%`}}/></div></div>)}</div></Panel><Panel title="Holding performance" subtitle="Sorted by market value"><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-white/[.025] text-xs uppercase text-slate-500"><tr>{["Symbol","Sector","Cost basis","Market value","Return"].map(x=><th key={x} className="px-5 py-3 font-medium">{x}</th>)}</tr></thead><tbody>{[...rows].sort((a,b)=>b.marketValue-a.marketValue).map(h=><tr key={`${h.portfolio}-${h.symbol}`} className="border-t border-white/[.07]"><td className="px-5 py-4 font-semibold text-white">{h.symbol}</td><td className="px-5 py-4 text-slate-400">{h.sector}</td><td className="px-5 py-4 text-slate-300">{money(h.costValue)}</td><td className="px-5 py-4 text-white">{money(h.marketValue)}</td><td className={`px-5 py-4 ${h.change>=0?"text-emerald-300":"text-rose-300"}`}>{h.change>=0?"+":"−"}{money(Math.abs(h.change))}</td></tr>)}</tbody></table></div></Panel></div>;
}

export function ReportsPage() {
  const [workspace] = useWorkspace(); const companyRevenue=workspace.companies.reduce((s,c)=>s+c.revenue,0); const portfolio=workspace.portfolios.reduce((s,p)=>s+portfolioValue(p),0); const allHoldings=workspace.portfolios.flatMap(p=>p.holdings.map(h=>({portfolio:p.name,symbol:h.symbol,name:h.name,shares:h.shares,price:h.price,marketValue:h.shares*h.price,costBasis:h.shares*h.cost,sector:h.sector})));
  return <div className="space-y-6"><PageHeading eyebrow="Exports & insights" title="Reports center" description="Export your demo company KPI and portfolio data as CSV files for spreadsheets, presentations and further analysis."/><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><span className="inline-flex rounded-xl bg-cyan-400/10 p-3 text-cyan-300"><Building2 size={22}/></span><h3 className="mt-5 text-lg font-semibold text-white">Business KPI report</h3><p className="mt-2 text-sm leading-6 text-slate-400">Company revenue, growth, margins, customer counts, targets and status.</p><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><div><p className="text-sm font-medium text-white">{workspace.companies.length} companies</p><p className="mt-1 text-xs text-slate-500">{money(companyRevenue)} combined revenue</p></div><button className="primary-btn gap-2" onClick={()=>exportCsv("datapulse-business-kpis.csv",workspace.companies)}><Download size={15}/> Export CSV</button></div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><span className="inline-flex rounded-xl bg-violet-400/10 p-3 text-violet-300"><BriefcaseBusiness size={22}/></span><h3 className="mt-5 text-lg font-semibold text-white">Investment holdings report</h3><p className="mt-2 text-sm leading-6 text-slate-400">Holdings, sectors, share counts, illustrative prices, market value and cost basis.</p><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><div><p className="text-sm font-medium text-white">{allHoldings.length} holdings</p><p className="mt-1 text-xs text-slate-500">{money(portfolio)} portfolio value incl. cash</p></div><button className="primary-btn gap-2" onClick={()=>exportCsv("datapulse-investment-holdings.csv",allHoldings)}><Download size={15}/> Export CSV</button></div></div></div><Panel title="Workspace notes" subtitle="Data transparency and safe usage"><div className="grid gap-4 p-5 sm:grid-cols-2"><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-300" size={19}/><div><p className="text-sm font-medium text-white">Existing analytics preserved</p><p className="mt-1 text-xs leading-5 text-slate-400">The backend startup seed now leaves existing analytics records untouched.</p></div></div><div className="flex gap-3"><Wallet className="mt-0.5 shrink-0 text-cyan-300" size={19}/><div><p className="text-sm font-medium text-white">Demo workspace</p><p className="mt-1 text-xs leading-5 text-slate-400">Company and investment samples are stored in this browser only. They do not alter MongoDB and prices are not live market quotes.</p></div></div></div></Panel></div>;
}
