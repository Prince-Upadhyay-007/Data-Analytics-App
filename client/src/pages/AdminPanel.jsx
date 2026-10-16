import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { CalendarDays, Search, ShieldCheck, Users, UserRound, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/admin/users");
        if (!cancelled) setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.status === 403
            ? "Your account is not authorized to view this page."
            : err.response?.status === 401
              ? "Your session expired. Please log in again."
              : "Could not load registered users. Check that the backend is running.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (isAdmin) loadUsers();
    return () => { cancelled = true; };
  }, [isAdmin, reload]);

  const filteredUsers = useMemo(() => users.filter((item) => {
    const text = `${item.name || ""} ${item.email || ""} ${item.role || ""}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (roleFilter === "all" || item.role === roleFilter);
  }), [users, query, roleFilter]);
  const adminCount = users.filter((item) => item.role === "Admin").length;
  const analystCount = users.filter((item) => item.role === "Analyst").length;

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-cyan-300">Administration</p><h2 className="text-3xl font-semibold tracking-tight text-white">Admin panel</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Review registered accounts, assigned roles, and registration dates.</p></div>
      <button className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5" onClick={() => setReload((value) => value + 1)} disabled={loading}><RefreshCw size={15} className="mr-2 inline"/>Refresh users</button>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/[.045] p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-400">Registered users</p><Users size={19} className="text-cyan-300"/></div><p className="mt-3 text-3xl font-semibold text-white">{loading ? "…" : users.length}</p><p className="mt-2 text-xs text-slate-500">All accounts in MongoDB</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.045] p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-400">Admins</p><ShieldCheck size={19} className="text-violet-300"/></div><p className="mt-3 text-3xl font-semibold text-white">{loading ? "…" : adminCount}</p><p className="mt-2 text-xs text-slate-500">Accounts with Admin role</p></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.045] p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-400">Analysts</p><UserRound size={19} className="text-emerald-300"/></div><p className="mt-3 text-3xl font-semibold text-white">{loading ? "…" : analystCount}</p><p className="mt-2 text-xs text-slate-500">Accounts with Analyst role</p></div>
    </div>

    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.035]"><div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-white">Registered accounts</h3><p className="mt-1 text-xs text-slate-400">{filteredUsers.length} shown · sorted newest first</p></div><div className="flex flex-col gap-3 sm:flex-row"><label className="relative block min-w-[220px]"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email"/></label><select className="input sm:max-w-[160px]" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">All roles</option><option value="Admin">Admin</option><option value="Analyst">Analyst</option></select></div></div>
      {error && <div role="alert" className="m-4 flex gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"><AlertCircle size={17} className="shrink-0"/>{error}</div>}
      {loading ? <div className="p-8 text-center text-sm text-slate-400">Loading registered users…</div> : !error && filteredUsers.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No users match your search.</div> : !error && <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-white/[.025] text-xs uppercase tracking-wide text-slate-500"><tr>{["User", "Role", "Registered"].map((label) => <th key={label} className="px-5 py-3 font-medium">{label}</th>)}</tr></thead><tbody>{filteredUsers.map((item) => <tr key={item.id} className="border-t border-white/[.07]"><td className="px-5 py-4"><p className="font-medium text-white">{item.name}</p><p className="mt-1 text-xs text-slate-400">{item.email}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${item.role === "Admin" ? "bg-violet-400/10 text-violet-200" : "bg-cyan-400/10 text-cyan-200"}`}>{item.role}</span></td><td className="px-5 py-4 text-slate-400"><CalendarDays size={14} className="mr-2 inline"/>{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
