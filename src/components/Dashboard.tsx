import {
  Shield, AlertTriangle, CheckCircle, TrendingUp,
  Activity, Zap, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { AUDIT_HISTORY, RISK_CHART_DATA, VULN_TYPES } from "../data/mockData";
import { useTheme } from "../context/ThemeContext";

const STAT_CARDS = [
  { label: "Total Audits",      value: "247", change: "+12 this week", up: true,  icon: Shield,        color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  { label: "Critical Findings", value: "18",  change: "-3 vs last week", up: false, icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  { label: "Contracts Blocked", value: "31",  change: "+5 this week", up: true,  icon: Zap,           color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  { label: "Safe Deployments",  value: "198", change: "+8 this week", up: true,  icon: CheckCircle,   color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
];

const severityColor: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e",
};
const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  blocked:           { bg: "rgba(239,68,68,0.1)",   text: "#ef4444", label: "Blocked" },
  deployed_firewall: { bg: "rgba(249,115,22,0.1)",  text: "#f97316", label: "Firewall" },
  deployed:          { bg: "rgba(34,197,94,0.1)",   text: "#22c55e", label: "Deployed" },
};

export default function Dashboard() {
  const { isDark } = useTheme();

  const pageBg   = isDark ? "#0a0a0f" : "#f1f5f9";
  const cardBg   = isDark ? "#111118" : "#ffffff";
  const cardBd   = isDark ? "#1c1c2e" : "#e2e8f0";
  const h1Color  = isDark ? "#ffffff" : "#0f172a";
  const subColor = isDark ? "#64748b" : "#64748b";
  const ttBg     = isDark ? "#111118" : "#ffffff";
  const ttBd     = isDark ? "#2d2d4e" : "#e2e8f0";
  const axisColor= isDark ? "#475569" : "#94a3b8";
  const valColor = isDark ? "#ffffff" : "#0f172a";
  const textSub  = isDark ? "#94a3b8" : "#64748b";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg p-3 text-xs" style={{ background: ttBg, border: `1px solid ${ttBd}` }}>
        <p className="mb-2 font-medium" style={{ color: subColor }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: textSub }}>{p.name}:</span>
            <span className="font-semibold" style={{ color: valColor }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 transition-colors" style={{ background: pageBg }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: h1Color }}>Security Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>
            Real-time overview of your smart contract security posture
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          All Systems Operational
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ background: s.bg }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${s.up ? "text-green-400" : "text-red-400"}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              </div>
            </div>
            <div className="text-2xl font-bold mb-0.5 number-gradient">{s.value}</div>
            <div className="text-xs font-medium" style={{ color: subColor }}>{s.label}</div>
            <div className="text-xs mt-1" style={{ color: s.up ? "#22c55e" : "#ef4444" }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Audit Trend */}
        <div className="col-span-2 rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: h1Color }}>Audit Activity</h2>
              <p className="text-xs mt-0.5" style={{ color: subColor }}>Last 7 days by severity</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {[
                { label: "Critical", color: "#ef4444" },
                { label: "High",     color: "#f97316" },
                { label: "Medium",   color: "#eab308" },
                { label: "Low",      color: "#22c55e" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span style={{ color: subColor }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={RISK_CHART_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                {[
                  { id: "c", color: "#ef4444" }, { id: "h", color: "#f97316" },
                  { id: "m", color: "#eab308" }, { id: "l", color: "#22c55e" },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="critical" name="Critical" stroke="#ef4444" fill="url(#grad-c)" strokeWidth={2} />
              <Area type="monotone" dataKey="high"     name="High"     stroke="#f97316" fill="url(#grad-h)" strokeWidth={2} />
              <Area type="monotone" dataKey="medium"   name="Medium"   stroke="#eab308" fill="url(#grad-m)" strokeWidth={2} />
              <Area type="monotone" dataKey="low"      name="Low"      stroke="#22c55e" fill="url(#grad-l)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vuln Types Pie */}
        <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: h1Color }}>Vulnerability Types</h2>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>All-time breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={VULN_TYPES} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="count">
                {VULN_TYPES.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {VULN_TYPES.map((v) => (
              <div key={v.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: v.color }} />
                  <span style={{ color: textSub }}>{v.name}</span>
                </div>
                <span className="font-semibold" style={{ color: valColor }}>{v.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audits */}
      <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: cardBd }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: h1Color }}>Recent Audits</h2>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>Latest smart contract security reports</p>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={13} style={{ color: "#8b5cf6" }} />
            <button className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)" }}>
              View All
            </button>
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: cardBd }}>
          {AUDIT_HISTORY.slice(0, 5).map((audit) => {
            const ss = statusStyle[audit.status] || statusStyle.deployed;
            return (
              <div key={audit.id}
                className="px-5 py-3.5 flex items-center justify-between transition-colors"
                style={{}}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${severityColor[audit.severity]}15`, border: `1px solid ${severityColor[audit.severity]}30` }}>
                    <Shield size={14} style={{ color: severityColor[audit.severity] }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: valColor }}>{audit.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#475569" }}>
                      {audit.id} · {audit.network} · {audit.timestamp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs" style={{ color: subColor }}>Risk Score</div>
                    <div className="text-sm font-bold" style={{ color: severityColor[audit.severity] }}>{audit.riskScore}/100</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs" style={{ color: subColor }}>Vulns</div>
                    <div className="text-sm font-bold" style={{ color: valColor }}>{audit.vulnerabilities}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: ss.bg, color: ss.text }}>
                    {ss.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
