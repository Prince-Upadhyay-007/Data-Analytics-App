import { Activity, LogOut, Menu, RefreshCw, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const RANGES = [
  { id: "7", label: "7d" },
  { id: "30", label: "30d" },
  { id: "90", label: "90d" },
  { id: "all", label: "All" },
];

export default function Navbar({
  searchTerm,
  onSearchChange,
  range,
  onRangeChange,
  onRefresh,
  loading,
  onMenuToggle,
}) {
  const { user, logout } = useAuth();
  const initials = (user?.name || "DP")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-4 lg:px-8">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-card">
            <Activity size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-white">DataPulse</h1>
            <p className="truncate text-xs text-slate-400">
              Business intelligence · live KPI analytics
            </p>
          </div>
        </div>

        <label className="relative mx-auto hidden min-w-0 flex-1 max-w-md lg:block">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search title or category..."
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500"
          />
        </label>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center rounded-full border border-white/10 bg-white/5 p-1 sm:flex">
            {RANGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onRangeChange(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  range === item.id
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">{loading ? "Syncing" : "Refresh"}</span>
          </button>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-xs font-bold text-slate-950">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-white">{user?.name}</p>
              <p className="text-[10px] text-slate-400">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full p-2 text-slate-400 hover:text-white"
              aria-label="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-4 pb-4 lg:hidden">
        <label className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search records..."
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500"
          />
        </label>
        <select
          value={range}
          onChange={(event) => onRangeChange(event.target.value)}
          className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white"
        >
          {RANGES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
