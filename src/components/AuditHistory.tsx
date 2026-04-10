import { useState } from "react";
import { Shield, Search, Filter, Download, ExternalLink, ChevronDown } from "lucide-react";
import { AUDIT_HISTORY } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";

const severityColor: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e",
};
const statusStyle: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  blocked:           { bg: "rgba(239,68,68,0.1)",  text: "#ef4444", label: "Blocked",        dot: "#ef4444" },
  deployed_firewall: { bg: "rgba(249,115,22,0.1)", text: "#f97316", label: "Firewall Active", dot: "#f97316" },
  deployed:          { bg: "rgba(34,197,94,0.1)",  text: "#22c55e", label: "Deployed",        dot: "#22c55e" },
};
const networkColors: Record<string, string> = {
  Sepolia: "#8b5cf6", Mainnet: "#3b82f6", Polygon: "#a855f7", Arbitrum: "#22d3ee"
};

const EXTENDED = [
  ...AUDIT_HISTORY,
  { id: "AUD-2024-007", name: "Airdrop Distributor",  timestamp: "2025-06-11 12:10:00", riskScore: 55, severity: "high",     status: "deployed_firewall", vulnerabilities: 3, network: "Arbitrum", gasEstimate: "155,000" },
  { id: "AUD-2024-008", name: "LP Token Contract",    timestamp: "2025-06-10 09:45:22", riskScore: 19, severity: "low",      status: "deployed",          vulnerabilities: 1, network: "Polygon",  gasEstimate: "88,000"  },
  { id: "AUD-2024-009", name: "Vesting Schedule",     timestamp: "2025-06-09 17:30:11", riskScore: 78, severity: "critical", status: "blocked",           vulnerabilities: 5, network: "Mainnet",  gasEstimate: "290,000" },
];

export default function AuditHistory() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"timestamp" | "riskScore">("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // ── Theme tokens ──────────────────────────────────────────
  const pageBg     = isDark ? "#0a0a0f"  : "#f1f5f9";
  const cardBg     = isDark ? "#111118"  : "#ffffff";
  const cardBd     = isDark ? "#1c1c2e"  : "#e2e8f0";
  const headBg     = isDark ? "#0d0d16"  : "#f8fafc";
  const headBd     = isDark ? "#1a1a2e"  : "#e2e8f0";
  const inputBg    = isDark ? "#0d0d16"  : "#f1f5f9";
  const inputBd    = isDark ? "#1e1e3a"  : "#cbd5e1";
  const selectBg   = isDark ? "#0d0d16"  : "#f1f5f9";
  const h1Color    = isDark ? "#ffffff"  : "#0f172a";
  const subColor   = isDark ? "#64748b"  : "#64748b";
  const bodyText   = isDark ? "#e2e8f0"  : "#0f172a";
  const mutedText  = isDark ? "#94a3b8"  : "#475569";
  const dimText    = isDark ? "#475569"  : "#94a3b8";
  const thColor    = isDark ? "#475569"  : "#94a3b8";
  const rowDivide  = isDark ? "#1a1a2e"  : "#f1f5f9";
  const rowHover   = isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.025)";
  const monoId     = isDark ? "#475569"  : "#94a3b8";

  const filtered = EXTENDED.filter(a => {
    const matchSearch   = a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === "all" || a.severity === filterSeverity;
    const matchStatus   = filterStatus   === "all" || a.status   === filterStatus;
    return matchSearch && matchSeverity && matchStatus;
  }).sort((a, b) => {
    const dir = sortDir === "desc" ? -1 : 1;
    if (sortBy === "riskScore") return dir * (a.riskScore - b.riskScore);
    return dir * a.timestamp.localeCompare(b.timestamp);
  });

  const toggleSort = (col: "timestamp" | "riskScore") => {
    if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <div className="p-6 space-y-5 min-h-screen transition-colors duration-300" style={{ background: pageBg }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: h1Color }}>Audit History</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>{EXTENDED.length} audits · Last updated just now</p>
        </div>
        <button
          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors"
          style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Audits",   value: EXTENDED.length,                                              color: "#8b5cf6" },
          { label: "Blocked",        value: EXTENDED.filter(a => a.status === "blocked").length,          color: "#ef4444" },
          { label: "Firewall Active",value: EXTENDED.filter(a => a.status === "deployed_firewall").length,color: "#f97316" },
          { label: "Clean Deploys",  value: EXTENDED.filter(a => a.status === "deployed").length,         color: "#22c55e" },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-4 flex items-center gap-4 transition-colors duration-300"
            style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
            <div className="text-2xl font-black" style={{ color: c.color }}>{c.value}</div>
            <div className="text-sm font-medium" style={{ color: subColor }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl px-4 py-3 flex items-center gap-4 transition-colors duration-300"
        style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
        <div className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: inputBg, border: `1px solid ${inputBd}` }}>
          <Search size={14} style={{ color: dimText }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by contract name or audit ID..."
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder-slate-400"
            style={{ color: bodyText }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} style={{ color: dimText }} />
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg focus:outline-none cursor-pointer"
            style={{ background: selectBg, border: `1px solid ${inputBd}`, color: mutedText }}>
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-2 rounded-lg focus:outline-none cursor-pointer"
            style={{ background: selectBg, border: `1px solid ${inputBd}`, color: mutedText }}>
            <option value="all">All Status</option>
            <option value="blocked">Blocked</option>
            <option value="deployed_firewall">Firewall</option>
            <option value="deployed">Deployed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden transition-colors duration-300"
        style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: headBg, borderBottom: `1px solid ${headBd}` }}>
              {[
                { label: "Contract",       key: null },
                { label: "Risk Score",     key: "riskScore" as const },
                { label: "Vulnerabilities",key: null },
                { label: "Network",        key: null },
                { label: "Status",         key: null },
                { label: "Timestamp",      key: "timestamp" as const },
                { label: "",               key: null },
              ].map((col, i) => (
                <th
                  key={i}
                  onClick={() => col.key && toggleSort(col.key)}
                  className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${col.key ? "cursor-pointer select-none" : ""}`}
                  style={{ color: thColor }}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.key && (
                      <ChevronDown
                        size={11}
                        style={{
                          opacity: sortBy === col.key ? 1 : 0.3,
                          transform: sortBy === col.key && sortDir === "asc" ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(audit => {
              const sc = severityColor[audit.severity];
              const ss = statusStyle[audit.status] || statusStyle.deployed;
              const nc = networkColors[audit.network] || "#64748b";
              return (
                <tr
                  key={audit.id}
                  className="transition-colors"
                  style={{ borderBottom: `1px solid ${rowDivide}` }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = rowHover}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>

                  {/* Contract */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${sc}12`, border: `1px solid ${sc}25` }}>
                        <Shield size={13} style={{ color: sc }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: bodyText }}>{audit.name}</div>
                        <div className="text-xs font-mono mt-0.5" style={{ color: monoId }}>{audit.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Risk Score */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: isDark ? "#1e1e3a" : "#e2e8f0" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${audit.riskScore}%`, background: sc }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: sc }}>{audit.riskScore}</span>
                    </div>
                  </td>

                  {/* Vulnerabilities */}
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold" style={{ color: bodyText }}>{audit.vulnerabilities}</span>
                    <span className="text-xs ml-1" style={{ color: subColor }}>found</span>
                  </td>

                  {/* Network */}
                  <td className="px-4 py-3.5">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: `${nc}18`, color: nc, border: `1px solid ${nc}30` }}>
                      {audit.network}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: ss.dot }} />
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: ss.bg, color: ss.text }}>
                        {ss.label}
                      </span>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="px-4 py-3.5">
                    <div className="text-xs font-mono" style={{ color: mutedText }}>{audit.timestamp}</div>
                  </td>

                  {/* Link */}
                  <td className="px-4 py-3.5">
                    <button className="p-1.5 rounded transition-colors" style={{ color: dimText }}>
                      <ExternalLink size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-2" style={{ color: subColor }}>
            <Search size={24} style={{ opacity: 0.4 }} />
            <p className="text-sm">No audits match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
