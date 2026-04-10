import { useState } from "react";
import { Settings, Shield, Bell, Key, Globe, Save, RefreshCw, Eye, EyeOff, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const TABS = ["General", "Security", "Notifications", "API Keys", "Network"];

export default function SettingsPage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("General");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    threshold: 70,
    autoBlock: true,
    autoFirewall: true,
    emailAlerts: true,
    slackAlerts: false,
    discordAlerts: true,
    onChainAlerts: false,
    apiKey: "sk-sentinel-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/your-api-key",
    network: "Sepolia",
    scanDepth: "deep",
    confidenceMin: 70,
    gasLimit: 500000,
    promptInjectionFilter: true,
    sandboxed: true,
    ruleOverride: true,
  });

  // ── Theme tokens ──────────────────────────────────────────
  const pageBg    = isDark ? "#0a0a0f"  : "#f1f5f9";
  const cardBg    = isDark ? "#111118"  : "#ffffff";
  const cardBd    = isDark ? "#1c1c2e"  : "#e2e8f0";
  const divBd     = isDark ? "#1a1a2e"  : "#f1f5f9";
  const h1Color   = isDark ? "#ffffff"  : "#0f172a";
  const h2Color   = isDark ? "#e2e8f0"  : "#1e293b";
  const subColor  = isDark ? "#64748b"  : "#64748b";
  const bodyText  = isDark ? "#e2e8f0"  : "#1e293b";
  const mutedText = isDark ? "#94a3b8"  : "#475569";
  const dimText   = isDark ? "#64748b"  : "#94a3b8";
  const inputBg   = isDark ? "#0d0d16"  : "#f8fafc";
  const inputBd   = isDark ? "#2d2d4e"  : "#e2e8f0";
  const inputTxt  = isDark ? "#e2e8f0"  : "#0f172a";
  const tabBd     = isDark ? "#1a1a2e"  : "#e2e8f0";
  const btnBg     = isDark ? "#1a1a2e"  : "#f1f5f9";
  const btnBd     = isDark ? "#2d2d4e"  : "#e2e8f0";
  const btnTxt    = isDark ? "#94a3b8"  : "#64748b";
  const warnBg    = isDark ? "rgba(234,179,8,0.06)"  : "rgba(234,179,8,0.06)";
  const warnBd    = isDark ? "rgba(234,179,8,0.2)"   : "rgba(234,179,8,0.25)";
  const successBg = isDark ? "rgba(34,197,94,0.06)"  : "rgba(34,197,94,0.06)";
  const successBd = isDark ? "rgba(34,197,94,0.15)"  : "rgba(34,197,94,0.2)";
  const badgeBg   = isDark ? "rgba(99,102,241,0.1)"  : "rgba(99,102,241,0.08)";
  const badgeTxt  = isDark ? "#818cf8"  : "#6366f1";

  const save = () => {
    setSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setSaved(false), 2500);
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings(p => ({ ...p, [key]: !p[key as keyof typeof settings] }));
  };

  const Toggle = ({ k }: { k: keyof typeof settings }) => (
    <button
      onClick={() => toggle(k)}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ background: settings[k] ? "#7c3aed" : (isDark ? "#2d2d4e" : "#cbd5e1") }}>
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: settings[k] ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );

  return (
    <div className="p-6 space-y-5 min-h-screen transition-colors duration-300" style={{ background: pageBg }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: h1Color }}>Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: subColor }}>Configure your Sentinel-Chain security preferences</p>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
          style={{
            background: saved ? "rgba(34,197,94,0.12)" : "linear-gradient(135deg, #7c3aed, #2563eb)",
            color: saved ? "#22c55e" : "white",
            border: saved ? "1px solid rgba(34,197,94,0.3)" : "none",
          }}>
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b" style={{ borderColor: tabBd }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              color: activeTab === t ? "#a78bfa" : mutedText,
              borderBottom: activeTab === t ? "2px solid #8b5cf6" : "2px solid transparent",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── General ──────────────────────────────────────── */}
      {activeTab === "General" && (
        <div className="space-y-4">
          <div className="rounded-xl p-5 space-y-4 transition-colors duration-300"
            style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
            <h2 className="text-sm font-semibold" style={{ color: h2Color }}>Audit Engine</h2>

            <div>
              <label className="block text-xs mb-2 font-medium" style={{ color: subColor }}>
                Risk Threshold for Blocking ({settings.threshold})
              </label>
              <input
                type="range" min={0} max={100}
                value={settings.threshold}
                onChange={e => setSettings(p => ({ ...p, threshold: +e.target.value }))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs mt-1">
                <span style={{ color: dimText }}>0 — Block Nothing</span>
                <span className="font-bold" style={{ color: settings.threshold >= 70 ? "#ef4444" : settings.threshold >= 40 ? "#f97316" : "#22c55e" }}>
                  Current: {settings.threshold}
                </span>
                <span style={{ color: dimText }}>100 — Block Everything</span>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-2 font-medium" style={{ color: subColor }}>Scan Depth</label>
              <select
                value={settings.scanDepth}
                onChange={e => setSettings(p => ({ ...p, scanDepth: e.target.value }))}
                className="text-sm px-3 py-2 rounded-lg focus:outline-none transition-colors"
                style={{ background: inputBg, border: `1px solid ${inputBd}`, color: inputTxt, minWidth: 220 }}>
                <option value="quick">Quick (Static only)</option>
                <option value="standard">Standard (Static + AI)</option>
                <option value="deep">Deep (Full AI + Simulation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs mb-2 font-medium" style={{ color: subColor }}>
                Minimum Confidence Threshold ({settings.confidenceMin}%)
              </label>
              <input
                type="range" min={50} max={99}
                value={settings.confidenceMin}
                onChange={e => setSettings(p => ({ ...p, confidenceMin: +e.target.value }))}
                className="w-full accent-violet-500"
              />
            </div>
          </div>

          <div className="rounded-xl p-5 space-y-1 transition-colors duration-300"
            style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: h2Color }}>Automation</h2>
            {[
              { key: "autoBlock"    as const, label: "Auto-block contracts exceeding risk threshold",         desc: "Automatically prevent deployment without manual confirmation"    },
              { key: "autoFirewall" as const, label: "Auto-attach firewall for medium-risk contracts",        desc: "Deploy circuit breaker automatically for risk scores 30–70"       },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3"
                style={{ borderBottom: `1px solid ${divBd}` }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: bodyText }}>{label}</div>
                  <div className="text-xs mt-0.5" style={{ color: subColor }}>{desc}</div>
                </div>
                <Toggle k={key} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Security ─────────────────────────────────────── */}
      {activeTab === "Security" && (
        <div className="space-y-4">
          <div className="rounded-xl p-5 space-y-1 transition-colors duration-300"
            style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: h2Color }}>
              <Shield size={14} style={{ color: "#8b5cf6" }} /> AI Security Hardening
            </h2>
            {[
              { key: "promptInjectionFilter" as const, label: "Prompt Injection Filter",      desc: "Block attempts to manipulate AI into ignoring vulnerabilities (regex + AST validation)"       },
              { key: "sandboxed"             as const, label: "Sandboxed AI Execution",       desc: "AI output is never directly executed — always validated by rule engine first"                  },
              { key: "ruleOverride"          as const, label: "Rule-Based Override Layer",    desc: "Deterministic security rules always take precedence over AI suggestions"                       },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-3"
                style={{ borderBottom: `1px solid ${divBd}` }}>
                <div className="flex-1 mr-4">
                  <div className="text-sm font-medium" style={{ color: bodyText }}>{label}</div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: subColor }}>{desc}</div>
                </div>
                <Toggle k={key} />
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 transition-colors duration-300"
            style={{ background: warnBg, border: `1px solid ${warnBd}` }}>
            <div className="flex items-start gap-2">
              <Shield size={14} style={{ color: "#eab308", marginTop: 2 }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: "#eab308" }}>Security Note</div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: mutedText }}>
                  The AI is advisory only. The rule-based override layer ensures that even if the AI model is compromised or produces incorrect results, critical security rules (reentrancy, overflow, access control) are always enforced deterministically.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications ────────────────────────────────── */}
      {activeTab === "Notifications" && (
        <div className="rounded-xl p-5 space-y-1 transition-colors duration-300"
          style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: h2Color }}>
            <Bell size={14} style={{ color: "#8b5cf6" }} /> Alert Channels
          </h2>
          {[
            { key: "emailAlerts"   as const, label: "Email Alerts",        desc: "Send audit results and critical alerts via email",            badge: "dev@example.com"   },
            { key: "slackAlerts"   as const, label: "Slack Notifications",  desc: "Post alerts to your security Slack channel",                 badge: "#security-alerts"  },
            { key: "discordAlerts" as const, label: "Discord Webhooks",     desc: "Send real-time alerts to Discord server",                    badge: "Sentinel Bot"      },
            { key: "onChainAlerts" as const, label: "On-Chain Events",      desc: "Emit events on-chain for circuit breaker triggers",          badge: "Gas cost"          },
          ].map(({ key, label, desc, badge }) => (
            <div key={key} className="flex items-center justify-between py-3"
              style={{ borderBottom: `1px solid ${divBd}` }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium" style={{ color: bodyText }}>{label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: badgeBg, color: badgeTxt }}>
                    {badge}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: subColor }}>{desc}</div>
              </div>
              <Toggle k={key} />
            </div>
          ))}
        </div>
      )}

      {/* ── API Keys ─────────────────────────────────────── */}
      {activeTab === "API Keys" && (
        <div className="space-y-4">
          <div className="rounded-xl p-5 space-y-4 transition-colors duration-300"
            style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: h2Color }}>
              <Key size={14} style={{ color: "#8b5cf6" }} /> API Configuration
            </h2>

            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: subColor }}>Sentinel API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm transition-colors"
                  style={{ background: inputBg, border: `1px solid ${inputBd}`, color: mutedText }}>
                  {showKey ? settings.apiKey : "sk-sentinel-" + "•".repeat(32)}
                </div>
                <button onClick={() => setShowKey(p => !p)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: btnBg, color: btnTxt, border: `1px solid ${btnBd}` }}>
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button onClick={() => toast.success("API key regenerated!")}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: btnBg, color: btnTxt, border: `1px solid ${btnBd}` }}>
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: subColor }}>RPC Endpoint</label>
              <input
                value={settings.rpcUrl}
                onChange={e => setSettings(p => ({ ...p, rpcUrl: e.target.value }))}
                className="w-full text-sm px-3 py-2 rounded-lg focus:outline-none font-mono transition-colors"
                style={{ background: inputBg, border: `1px solid ${inputBd}`, color: inputTxt }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Network ──────────────────────────────────────── */}
      {activeTab === "Network" && (
        <div className="rounded-xl p-5 space-y-4 transition-colors duration-300"
          style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: h2Color }}>
            <Globe size={14} style={{ color: "#8b5cf6" }} /> Network Configuration
          </h2>

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: subColor }}>Default Network</label>
            <select
              value={settings.network}
              onChange={e => setSettings(p => ({ ...p, network: e.target.value }))}
              className="text-sm px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{ background: inputBg, border: `1px solid ${inputBd}`, color: inputTxt, minWidth: 220 }}>
              {["Sepolia", "Mainnet", "Polygon", "Arbitrum", "Optimism"].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1.5 font-medium" style={{ color: subColor }}>Gas Limit Override</label>
            <input
              type="number"
              value={settings.gasLimit}
              onChange={e => setSettings(p => ({ ...p, gasLimit: +e.target.value }))}
              className="text-sm px-3 py-2 rounded-lg focus:outline-none w-52 transition-colors"
              style={{ background: inputBg, border: `1px solid ${inputBd}`, color: inputTxt }}
            />
          </div>

          <div className="rounded-lg p-3 text-xs transition-colors"
            style={{ background: successBg, border: `1px solid ${successBd}`, color: mutedText }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-semibold" style={{ color: h2Color }}>Connected: Sepolia Testnet</span>
            </div>
            Block #7,842,991 · 12 peers · 23ms latency
          </div>
        </div>
      )}
    </div>
  );
}
