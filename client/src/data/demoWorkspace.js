const STORAGE_KEY = "datapulse_workspace_demo_v1";
export const initialCompanies = [
  { id: "co-1", name: "Northstar Retail", sector: "Retail", revenue: 2840000, growth: 12.8, margin: 18.4, customers: 18400, target: 3200000, status: "On track" },
  { id: "co-2", name: "Aster Cloud Systems", sector: "Technology", revenue: 1960000, growth: 21.3, margin: 24.7, customers: 9200, target: 2200000, status: "On track" },
  { id: "co-3", name: "Harbor & Pine", sector: "Consumer goods", revenue: 1280000, growth: -3.2, margin: 11.6, customers: 7100, target: 1500000, status: "Needs attention" },
  { id: "co-4", name: "Summit Health Group", sector: "Healthcare", revenue: 3420000, growth: 8.6, margin: 16.2, customers: 24600, target: 3600000, status: "On track" },
];
export const initialPortfolios = [
  { id: "pf-1", name: "Core Growth", owner: "Personal", risk: "Moderate", cash: 8500, holdings: [
    { symbol: "AAPL", name: "Apple Inc.", shares: 22, price: 247.50, cost: 198.20, sector: "Technology" },
    { symbol: "MSFT", name: "Microsoft Corp.", shares: 12, price: 512.40, cost: 426.10, sector: "Technology" },
    { symbol: "NVDA", name: "NVIDIA Corp.", shares: 18, price: 181.20, cost: 132.60, sector: "Semiconductors" },
    { symbol: "VOO", name: "Vanguard S&P 500 ETF", shares: 15, price: 612.10, cost: 554.80, sector: "ETF" },
  ] },
  { id: "pf-2", name: "Long-term Income", owner: "Family", risk: "Conservative", cash: 14200, holdings: [
    { symbol: "JNJ", name: "Johnson & Johnson", shares: 30, price: 168.20, cost: 154.70, sector: "Healthcare" },
    { symbol: "KO", name: "Coca-Cola Co.", shares: 45, price: 71.80, cost: 62.40, sector: "Consumer staples" },
    { symbol: "BND", name: "Vanguard Total Bond Market ETF", shares: 55, price: 74.60, cost: 72.10, sector: "Bonds" },
  ] },
];
export function loadWorkspace() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); if (saved && Array.isArray(saved.companies) && Array.isArray(saved.portfolios)) return saved; } catch { /* Use demo defaults. */ }
  return { companies: initialCompanies, portfolios: initialPortfolios };
}
export function saveWorkspace(workspace) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); } catch { /* Session still works if storage is unavailable. */ } }
export const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
export const preciseMoney = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0);
export const portfolioValue = (portfolio) => portfolio.holdings.reduce((sum, h) => sum + h.shares * h.price, 0) + portfolio.cash;
export const portfolioCost = (portfolio) => portfolio.holdings.reduce((sum, h) => sum + h.shares * h.cost, 0);
