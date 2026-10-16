import { useOutletContext } from "react-router-dom";
import KpiCards from "../components/KpiCards.jsx";
import ChartsSection from "../components/ChartsSection.jsx";
import DataTable from "../components/DataTable.jsx";

export default function Dashboard() {
  const ctx = useOutletContext();
  return (
    <>
      <KpiCards stats={ctx.stats} loading={ctx.statsLoading} range={ctx.range} />
      <ChartsSection stats={ctx.stats} loading={ctx.statsLoading} />
      <DataTable {...ctx} compact />
    </>
  );
}
