import { useState, useEffect } from "react";
import {
  Search, Play, AlertTriangle, CheckCircle, ChevronDown,
  ChevronUp, Copy, FileCode, Shield, Info, Cpu, Clock,
  XCircle, Flame, RefreshCw, ChevronRight, Wifi, WifiOff, Zap
} from "lucide-react";
import { runAudit } from "../utils/auditEngine";
import { runAIAudit, fetchProviders, checkHealth, logAudit } from "../utils/api";
import { SAMPLE_CONTRACTS } from "../data/mockData";
import type { AuditResult, Vulnerability, Severity } from "../types";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const SEVERITY_CONFIG: Record<Severity, { label: string; cls: string; icon: any; color: string }> = {
  critical: { label: "Critical", cls: "badge-critical", icon: Flame,         color: "#ef4444" },
  high:     { label: "High",     cls: "badge-high",     icon: AlertTriangle,  color: "#f97316" },
  medium:   { label: "Medium",   cls: "badge-medium",   icon: AlertTriangle,  color: "#eab308" },
  low:      { label: "Low",      cls: "badge-low",      icon: Info,           color: "#22c55e" },
  info:     { label: "Info",     cls: "badge-info",     icon: Info,           color: "#60a5fa" },
};

const RECOMMENDATION_CONFIG = {
  block:                { label: "DEPLOYMENT BLOCKED",    color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   icon: XCircle,      desc: "Risk score exceeds safe threshold. Fix critical vulnerabilities before deploying." },
  deploy_with_firewall: { label: "DEPLOY WITH FIREWALL", color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.2)",  icon: Shield,       desc: "Moderate risk detected. Circuit breaker will be attached to monitor interactions." },
  deploy:               { label: "SAFE TO DEPLOY",       color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)",   icon: CheckCircle,  desc: "No critical issues found. Contract passed all security checks." },
};

const AI_PROVIDERS = [
  { id: "openai",  name: "GPT-4o",         icon: "🤖", color: "#22c55e" },
  { id: "mistral", name: "Mistral Large",  icon: "🌊", color: "#2563eb" },
  { id: "gemini",  name: "Gemini 1.5 Pro", icon: "💎", color: "#7c3aed" },
  { id: "cohere",  name: "Command R+",     icon: "🔮", color: "#ec4899" },
  { id: "groq",    name: "Groq LLaMA-3",   icon: "⚡", color: "#f97316" },
  { id: "static",  name: "Static Engine",  icon: "🔍", color: "#64748b" },
];

/* ── VulnCard ─────────────────────────────────────────────────── */
function VulnCard({ vuln }: { vuln: Vulnerability }) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[vuln.severity];
  const Icon = cfg.icon;

  const cardBg = isDark ? `${cfg.color}06` : `${cfg.color}04`;
  const cardBorder = `${cfg.color}20`;
  const descColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div className="rounded-xl overflow-hidden transition-all" style={{ border: `1px solid ${cardBorder}`, background: cardBg }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg" style={{ background: `${cfg.color}20` }}>
            <Icon size={13} style={{ color: cfg.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>{vuln.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>
              {vuln.swcId && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                  {vuln.swcId}
                </span>
              )}
            </div>
            <div className="text-xs mt-0.5 font-mono" style={{ color: "#64748b" }}>
              Line {vuln.line}{vuln.lineEnd ? `–${vuln.lineEnd}` : ""} · {vuln.confidence}% confidence
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {open ? <ChevronUp size={14} style={{ color: "#475569" }} /> : <ChevronDown size={14} style={{ color: "#475569" }} />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: `${cfg.color}15` }}>
          <div className="pt-3">
            <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>Description</div>
            <p className="text-sm leading-relaxed" style={{ color: descColor }}>{vuln.description}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>Impact</div>
            <p className="text-sm leading-relaxed" style={{ color: descColor }}>{vuln.impact}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#22c55e" }}>Recommendation</div>
            <p className="text-sm leading-relaxed" style={{ color: descColor }}>{vuln.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── RiskGauge ────────────────────────────────────────────────── */
function RiskGauge({ score }: { score: number }) {
  const { isDark } = useTheme();
  const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f97316" : score >= 20 ? "#eab308" : "#22c55e";
  const label = score >= 70 ? "Critical" : score >= 40 ? "High" : score >= 20 ? "Medium" : "Low";
  const trackColor = isDark ? "#1e1e3a" : "#e2e8f0";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-20 flex items-end justify-center">
        <svg viewBox="0 0 120 72" className="w-full absolute top-0 left-0">
          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={trackColor} strokeWidth="10" strokeLinecap="round" />
          <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 157} 157`} style={{ transition: "stroke-dasharray 1.2s ease" }} />
        </svg>
        <div className="relative z-10 text-center pb-1">
          <div className="text-3xl font-black number-gradient leading-none">{score}</div>
          <div className="text-xs font-medium" style={{ color }}>/ 100</div>
        </div>
      </div>
      <div className="text-sm font-semibold mt-1" style={{ color }}>{label} Risk</div>
    </div>
  );
}

/* ── ScanningAnimation ────────────────────────────────────────── */
function ScanningAnimation({ provider }: { provider: string }) {
  const { isDark } = useTheme();
  const providerInfo = AI_PROVIDERS.find(p => p.id === provider) || AI_PROVIDERS[0];
  const steps = [
    `Sending to ${providerInfo.icon} ${providerInfo.name}...`,
    "Parsing Solidity AST...",
    "Checking reentrancy patterns...",
    "Analyzing access control...",
    "Scanning integer arithmetic...",
    "Evaluating external calls...",
    "Cross-validating findings...",
    "Generating risk score...",
  ];
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1));
      setProgress(p => Math.min(p + 100 / steps.length, 100));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const termBg = isDark ? "#0d0d14" : "#f8fafc";
  const termBorder = isDark ? "#1e1e3a" : "#e2e8f0";
  const progressTrack = isDark ? "#1e1e3a" : "#e2e8f0";
  const textColor = isDark ? "#6366f1" : "#7c3aed";

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: `${providerInfo.color}20`, border: `2px solid ${providerInfo.color}40` }}>
          <span className="text-2xl">{providerInfo.icon}</span>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: providerInfo.color, animation: "spin 1s linear infinite" }} />
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold mb-1" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
          AI Audit in Progress
        </div>
        <div className="text-xs font-mono" style={{ color: textColor }}>
          {steps[step]}<span className="cursor-blink">_</span>
        </div>
      </div>
      <div className="w-64">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: "#475569" }}>
          <span>Scanning...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: progressTrack }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${providerInfo.color}, #3b82f6)` }} />
        </div>
      </div>
      <div className="rounded-lg px-4 py-2 text-xs font-mono"
        style={{ background: termBg, border: `1px solid ${termBorder}`, color: textColor }}>
        {steps.slice(0, step + 1).map((s, i) => (
          <div key={i} style={{ opacity: i === step ? 1 : 0.4 }}>
            {i < step ? "✓" : "⠸"} {s}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Provider Selector ────────────────────────────────────────── */
function ProviderSelector({
  selected, onChange, backendOnline, availableProviders
}: {
  selected: string;
  onChange: (id: string) => void;
  backendOnline: boolean;
  availableProviders: Record<string, boolean>;
}) {
  const { isDark } = useTheme();
  const bg = isDark ? "#0d0d16" : "#f8fafc";
  const border = isDark ? "#2d2d4e" : "#e2e8f0";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold" style={{ color: "#64748b" }}>AI Engine</label>
        <div className="flex items-center gap-1.5 text-xs">
          {backendOnline
            ? <><Wifi size={10} style={{ color: "#22c55e" }} /><span style={{ color: "#22c55e" }}>Backend Online</span></>
            : <><WifiOff size={10} style={{ color: "#f97316" }} /><span style={{ color: "#f97316" }}>Using Static Engine</span></>
          }
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {AI_PROVIDERS.map(p => {
          const isOnline = p.id === "static" || (backendOnline && availableProviders[p.id]);
          const isSelected = selected === p.id;
          return (
            <button key={p.id} onClick={() => onChange(p.id)}
              disabled={!isOnline && p.id !== "static"}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all duration-150 disabled:opacity-40"
              style={{
                background: isSelected ? `${p.color}20` : bg,
                border: `1px solid ${isSelected ? p.color + "50" : border}`,
                boxShadow: isSelected ? `0 0 12px ${p.color}20` : "none",
              }}>
              <span className="text-base leading-none">{p.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: isSelected ? p.color : (isDark ? "#e2e8f0" : "#0f172a"), fontSize: 10 }}>
                  {p.name}
                </div>
                {!isOnline && p.id !== "static" && (
                  <div className="text-xs" style={{ color: "#475569", fontSize: 9 }}>No key</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN SCANNER
═══════════════════════════════════════════════════════════════ */
export default function Scanner() {
  const { isDark } = useTheme();
  const [code, setCode] = useState(SAMPLE_CONTRACTS.reentrancy);
  const [contractName, setContractName] = useState("VulnerableVault");
  const [network, setNetwork] = useState("sepolia");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [status, setStatus] = useState<"idle" | "scanning" | "complete" | "error">("idle");
  const [result, setResult] = useState<(AuditResult & { provider?: string }) | null>(null);
  const [activeTab, setActiveTab] = useState<"vulnerabilities" | "gas" | "summary">("vulnerabilities");
  const [backendOnline, setBackendOnline] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<Record<string, boolean>>({});

  // Check backend on mount
  useEffect(() => {
    (async () => {
      const h = await checkHealth();
      setBackendOnline(h.ok);
      setAvailableProviders(h.providers);
      if (!h.ok) setSelectedProvider("static");
    })();
    fetchProviders().then(ps => {
      const map: Record<string, boolean> = {};
      ps.forEach(p => { map[p.id] = p.available; });
      setAvailableProviders(map);
    });
  }, []);

  const handleScan = async () => {
    if (!code.trim()) { toast.error("Please enter Solidity code to audit."); return; }
    setStatus("scanning");
    setResult(null);
    try {
      let r: AuditResult & { provider?: string };

      if (selectedProvider === "static" || !backendOnline) {
        // Use local static engine
        const staticResult = await runAudit(code, contractName || "Unknown Contract");
        r = { ...staticResult, provider: "static" };
      } else {
        // Use real AI API via backend
        r = await runAIAudit(code, contractName || "Unknown Contract", network, selectedProvider);
        r.provider = selectedProvider;
      }

      setResult(r);
      setStatus("complete");

      // Log to backend
      const topSeverity = r.vulnerabilities.length > 0
        ? (r.vulnerabilities.find(v => v.severity === "critical") ? "critical"
          : r.vulnerabilities.find(v => v.severity === "high") ? "high"
          : r.vulnerabilities.find(v => v.severity === "medium") ? "medium" : "low")
        : "none";

      await logAudit({
        contractName: contractName || "Unknown",
        network,
        riskScore: r.riskScore,
        severity: topSeverity,
        vulnerabilityCount: r.vulnerabilities.length,
        recommendation: r.recommendation,
        provider: r.provider || "static",
      });

      if (r.riskScore >= 70) toast.error(`🚨 High risk: ${r.vulnerabilities.length} vulnerabilities found!`);
      else if (r.riskScore >= 30) toast(`⚠️ Moderate risk: ${r.vulnerabilities.length} issues detected`, { icon: "⚠️" });
      else toast.success("✅ Low risk — contract passed security checks!");

    } catch (err: any) {
      console.error(err);
      // Fallback to static engine
      try {
        const staticResult = await runAudit(code, contractName || "Unknown Contract");
        setResult({ ...staticResult, provider: "static" });
        setStatus("complete");
        toast(`AI provider failed — used static engine instead`, { icon: "⚠️" });
      } catch {
        setStatus("error");
        toast.error("Audit failed. Please try again.");
      }
    }
  };

  const loadSample = (key: keyof typeof SAMPLE_CONTRACTS) => {
    const names = { reentrancy: "VulnerableVault", overflow: "TokenSale", safe: "SecureVault" };
    setCode(SAMPLE_CONTRACTS[key]);
    setContractName(names[key]);
    setStatus("idle");
    setResult(null);
  };

  const recCfg = result ? RECOMMENDATION_CONFIG[result.recommendation] : null;

  // Theme-dependent styles
  const pageBg      = isDark ? "#0a0a0f" : "#f1f5f9";
  const cardBg      = isDark ? "#111118" : "#ffffff";
  const cardBorder  = isDark ? "#1c1c2e" : "#e2e8f0";
  const headerBg    = isDark ? "#0d0d16" : "#f8fafc";
  const editorBg    = isDark ? "#0a0a10" : "#fafafa";
  const codeColor   = isDark ? "#c9d1d9" : "#24292f";
  const lineNumCol  = isDark ? "#2d2d4e" : "#d1d5db";
  const inputBg     = isDark ? "#0d0d16" : "#f8fafc";
  const inputBorder = isDark ? "#2d2d4e" : "#d1d5db";
  const inputColor  = isDark ? "#e2e8f0" : "#0f172a";
  const subText     = isDark ? "#64748b" : "#64748b";
  const tabBorder   = isDark ? "#1a1a2e" : "#e2e8f0";
  const providerInfo = AI_PROVIDERS.find(p => p.id === (result?.provider || selectedProvider));

  return (
    <div className="p-6 space-y-4" style={{ background: pageBg }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
            AI Smart Contract Scanner
          </h1>
          <p className="text-sm mt-0.5" style={{ color: subText }}>
            Powered by 5 AI models — paste Solidity code for instant security analysis
          </p>
        </div>
        <div className="flex gap-2">
          {(["reentrancy", "overflow", "safe"] as const).map((k) => (
            <button key={k} onClick={() => loadSample(k)}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: isDark ? "#1a1a2e" : "#f1f5f9", color: isDark ? "#94a3b8" : "#64748b", border: `1px solid ${isDark ? "#2d2d4e" : "#e2e8f0"}` }}>
              {k === "reentrancy" ? "Reentrancy" : k === "overflow" ? "Overflow" : "Safe"} Sample
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Code Editor */}
        <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, minHeight: 520 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: cardBorder, background: headerBg }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
              </div>
              <span className="text-xs font-mono ml-2" style={{ color: "#475569" }}>
                {contractName || "contract"}.sol
              </span>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(code); toast.success("Copied!"); }}
              className="p-1.5 rounded transition-colors" style={{ color: "#475569" }}>
              <Copy size={12} />
            </button>
          </div>
          <div className="relative flex" style={{ background: editorBg }}>
            <div className="px-3 py-4 text-right select-none"
              style={{ color: lineNumCol, fontSize: 11, fontFamily: "JetBrains Mono, monospace", lineHeight: "1.7", minWidth: 36 }}>
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              className="flex-1 py-4 pr-4 resize-none text-xs leading-relaxed focus:outline-none"
              style={{ background: "transparent", color: codeColor, caretColor: "#a78bfa", minHeight: 440, fontFamily: "JetBrains Mono, monospace", lineHeight: "1.7" }}
              value={code}
              onChange={e => { setCode(e.target.value); setStatus("idle"); setResult(null); }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Config */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
              <FileCode size={14} style={{ color: "#8b5cf6" }} /> Audit Configuration
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: subText }}>Contract Name</label>
                <input value={contractName} onChange={e => setContractName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg focus:outline-none"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: subText }}>Network</label>
                <select value={network} onChange={e => setNetwork(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg focus:outline-none"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputColor }}>
                  <option value="sepolia">Sepolia Testnet</option>
                  <option value="mainnet">Mainnet</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                </select>
              </div>
            </div>

            {/* AI Provider selector */}
            <ProviderSelector
              selected={selectedProvider}
              onChange={setSelectedProvider}
              backendOnline={backendOnline}
              availableProviders={availableProviders}
            />

            <button onClick={handleScan} disabled={status === "scanning"}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-60"
              style={{
                background: status === "scanning" ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white",
                boxShadow: status === "scanning" ? "none" : "0 4px 20px rgba(124,58,237,0.3)",
              }}>
              {status === "scanning"
                ? <><RefreshCw size={15} className="animate-spin" /> Scanning with {AI_PROVIDERS.find(p => p.id === selectedProvider)?.icon}...</>
                : <><Zap size={15} /> Run AI Audit</>
              }
            </button>
          </div>

          {/* Results */}
          <div className="rounded-xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, minHeight: 360 }}>
            {status === "idle" && !result && (
              <div className="flex flex-col items-center justify-center h-72 space-y-3" style={{ color: "#475569" }}>
                <Search size={32} style={{ opacity: 0.3 }} />
                <p className="text-sm">Select an AI engine and run audit</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {AI_PROVIDERS.slice(0, 5).map(p => (
                    <span key={p.id} className="text-xs px-2 py-1 rounded-full"
                      style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}>
                      {p.icon} {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {status === "scanning" && <ScanningAnimation provider={selectedProvider} />}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center h-72 space-y-3">
                <XCircle size={32} style={{ color: "#ef4444" }} />
                <p className="text-sm font-semibold" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>Audit Failed</p>
                <p className="text-xs" style={{ color: "#64748b" }}>Check your API keys and try again</p>
              </div>
            )}

            {status === "complete" && result && (
              <div>
                {/* Score & Recommendation */}
                <div className="p-4 border-b" style={{ borderColor: cardBorder }}>
                  <div className="flex items-center gap-6">
                    <RiskGauge score={result.riskScore} />
                    <div className="flex-1">
                      {/* Provider badge */}
                      {providerInfo && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-xs">{providerInfo.icon}</span>
                          <span className="text-xs font-medium" style={{ color: providerInfo.color }}>
                            Analyzed by {providerInfo.name}
                          </span>
                        </div>
                      )}
                      {recCfg && (
                        <div className="rounded-lg p-3 mb-3" style={{ background: recCfg.bg, border: `1px solid ${recCfg.border}` }}>
                          <div className="flex items-center gap-2 mb-1">
                            <recCfg.icon size={14} style={{ color: recCfg.color }} />
                            <span className="text-xs font-bold tracking-wide" style={{ color: recCfg.color }}>{recCfg.label}</span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>{recCfg.desc}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { label: "Issues", value: result.vulnerabilities.length },
                          { label: "Lines",  value: result.linesScanned },
                          { label: "Time",   value: `${(result.scanTime / 1000).toFixed(1)}s` }
                        ].map(s => (
                          <div key={s.label} className="rounded-lg p-2" style={{ background: isDark ? "#0d0d16" : "#f8fafc", border: `1px solid ${cardBorder}` }}>
                            <div className="text-base font-bold" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>{s.value}</div>
                            <div className="text-xs" style={{ color: subText }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b" style={{ borderColor: tabBorder }}>
                  {(["vulnerabilities", "gas", "summary"] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className="px-4 py-2.5 text-xs font-medium transition-colors capitalize"
                      style={{
                        color: activeTab === t ? "#a78bfa" : subText,
                        borderBottom: activeTab === t ? "2px solid #8b5cf6" : "2px solid transparent",
                      }}>
                      {t === "vulnerabilities" ? `Vulns (${result.vulnerabilities.length})` : t === "gas" ? "Gas Analysis" : "Summary"}
                    </button>
                  ))}
                </div>

                <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 320 }}>
                  {activeTab === "vulnerabilities" && (
                    result.vulnerabilities.length === 0
                      ? (
                        <div className="flex flex-col items-center py-8 gap-2">
                          <CheckCircle size={28} style={{ color: "#22c55e" }} />
                          <p className="text-sm font-semibold" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>No vulnerabilities found!</p>
                          <p className="text-xs" style={{ color: "#64748b" }}>Contract passed all security checks.</p>
                        </div>
                      )
                      : result.vulnerabilities.map(v => <VulnCard key={v.id} vuln={v} />)
                  )}
                  {activeTab === "gas" && (
                    <div className="space-y-3">
                      <div className="rounded-lg p-3 flex items-center justify-between"
                        style={{ background: isDark ? "#0d0d16" : "#f8fafc", border: `1px solid ${cardBorder}` }}>
                        <div className="flex items-center gap-2">
                          <Clock size={13} style={{ color: "#8b5cf6" }} />
                          <span className="text-xs" style={{ color: subText }}>Estimated Deployment Gas</span>
                        </div>
                        <span className="text-sm font-bold font-mono" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
                          {result.gasAnalysis.estimatedGas}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: subText }}>
                          Optimization Suggestions
                        </div>
                        {result.gasAnalysis.optimizationSuggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 py-2 text-xs border-b"
                            style={{ color: isDark ? "#94a3b8" : "#64748b", borderColor: tabBorder }}>
                            <ChevronRight size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#8b5cf6" }} />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === "summary" && (
                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed" style={{ color: isDark ? "#94a3b8" : "#64748b" }}>
                        {result.summary}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["critical", "high", "medium", "low"] as const).map(sev => {
                          const count = result.vulnerabilities.filter(v => v.severity === sev).length;
                          const cfg = SEVERITY_CONFIG[sev];
                          return (
                            <div key={sev} className="rounded-lg p-3 flex items-center justify-between"
                              style={{ background: isDark ? "#0d0d16" : "#f8fafc", border: `1px solid ${cardBorder}` }}>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                              <span className="text-lg font-bold" style={{ color: cfg.color }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
