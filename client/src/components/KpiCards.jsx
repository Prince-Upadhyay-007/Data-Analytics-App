import {
  Activity,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

export default function KpiCards({ stats, loading, range }) {
  const rangeLabel =
    range === "all" ? "all time" : `last ${range} days vs prior period`;

  const cards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      growth: stats.growth?.revenue ?? 0,
      icon: DollarSign,
      accent: "from-cyan-400/20 to-cyan-400/5",
    },
    {
      label: "Active Users",
      value: formatNumber(stats.totalUsers),
      growth: stats.growth?.users ?? 0,
      icon: Users,
      accent: "from-teal-400/20 to-teal-400/5",
    },
    {
      label: "Total Entries",
      value: formatNumber(stats.totalRecords),
      growth: stats.growth?.records ?? 0,
      icon: Activity,
      accent: "from-sky-400/20 to-sky-400/5",
    },
    {
      label: "Average Revenue per Entry",
      value: formatCurrency(stats.averageRevenue),
      growth: stats.growth?.averageRevenue ?? 0,
      icon: TrendingUp,
      accent: "from-indigo-400/20 to-indigo-400/5",
    },
  ];

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
          Executive snapshot
        </p>
        <h2 className="text-lg font-semibold text-white">Key performance indicators</h2>
        <p className="text-xs text-slate-500">Growth vs {rangeLabel}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const positive = card.growth >= 0;
          return (
            <article
              key={card.label}
              className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} p-5 shadow-card`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm text-slate-400">{card.label}</p>
                <span className="rounded-xl bg-white/10 p-2 text-cyan-300">
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {loading ? "—" : card.value}
              </p>
              <div
                className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  positive
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-rose-400/10 text-rose-300"
                }`}
              >
                {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {positive ? "+" : ""}
                {card.growth}% vs prior period
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
