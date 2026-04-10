import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import LandingPage from "./components/LandingPage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Scanner from "./components/Scanner";
import AuditHistory from "./components/AuditHistory";
import TxMonitor from "./components/TxMonitor";
import CircuitBreaker from "./components/CircuitBreaker";
import SettingsPage from "./components/SettingsPage";

type View = "landing" | "app";

function AppInner() {
  const { isDark } = useTheme();
  const [view, setView] = useState<View>("landing");
  const [page, setPage] = useState("dashboard");

  const toastBg     = isDark ? "#111118" : "#ffffff";
  const toastColor  = isDark ? "#e2e8f0" : "#0f172a";
  const toastBorder = isDark ? "#2d2d4e" : "#e2e8f0";

  if (view === "landing") {
    return (
      <>
        <Toaster position="top-right"
          toastOptions={{ style: { background: toastBg, color: toastColor, border: `1px solid ${toastBorder}`, fontSize: "13px" } }} />
        <LandingPage onEnterApp={() => setView("app")} />
      </>
    );
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <Dashboard />;
      case "scanner":      return <Scanner />;
      case "history":      return <AuditHistory />;
      case "transactions": return <TxMonitor />;
      case "firewall":     return <CircuitBreaker />;
      case "settings":     return <SettingsPage />;
      default:             return <Dashboard />;
    }
  };

  const appBg = isDark ? "#0a0a0f" : "#f1f5f9";

  return (
    <div className="flex min-h-screen" style={{ background: appBg }}>
      <Toaster position="top-right"
        toastOptions={{
          style: { background: toastBg, color: toastColor, border: `1px solid ${toastBorder}`, fontSize: "13px", fontFamily: "Inter, sans-serif" },
          success: { iconTheme: { primary: "#22c55e", secondary: toastBg } },
          error:   { iconTheme: { primary: "#ef4444", secondary: toastBg } },
        }} />
      <Sidebar
        activePage={page}
        onNavigate={setPage}
        alertCount={2}
        onGoLanding={() => setView("landing")}
      />
      <main className="flex-1 overflow-y-auto" style={{ background: appBg }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
