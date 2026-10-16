import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { api, dateQuery } from "../api.js";

const emptyStats = {
  totalRevenue: 0,
  totalUsers: 0,
  totalRecords: 0,
  averageRevenue: 0,
  categoryBreakdown: [],
  revenueOverTime: [],
  growth: { revenue: 0, users: 0, records: 0, averageRevenue: 0 },
};

export default function DashboardLayout() {
  const location = useLocation();
  const [range, setRange] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(emptyStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  const bump = useCallback(() => setRefreshToken((value) => value + 1), []);
  const rangeParams = useMemo(() => dateQuery(range), [range]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setStatsLoading(true);
      try {
        const { data } = await api.get("/analytics/stats", { params: rangeParams });
        if (!cancelled) {
          setStats({ ...emptyStats, ...data });
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setStats(emptyStats);
          setError(
            err.response?.status === 401
              ? "Session expired. Please log in again."
              : "Could not load analytics. Confirm the API and database are running."
          );
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    loadStats();
    return () => { cancelled = true; };
  }, [rangeParams, refreshToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      setRecordsLoading(true);
      try {
        const { data } = await api.get("/analytics", {
          params: { ...rangeParams, page: 1, limit: 100 },
        });
        if (!cancelled) setRecords(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (!cancelled) {
          setRecords([]);
          if (err.response?.status === 401) {
            setError("Session expired. Please log in again.");
          } else {
            setError("Could not load analytics records. Check the API connection.");
          }
        }
      } finally {
        if (!cancelled) setRecordsLoading(false);
      }
    }

    loadRecords();
    return () => { cancelled = true; };
  }, [rangeParams, refreshToken]);

  const addRecord = useCallback(async (record) => {
    await api.post("/analytics", record);
    bump();
  }, [bump]);

  const deleteRecord = useCallback(async (id) => {
    await api.delete(`/analytics/${id}`);
    bump();
  }, [bump]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_28%),#020617]">
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        range={range}
        onRangeChange={setRange}
        onRefresh={bump}
        loading={statsLoading || recordsLoading}
        onMenuToggle={() => setSidebarOpen((open) => !open)}
      />

      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-6 lg:px-8">
        <Sidebar
          pathname={location.pathname}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="min-w-0 flex-1 space-y-6">
          {error && (
            <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          <Outlet
            context={{
              stats,
              statsLoading,
              range,
              rangeParams,
              searchTerm,
              setSearchTerm,
              refreshToken,
              bump,
              records,
              loading: recordsLoading,
              onAdd: addRecord,
              onDelete: deleteRecord,
              globalSearch: searchTerm,
            }}
          />
        </main>
      </div>
    </div>
  );
}
