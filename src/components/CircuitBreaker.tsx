import { useState } from "react";
import { Zap, Shield, Pause, Play, AlertTriangle, Settings, RefreshCw, Plus } from "lucide-react";
import { CIRCUIT_BREAKERS } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const networkColors: Record<string, string> = {
  Sepolia: "#8b5cf6", Mainnet: "#3b82f6", Polygon: "#a855f7", Arbitrum: "#22d3ee"
};

export default function CircuitBreaker() {
  const { isDark } = useTheme();
  const [breakers, setBreakers] = useState(CIRCUIT_BREAKERS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBreaker, setNewBreaker] = useState({ contract: "", address: "", threshold: 70, network: "Sepolia" });

  // ── Theme tokens ──────────────────────────────────────────
  const pageBg    = isDark ? "#0a0a0f"  : "#f1f5f9";
  const cardBg    = isDark ? "#111118"  : "#ffffff";
  const cardBd    = isDark ? "#1c1c2e"  : "#e2e8f0";
  const h1Color   = isDark ? "#ffffff"  : "#0f172a";
  const h2Color   = isDark ? "#e2e8f0"  : "#1e293b";
  const subColor  = isDark ? "#64748b"  : "#64748b";
  const bodyText  = isDark ? "#e2e8f0"  : "#1e293b";
  const mutedText = isDark ? "#94a3b8"  : "#475569";
  const dimText   = isDark ? "#64748b"  : "#94a3b8";
  const inputBg   = isDark ? "#0d0d16"  : "#f8fafc";
  const inputBd   = isDark ? "#2d2d4e"  : "#e2e8f0";
  const inputTxt  = isDark ? "#e2e8f0"  : "#0f172a";
  const modalBg   = isDark ? "#111118"  : "#ffffff";
  const modalBd   = isDark ? "#2d2d4e"  : "#e2e8f0";
  const cancelBg  = isDark ? "#1a1a2e"  : "#f1f5f9";
  const cancelTxt = isDark ? "#94a3b8"  : "#64748b";
  const barTrack  = isDark ? "#1e1e3a"  : "#e2e8f0";
  const fnBg      = isDark ? "rgba(99,102,241,0.1)"  : "rgba(99,102,241,0.08)";
  const fnBd      = isDark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.2)";
  const fnTxt     = isDark ? "#818cf8"  : "#6366f1";
  const infoBg    = isDark ? "rgba(99,102,241,0.06)"  : "rgba(99,102,241,0.05)";
  const infoBd    = isDark ? "rgba(99,102,241,0.15)"  : "rgba(99,102,241,0.15)";
  const infoIconBg= isDark ? "rgba(99,102,241,0.1)"   : "rgba(99,102,241,0.1)";
  const overlayBg = isDark ? "rgba(0,0,0,0.75)"       : "rgba(0,0,0,0.5)";
  const labelTxt  = isDark ? "#94a3b8"  : "#475569";

  const toggleBreaker = (id: string) => {
    setBreakers(prev => prev.map(b => {
      if (b.id !== id) return b;
      const next = b.status === "active" ? "paused" : "active";
      toast(next === "active" ? `Circuit breaker ${b.contract} armed` : `Circuit breaker ${b.contract} paused`, {
        icon: next === "active" ? "🛡️" : "⏸️"
      });
      return { ...b, status: next };
    }));
  };

  const manualTrigger = (id: string) => {
    setBreakers(prev => prev.map(b => {
      if (b.id !== id) return b;
      toast.error(`Circuit breaker manually triggered for ${b.contract}`);
      return { ...b, triggered: true, triggerCount: b.triggerCount + 1, lastTriggered: new Date().toISOString().slice(0, 19).replace("T", " ") };
    }));
  };

  const resetBreaker = (id: string) => {
    setBreakers(prev => prev.map(b => {
      if (b.id !== id) return b;
      toast.success(`Circuit breaker reset for ${b.contract}`);
      return { ...b, triggered: false };
    }));
  };

  const addBreaker = () => {
    if (!newBreaker.contract || !newBreaker.address) { toast.error("Fill in all required fields."); return; }
    const cb = {
      id: `CB-00${breakers.length + 1}`,
      ...newBreaker,
      status: "active",
      triggered: false,
      triggerCount: 0,
      lastTriggered: "Never",
      protectedFunctions: ["transfer", "withdraw"],
    };
    setBreakers(prev => [...prev, cb]);
    setShowAddModal(false);
    setNewBreaker({ contract: "", address: "", threshold: 70, network: "Sepolia" });
    toast.success(`Circuit breaker deployed for ${cb.contract}`);
  };

  return (
    <div className="p-6 space-y-5 min-h-screen transition-colors duration-300" style={{ background: pageBg }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: h1Color }}>On-Chain Circuit Breaker</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>Proxy-based security firewall with automated pause controls</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "white" }}>
          <Plus size={15} /> Deploy New Firewall
        </button>
      </div>

      {/* Architecture Info */}
      <div className="rounded-xl p-4 transition-colors duration-300"
        style={{ background: infoBg, border: `1px solid ${infoBd}` }}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg flex-shrink-0" style={{ background: infoIconBg }}>
            <Zap size={16} style={{ color: "#6366f1" }} />
          </div>
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: h2Color }}>How Circuit Breakers Work</div>
            <p className="text-xs leading-relaxed" style={{ color: mutedText }}>
              Each protected contract is routed through a proxy firewall contract on-chain. When the AI risk engine detects suspicious transactions exceeding the threshold, it signals the proxy to pause specific functions or block entire contract interactions — all without modifying the original contract.
            </p>
            <div className="flex items-center gap-6 mt-3 text-xs flex-wrap">
              {[
                { label: "Proxy Architecture",        icon: Shield   },
                { label: "Admin-Controlled",          icon: Settings },
                { label: "Function-Level Granularity",icon: Zap      },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5" style={{ color: dimText }}>
                  <Icon size={12} style={{ color: "#6366f1" }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active Firewalls", value: breakers.filter(b => b.status === "active").length,      color: "#22c55e" },
          { label: "Triggered",        value: breakers.filter(b => b.triggered).length,                color: "#ef4444" },
          { label: "Paused",           value: breakers.filter(b => b.status === "paused").length,      color: isDark ? "#64748b" : "#94a3b8" },
          { label: "Total Blocks",     value: breakers.reduce((s, b) => s + b.triggerCount, 0),        color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 transition-colors duration-300"
            style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
            <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-sm font-medium" style={{ color: subColor }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Breaker Cards */}
      <div className="space-y-4">
        {breakers.map(b => {
          const nc = networkColors[b.network] || "#64748b";
          const isActive = b.status === "active";
          return (
            <div
              key={b.id}
              className="rounded-xl overflow-hidden transition-colors duration-300"
              style={{
                background: cardBg,
                border: b.triggered ? "1px solid rgba(239,68,68,0.35)" : `1px solid ${cardBd}`,
              }}>

              {/* Triggered Banner */}
              {b.triggered && (
                <div className="px-4 py-2 flex items-center gap-2 text-xs"
                  style={{ background: "rgba(239,68,68,0.08)", borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertTriangle size={12} style={{ color: "#ef4444" }} />
                  <span style={{ color: "#ef4444" }}>Circuit breaker TRIGGERED — contract interactions paused</span>
                </div>
              )}

              <div className="p-5">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: b.triggered ? "rgba(239,68,68,0.1)" : isActive ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)",
                        border: `1px solid ${b.triggered ? "rgba(239,68,68,0.25)" : isActive ? "rgba(34,197,94,0.25)" : "rgba(100,116,139,0.2)"}`,
                      }}>
                      <Zap size={18} style={{ color: b.triggered ? "#ef4444" : isActive ? "#22c55e" : dimText }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold" style={{ color: h1Color }}>{b.contract}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${nc}18`, color: nc, border: `1px solid ${nc}30` }}>
                          {b.network}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: isActive ? "rgba(34,197,94,0.1)" : "rgba(100,116,139,0.1)",
                            color: isActive ? "#22c55e" : dimText,
                          }}>
                          {isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="text-xs font-mono mt-1" style={{ color: mutedText }}>{b.address}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {b.triggered && (
                      <button
                        onClick={() => resetBreaker(b.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>
                        <RefreshCw size={11} /> Reset
                      </button>
                    )}
                    <button
                      onClick={() => manualTrigger(b.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                      <Zap size={11} /> Trigger
                    </button>
                    <button
                      onClick={() => toggleBreaker(b.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{
                        background: isActive ? "rgba(100,116,139,0.1)" : "rgba(34,197,94,0.1)",
                        color:      isActive ? dimText : "#22c55e",
                        border: `1px solid ${isActive ? "rgba(100,116,139,0.2)" : "rgba(34,197,94,0.25)"}`,
                      }}>
                      {isActive ? <><Pause size={11} /> Pause</> : <><Play size={11} /> Resume</>}
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs mb-2 font-medium" style={{ color: subColor }}>Risk Threshold</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: barTrack }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${b.threshold}%`, background: b.threshold >= 70 ? "#ef4444" : b.threshold >= 50 ? "#f97316" : "#22c55e" }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: bodyText }}>{b.threshold}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1.5 font-medium" style={{ color: subColor }}>Trigger Count</div>
                    <div className="text-xl font-black" style={{ color: b.triggerCount > 0 ? "#f97316" : "#22c55e" }}>{b.triggerCount}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1.5 font-medium" style={{ color: subColor }}>Last Triggered</div>
                    <div className="text-xs font-mono" style={{ color: mutedText }}>{b.lastTriggered}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1.5 font-medium" style={{ color: subColor }}>Protected Functions</div>
                    <div className="flex flex-wrap gap-1">
                      {b.protectedFunctions.map(f => (
                        <span key={f} className="text-xs px-1.5 py-0.5 rounded font-mono"
                          style={{ background: fnBg, color: fnTxt, border: `1px solid ${fnBd}` }}>
                          {f}()
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: overlayBg }}>
          <div className="rounded-2xl p-6 w-full max-w-md mx-4 transition-colors duration-300"
            style={{ background: modalBg, border: `1px solid ${modalBd}` }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: h1Color }}>Deploy New Circuit Breaker</h2>
            <div className="space-y-3">
              {[
                { label: "Contract Name",    key: "contract" as const, placeholder: "e.g. DeFi Vault" },
                { label: "Contract Address", key: "address"  as const, placeholder: "0x..."           },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: labelTxt }}>{f.label}</label>
                  <input
                    value={newBreaker[f.key]}
                    onChange={e => setNewBreaker(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full text-sm px-3 py-2 rounded-lg focus:outline-none font-mono transition-colors"
                    style={{ background: inputBg, border: `1px solid ${inputBd}`, color: inputTxt }}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: labelTxt }}>Network</label>
                  <select
                    value={newBreaker.network}
                    onChange={e => setNewBreaker(p => ({ ...p, network: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg focus:outline-none transition-colors"
                    style={{ background: inputBg, border: `1px solid ${inputBd}`, color: inputTxt }}>
                    {["Sepolia", "Mainnet", "Polygon", "Arbitrum"].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: labelTxt }}>Risk Threshold (0–100)</label>
                  <input
                    type="number" min={0} max={100}
                    value={newBreaker.threshold}
                    onChange={e => setNewBreaker(p => ({ ...p, threshold: +e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-lg focus:outline-none transition-colors"
                    style={{ background: inputBg, border: `1px solid ${inputBd}`, color: inputTxt }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-lg text-sm transition-colors"
                style={{ background: cancelBg, color: cancelTxt, border: `1px solid ${modalBd}` }}>
                Cancel
              </button>
              <button
                onClick={addBreaker}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "white" }}>
                Deploy Firewall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
