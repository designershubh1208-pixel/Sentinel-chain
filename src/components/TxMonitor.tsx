import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Eye, Ban } from "lucide-react";
import { TRANSACTIONS } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";

const riskConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  label: "Critical" },
  high:     { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", label: "High" },
  medium:   { color: "#eab308", bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.2)",  label: "Medium" },
  low:      { color: "#22c55e", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",  label: "Low" },
};

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  blocked:    { icon: Ban,           color: "#ef4444", label: "Blocked"    },
  flagged:    { icon: AlertTriangle, color: "#f97316", label: "Flagged"    },
  passed:     { icon: CheckCircle,   color: "#22c55e", label: "Passed"     },
  monitoring: { icon: Eye,           color: "#60a5fa", label: "Monitoring" },
};

const FEED_ITEMS = [
  { time: "00:02:14", type: "BLOCKED", msg: "Reentrancy attempt on VulnerableVault::withdraw()",  color: "#ef4444" },
  { time: "00:01:58", type: "FLAGGED", msg: "Abnormal flash loan: $2.4M from DeFi Pool",           color: "#f97316" },
  { time: "00:01:33", type: "OK",      msg: "Standard deposit on SecureVault::deposit()",          color: "#22c55e" },
  { time: "00:01:09", type: "WATCH",   msg: "Price oracle deviation detected in NFT Market",       color: "#eab308" },
  { time: "00:00:52", type: "OK",      msg: "Governance vote cast on DAO::vote()",                 color: "#22c55e" },
  { time: "00:00:31", type: "BLOCKED", msg: "Suspicious token approval to 0x4f8e...9a2b",         color: "#ef4444" },
  { time: "00:00:15", type: "FLAGGED", msg: "High gas transaction: 380 gwei detected",             color: "#f97316" },
];

export default function TxMonitor() {
  const { isDark } = useTheme();
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState("all");

  // ── Theme tokens ──────────────────────────────────────────
  const pageBg    = isDark ? "#0a0a0f"  : "#f1f5f9";
  const cardBg    = isDark ? "#111118"  : "#ffffff";
  const cardBd    = isDark ? "#1c1c2e"  : "#e2e8f0";
  const divBd     = isDark ? "#1a1a2e"  : "#f1f5f9";
  const h1Color   = isDark ? "#ffffff"  : "#0f172a";
  const h2Color   = isDark ? "#e2e8f0"  : "#0f172a";
  const subColor  = isDark ? "#64748b"  : "#64748b";
  const bodyText  = isDark ? "#e2e8f0"  : "#1e293b";
  const mutedText = isDark ? "#94a3b8"  : "#475569";
  const dimText   = isDark ? "#64748b"  : "#94a3b8";
  const btnBg     = isDark ? "#1a1a2e"  : "#f1f5f9";
  const btnBd     = isDark ? "#2d2d4e"  : "#e2e8f0";
  const btnTxt    = isDark ? "#94a3b8"  : "#64748b";
  const termBg    = isDark ? "#0d0d14"  : "#f8fafc";
  const termBd    = isDark ? "#1e1e3a"  : "#e2e8f0";
  const termTime  = isDark ? "#2d2d4e"  : "#94a3b8";
  const termMsg   = isDark ? "#94a3b8"  : "#64748b";
  const barTrack  = isDark ? "#1e1e3a"  : "#e2e8f0";
  const rowHover  = isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.025)";

  const filtered = TRANSACTIONS.filter(t => filter === "all" || t.status === filter);

  return (
    <div className="p-6 space-y-5 min-h-screen transition-colors duration-300" style={{ background: pageBg }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: h1Color }}>Transaction Monitor</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>Real-time mempool scanning & AI threat detection</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{
              background: paused ? "rgba(100,116,139,0.1)" : "rgba(34,197,94,0.1)",
              border:     paused ? "1px solid rgba(100,116,139,0.2)" : "1px solid rgba(34,197,94,0.2)",
              color:      paused ? (isDark ? "#64748b" : "#475569") : "#22c55e",
            }}>
            <div className={`w-1.5 h-1.5 rounded-full ${paused ? "bg-gray-400" : "bg-green-400 animate-pulse"}`} />
            {paused ? "Paused" : "Live Monitoring"}
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: btnBg, color: btnTxt, border: `1px solid ${btnBd}` }}>
            {paused ? <><Activity size={13} /> Resume</> : <><RefreshCw size={13} /> Pause</>}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Scanned (24h)", value: "14,892", color: "#8b5cf6", sub: "transactions" },
          { label: "Blocked",       value: "127",    color: "#ef4444", sub: "malicious"    },
          { label: "Flagged",       value: "384",    color: "#f97316", sub: "suspicious"   },
          { label: "Passed",        value: "14,381", color: "#22c55e", sub: "safe"         },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 transition-colors duration-300"
            style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
            <div className="text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs font-semibold" style={{ color: h2Color }}>{s.label}</div>
            <div className="text-xs mt-0.5" style={{ color: subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* Transaction Table */}
        <div className="col-span-2 rounded-xl overflow-hidden transition-colors duration-300"
          style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: divBd }}>
            <h2 className="text-sm font-semibold" style={{ color: h2Color }}>Recent Transactions</h2>
            <div className="flex gap-1">
              {["all", "blocked", "flagged", "passed", "monitoring"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="text-xs px-2.5 py-1 rounded-lg capitalize transition-colors"
                  style={{
                    background: filter === f ? "rgba(139,92,246,0.15)" : "transparent",
                    color:      filter === f ? "#a78bfa" : dimText,
                    border:     filter === f ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: divBd }}>
            {filtered.map((tx) => {
              const rc = riskConfig[tx.riskLevel] || riskConfig.low;
              const sc = statusConfig[tx.status] || statusConfig.passed;
              const StatusIcon = sc.icon;
              return (
                <div
                  key={tx.id}
                  className="px-4 py-3.5 transition-colors"
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = rowHover}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg flex-shrink-0"
                        style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
                        <StatusIcon size={13} style={{ color: sc.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold font-mono" style={{ color: bodyText }}>{tx.type}</span>
                          <span className="text-xs" style={{ color: subColor }}>on</span>
                          <span className="text-xs font-medium" style={{ color: "#8b5cf6" }}>{tx.contract}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs flex-wrap" style={{ color: mutedText }}>
                          <span className="font-mono">{tx.id}</span>
                          <span>from {tx.from}</span>
                          <span>{tx.gasPrice}</span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: subColor }}>{tx.reason}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: sc.color + "18", color: sc.color }}>
                        {sc.label}
                      </span>
                      <div className="flex items-center gap-1 text-xs" style={{ color: mutedText }}>
                        <Clock size={10} />
                        {tx.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Feed + Threat Panel */}
        <div className="rounded-xl overflow-hidden transition-colors duration-300"
          style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
          <div className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: divBd }}>
            <h2 className="text-sm font-semibold" style={{ color: h2Color }}>Live Feed</h2>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#22c55e" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Streaming
            </div>
          </div>

          {/* Terminal */}
          <div className="p-3 overflow-y-auto" style={{
            height: 300,
            fontFamily: "JetBrains Mono, monospace",
            background: termBg,
            borderBottom: `1px solid ${termBd}`,
          }}>
            {FEED_ITEMS.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2 text-xs leading-relaxed">
                <span style={{ color: termTime, flexShrink: 0 }}>{item.time}</span>
                <span className="font-bold" style={{ color: item.color, flexShrink: 0 }}>[{item.type}]</span>
                <span style={{ color: termMsg }}>{item.msg}</span>
              </div>
            ))}
            {!paused && (
              <div className="flex gap-2 text-xs" style={{ color: termTime }}>
                <span>00:00:00</span>
                <span style={{ color: "#6366f1" }}>{">"} Scanning mempool<span className="cursor-blink">_</span></span>
              </div>
            )}
          </div>

          {/* Threat Gauges */}
          <div className="px-4 py-3 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold" style={{ color: h2Color }}>Network Threat Level</span>
              <span className="text-xs font-bold" style={{ color: "#f97316" }}>ELEVATED</span>
            </div>
            {[
              { label: "Reentrancy",  pct: 72, color: "#ef4444" },
              { label: "Flash Loans", pct: 45, color: "#f97316" },
              { label: "Sandwich",    pct: 28, color: "#eab308" },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1" style={{ color: subColor }}>
                  <span>{r.label}</span>
                  <span style={{ color: mutedText }}>{r.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: barTrack }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${r.pct}%`, background: r.color, opacity: 0.85 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
