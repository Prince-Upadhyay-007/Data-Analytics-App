import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  color: "#e2e8f0",
};

const currency = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function ChartsSection({ stats, loading }) {
  const trendData = stats.revenueOverTime || [];
  const categoryData = (stats.categoryBreakdown || []).map((item) => ({
    category: item.category,
    revenue: item.totalRevenue,
    records: item.recordCount,
  }));

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Time series
          </p>
          <h2 className="text-lg font-semibold text-white">Revenue progression</h2>
        </div>
        <div className="h-80">
          {loading ? (
            <ChartSkeleton />
          ) : trendData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="4 4" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    name === "revenue" ? currency(value) : value,
                    name === "revenue" ? "Revenue" : "Users",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22d3ee"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Category mix
          </p>
          <h2 className="text-lg font-semibold text-white">Revenue by category</h2>
        </div>
        <div className="h-80">
          {loading ? (
            <ChartSkeleton />
          ) : categoryData.every((item) => item.revenue === 0) ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="4 4" />
                <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [
                    name === "revenue" ? currency(value) : value,
                    name === "revenue" ? "Revenue" : "Records",
                  ]}
                />
                <Bar dataKey="revenue" fill="#38bdf8" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>
    </section>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/15 text-sm text-slate-400">
      No data in this date range
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl bg-white/5 text-sm text-slate-400">
      Loading chart data...
    </div>
  );
}
