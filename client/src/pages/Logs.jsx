import { useOutletContext } from "react-router-dom";
import DataTable from "../components/DataTable.jsx";

export default function Logs() {
  const ctx = useOutletContext();
  return <DataTable {...ctx} />;
}
