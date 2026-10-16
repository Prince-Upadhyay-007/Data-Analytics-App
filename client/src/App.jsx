import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./pages/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import Logs from "./pages/Logs.jsx";
import { CompaniesPage, PortfoliosPage, PerformancePage, ReportsPage } from "./components/WorkspacePages.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/portfolios" element={<PortfoliosPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
