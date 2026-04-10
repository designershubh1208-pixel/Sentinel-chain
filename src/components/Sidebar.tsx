import {
  Shield, Search, Clock, Activity, Zap, Settings, ChevronRight,
  BarChart2, Bell, LogOut, Sun, Moon, Home
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  alertCount: number;
  onGoLanding: () => void;
}

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",      icon: BarChart2 },
  { id: "scanner",      label: "AI Scanner",     icon: Search },
  { id: "history",      label: "Audit History",  icon: Clock },
  { id: "transactions", label: "Tx Monitor",     icon: Activity },
  { id: "firewall",     label: "Circuit Breaker", icon: Zap },
  { id: "settings",     label: "Settings",       icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, alertCount, onGoLanding }: SidebarProps) {
  const { isDark, toggle } = useTheme();

  const bg      = isDark ? "#0c0c14" : "#ffffff";
  const border  = isDark ? "#1a1a2e" : "#e2e8f0";
  const subText = isDark ? "#94a3b8" : "#64748b";
  const activeText = isDark ? "#e2e8f0" : "#0f172a";
  const inactiveText = isDark ? "#94a3b8" : "#64748b";

  return (
    <aside className="w-60 min-h-screen flex flex-col flex-shrink-0 transition-colors duration-300"
      style={{ background: bg, borderRight: `1px solid ${border}` }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-wide" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
                Sentinel-Chain
              </div>
              <div className="text-xs" style={{ color: "#6366f1" }}>AI Security Layer</div>
            </div>
          </div>
          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", color: isDark ? "#a78bfa" : "#7c3aed" }}
            title={isDark ? "Switch to light" : "Switch to dark"}>
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </div>

      {/* Network Status */}
      <div className="px-5 py-3 border-b" style={{ borderColor: border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: subText }}>Sepolia Testnet</span>
          </div>
          <span className="text-xs font-mono" style={{ color: "#6366f1" }}>Live</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-xs uppercase tracking-widest mb-3 px-2" style={{ color: isDark ? "#475569" : "#94a3b8" }}>
          Navigation
        </div>

        {/* Back to landing */}
        <button onClick={onGoLanding}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 hover:opacity-80 mb-2"
          style={{ background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.06)", border: `1px solid ${isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.15)"}` }}>
          <Home size={14} style={{ color: "#7c3aed" }} />
          <span className="text-xs font-medium" style={{ color: "#7c3aed" }}>Back to Home</span>
        </button>

        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150"
              style={{
                background: isActive
                  ? isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.1)"
                  : "transparent",
                borderLeft: isActive ? "2px solid #8b5cf6" : "2px solid transparent",
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}>
              <div className="flex items-center gap-3">
                <Icon size={16} style={{ color: isActive ? "#a78bfa" : (isDark ? "#64748b" : "#94a3b8") }} />
                <span className="text-sm" style={{ color: isActive ? activeText : inactiveText }}>
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {id === "transactions" && alertCount > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>
                    {alertCount}
                  </span>
                )}
                {isActive && <ChevronRight size={12} style={{ color: "#a78bfa" }} />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5 border-t pt-4" style={{ borderColor: border }}>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
          style={{ color: isDark ? "#94a3b8" : "#64748b" }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}>
          <Bell size={16} />
          <span className="text-sm">Alerts</span>
          {alertCount > 0 && (
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{ background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>
              {alertCount}
            </span>
          )}
        </button>

        <div className="px-3 py-3 mt-2 rounded-lg transition-colors"
          style={{ background: isDark ? "#111118" : "#f8fafc", border: `1px solid ${border}` }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "white" }}>
              D
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
                Dev Account
              </div>
              <div className="text-xs truncate" style={{ color: isDark ? "#475569" : "#94a3b8" }}>
                0x742d...7890
              </div>
            </div>
            <button className="transition-colors" style={{ color: isDark ? "#475569" : "#94a3b8" }}>
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
