import { useOutletContext } from "react-router-dom";
import KpiCards from "../components/KpiCards.jsx";
import ChartsSection from "../components/ChartsSection.jsx";

export default function Analytics() {
  const { stats, statsLoading, range } = useOutletContext();
  return (
    <>
      <KpiCards stats={stats} loading={statsLoading} range={range} />
      <ChartsSection stats={stats} loading={statsLoading} />
    </>
  );
}
