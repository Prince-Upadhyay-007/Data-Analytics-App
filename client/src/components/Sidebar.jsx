import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  BarChart3,
  Database,
  Building2,
  BriefcaseBusiness,
  TrendingUp,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  X,
} from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/portfolios", label: "Portfolios", icon: BriefcaseBusiness },
  { to: "/performance", label: "Performance", icon: TrendingUp },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/logs", label: "Data Logs", icon: Database },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth();
  const visibleItems = isAdmin ? [...items, { to: "/admin", label: "Admin Panel", icon: ShieldCheck }] : items;
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-slate-950 p-4 transition lg:sticky lg:top-24 lg:z-0 lg:h-[calc(100vh-8rem)] lg:w-60 lg:translate-x-0 lg:rounded-3xl lg:border lg:bg-white/5 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <p className="text-sm font-semibold text-white">Navigation</p>
          <button type="button" onClick={onClose} className="text-slate-400">
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 hidden px-3 text-[11px] uppercase tracking-[0.2em] text-slate-500 lg:block">
          Workspace
        </p>

        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-cyan-400 text-slate-950 shadow-card"
                      : "text-slate-300 hover:bg-white/10"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
