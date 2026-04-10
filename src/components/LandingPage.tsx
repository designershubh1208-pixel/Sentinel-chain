import { useEffect, useRef, useState } from "react";
import {
  Shield, Zap, Search, Lock, ArrowRight, ChevronDown,
  Activity, AlertTriangle, CheckCircle, Code2, Globe,
  Eye, Terminal, Cpu, GitBranch, Star, TrendingUp, Sun, Moon
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface LandingPageProps {
  onEnterApp: () => void;
}

/* ── Animated counter ─────────────────────────────────────────── */
function CountUp({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
          else setCount(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

/* ── Floating orb ─────────────────────────────────────────────── */
function Orb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} style={style} />;
}

/* ── Grid cell (particle) ─────────────────────────────────────── */
function HeroGrid() {
  const { isDark } = useTheme();
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none"
              stroke={isDark ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.12)"}
              strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

/* ── Scanning beam ────────────────────────────────────────────── */
function ScanBeam() {
  const { isDark } = useTheme();
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${isDark ? "rgba(139,92,246,0.6)" : "rgba(124,58,237,0.5)"}, transparent)`,
          animation: "scanBeam 4s ease-in-out infinite",
          top: 0,
        }}
      />
    </div>
  );
}

/* ── Terminal card ────────────────────────────────────────────── */
function TerminalCard() {
  const { isDark } = useTheme();
  const lines = [
    { t: 0, text: "$ sentinel-chain audit ./MyToken.sol", color: isDark ? "#a78bfa" : "#7c3aed" },
    { t: 400, text: "⠋ Initializing AI audit engine...", color: isDark ? "#94a3b8" : "#64748b" },
    { t: 900, text: "⠸ Scanning 247 lines of Solidity...", color: isDark ? "#94a3b8" : "#64748b" },
    { t: 1400, text: "⚠  CRITICAL: Reentrancy at line 42", color: "#ef4444" },
    { t: 1900, text: "⚠  HIGH: Missing access control L89", color: "#f97316" },
    { t: 2300, text: "ℹ  Medium: Integer overflow risk L156", color: "#eab308" },
    { t: 2700, text: "✓  Risk Score: 78/100 → BLOCKED", color: "#ef4444" },
    { t: 3100, text: "✓  Firewall deployed. Admin notified.", color: "#22c55e" },
  ];

  const [visible, setVisible] = useState<number[]>([]);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    setVisible([]);
    const timers = lines.map((l, i) =>
      setTimeout(() => setVisible(v => [...v, i]), l.t)
    );
    const reset = setTimeout(() => setLoop(n => n + 1), 4500);
    return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
  }, [loop]);

  const bg = isDark ? "#0d0d16" : "#f8fafc";
  const border = isDark ? "#1e1e3a" : "#e2e8f0";
  const dot1 = "#ef4444"; const dot2 = "#eab308"; const dot3 = "#22c55e";

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl font-mono text-sm"
      style={{ background: bg, border: `1px solid ${border}`, minWidth: 340 }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: border }}>
        <div className="w-3 h-3 rounded-full" style={{ background: dot1 }} />
        <div className="w-3 h-3 rounded-full" style={{ background: dot2 }} />
        <div className="w-3 h-3 rounded-full" style={{ background: dot3 }} />
        <span className="ml-2 text-xs" style={{ color: isDark ? "#475569" : "#94a3b8" }}>sentinel-chain — audit</span>
      </div>
      <div className="p-5 space-y-1.5 min-h-[200px]">
        {lines.map((l, i) => (
          <div key={`${loop}-${i}`}
            className="transition-all duration-300"
            style={{
              color: l.color,
              opacity: visible.includes(i) ? 1 : 0,
              transform: visible.includes(i) ? "translateY(0)" : "translateY(6px)",
            }}>
            {l.text}
            {i === visible[visible.length - 1] && visible.length < lines.length && (
              <span className="cursor-blink ml-1">▋</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feature card ─────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon, title, desc, color, delay
}: { icon: any; title: string; desc: string; color: string; delay: number }) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bg = isDark ? "#111118" : "#ffffff";
  const border = hov ? color + "50" : (isDark ? "#1c1c2e" : "#e2e8f0");

  return (
    <div ref={ref}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-2xl p-6 transition-all duration-500 cursor-default"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
        boxShadow: hov ? `0 20px 60px ${color}15` : "none",
      }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300"
        style={{ background: `${color}15`, transform: hov ? "scale(1.1) rotate(-5deg)" : "scale(1)" }}>
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="font-bold text-base mb-2" style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: isDark ? "#64748b" : "#64748b" }}>{desc}</p>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({ label, value, suffix, icon: Icon, color }: {
  label: string; value: number; suffix: string; icon: any; color: string
}) {
  const { isDark } = useTheme();
  const bg = isDark ? "#111118" : "#ffffff";
  const border = isDark ? "#1c1c2e" : "#e2e8f0";
  return (
    <div className="rounded-2xl p-6 text-center"
      style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ background: `${color}15` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="text-3xl font-black mb-1" style={{
        background: `linear-gradient(135deg, ${color}, ${color}aa)`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
      }}>
        <CountUp target={value} suffix={suffix} />
      </div>
      <div className="text-xs font-medium" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>{label}</div>
    </div>
  );
}

/* ── How it works step ───────────────────────────────────────── */
function StepCard({ step, title, desc, icon: Icon, color, delay }: {
  step: number; title: string; desc: string; icon: any; color: string; delay: number
}) {
  const { isDark } = useTheme();
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bg = isDark ? "#111118" : "#ffffff";
  const border = isDark ? "#1c1c2e" : "#e2e8f0";

  return (
    <div ref={ref} className="relative flex gap-5 transition-all duration-700"
      style={{ opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-30px)", transitionDelay: `${delay}ms` }}>
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
          style={{ background: `${color}20`, color, border: `2px solid ${color}40` }}>
          {step}
        </div>
        {step < 4 && <div className="flex-1 w-px mt-2" style={{ background: `${color}30`, minHeight: 40 }} />}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon size={14} style={{ color }} />
          </div>
          <h4 className="font-bold text-base" style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>{title}</h4>
        </div>
        <div className="rounded-xl p-4" style={{ background: bg, border: `1px solid ${border}` }}>
          <p className="text-sm leading-relaxed" style={{ color: isDark ? "#64748b" : "#64748b" }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ── AI Provider badge ────────────────────────────────────────── */
function AIBadge({ icon, name, model, color }: { icon: string; name: string; model: string; color: string }) {
  const { isDark } = useTheme();
  const [hov, setHov] = useState(false);
  const bg = isDark ? "#111118" : "#ffffff";
  const border = isDark ? "#1c1c2e" : "#e2e8f0";
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 cursor-default"
      style={{
        background: bg, border: `1px solid ${hov ? color + "60" : border}`,
        boxShadow: hov ? `0 8px 30px ${color}20` : "none",
        transform: hov ? "translateY(-2px)" : "translateY(0)"
      }}>
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xs font-bold" style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>{name}</div>
        <div className="text-xs" style={{ color: isDark ? "#475569" : "#94a3b8" }}>{model}</div>
      </div>
    </div>
  );
}

/* ── Floating vulnerability ticker ───────────────────────────── */
function VulnTicker() {
  const { isDark } = useTheme();
  const items = [
    { type: "CRITICAL", label: "Reentrancy", color: "#ef4444" },
    { type: "HIGH", label: "Access Control", color: "#f97316" },
    { type: "MEDIUM", label: "TX Origin", color: "#eab308" },
    { type: "HIGH", label: "Integer Overflow", color: "#f97316" },
    { type: "LOW", label: "Gas Griefing", color: "#22c55e" },
    { type: "CRITICAL", label: "Flash Loan Vector", color: "#ef4444" },
    { type: "HIGH", label: "Delegate Call", color: "#f97316" },
    { type: "MEDIUM", label: "Timestamp Dep.", color: "#eab308" },
  ];
  const all = [...items, ...items];
  const bg = isDark ? "#111118" : "#ffffff";
  const border = isDark ? "#1c1c2e" : "#e2e8f0";

  return (
    <div className="overflow-hidden relative" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
      <div className="flex gap-3 animate-ticker" style={{ width: "max-content" }}>
        {all.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full flex-shrink-0"
            style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span className="text-xs font-bold" style={{ color: item.color }}>{item.type}</span>
            <span className="text-xs" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════════════════════════ */
export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const { isDark, toggle, theme } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const bg = isDark ? "#07070f" : "#f8fafc";
  const text = isDark ? "#f1f5f9" : "#0f172a";
  const sub = isDark ? "#94a3b8" : "#64748b";

  return (
    <div style={{ background: bg, color: text, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      {/* ── Theme Toggle (fixed) ───────────────────────────── */}
      <button onClick={toggle}
        className="fixed top-5 right-5 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: isDark ? "#111118" : "#ffffff",
          border: `1px solid ${isDark ? "#2d2d4e" : "#e2e8f0"}`,
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.1)",
          color: isDark ? "#a78bfa" : "#7c3aed",
        }}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* ══════════════════════════════════════════════════════
          HERO SECTION
      ═════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <HeroGrid />
        <ScanBeam />

        {/* Orbs */}
        <Orb style={{ width: 600, height: 600, top: -200, left: -200,
          background: isDark ? "radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)" : "radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)" }} />
        <Orb style={{ width: 500, height: 500, bottom: -150, right: -100,
          background: isDark ? "radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)" : "radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)" }} />
        <Orb style={{ width: 300, height: 300, top: "30%", right: "20%",
          background: isDark ? "radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)" : "radial-gradient(circle, rgba(239,68,68,0.04), transparent 70%)" }} />

        {/* Parallax shield */}
        <div className="absolute opacity-5 pointer-events-none"
          style={{ right: "5%", top: "10%", transform: `translateY(${scrollY * 0.2}px)` }}>
          <Shield size={300} style={{ color: "#7c3aed" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left: text */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fadeInDown"
                style={{
                  background: isDark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.08)",
                  border: `1px solid ${isDark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)"}`,
                }}>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold" style={{ color: isDark ? "#a78bfa" : "#7c3aed" }}>
                  AI-Powered · Real-Time · On-Chain Protection
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6 animate-fadeInUp"
                style={{ letterSpacing: "-0.03em" }}>
                <span style={{ color: text }}>Smart Contract</span>
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #7c3aed, #2563eb, #7c3aed)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradientShift 4s ease infinite",
                }}>
                  Security, Reimagined
                </span>
              </h1>

              <p className="text-lg lg:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fadeInUp"
                style={{ color: sub, animationDelay: "0.2s" }}>
                Sentinel-Chain uses 5 cutting-edge AI models to detect vulnerabilities in seconds —
                before and after deployment. The first system that actively enforces security at runtime.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fadeInUp"
                style={{ animationDelay: "0.4s" }}>
                <button onClick={onEnterApp}
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                    color: "white",
                    boxShadow: "0 8px 40px rgba(124,58,237,0.4)",
                  }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, #6d28d9, #1d4ed8)" }} />
                  <Shield size={18} className="relative z-10" />
                  <span className="relative z-10">Launch Dashboard</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>

                <a href="#features"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    color: text,
                  }}>
                  <Play size={16} />
                  See How It Works
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start animate-fadeInUp"
                style={{ animationDelay: "0.6s" }}>
                {[
                  { icon: Shield, label: "247 Audits Done" },
                  { icon: Star, label: "5 AI Engines" },
                  { icon: Globe, label: "Multi-chain" },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Icon size={14} style={{ color: "#7c3aed" }} />
                    <span className="text-xs font-medium" style={{ color: sub }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: terminal */}
            <div className="flex-shrink-0 animate-fadeInRight" style={{ animationDelay: "0.3s" }}>
              <div style={{ transform: `translateY(${Math.sin(Date.now() / 2000) * 8}px)` }}>
                <TerminalCard />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a href="#stats"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer"
          style={{ color: sub }}>
          <span className="text-xs font-medium">Scroll to explore</span>
          <ChevronDown size={20} />
        </a>
      </section>

      {/* ══════════════════════════════════════════════════════
          VULNERABILITY TICKER
      ═════════════════════════════════════════════════════ */}
      <div className="py-4" style={{ borderTop: `1px solid ${isDark ? "#1c1c2e" : "#e2e8f0"}`, borderBottom: `1px solid ${isDark ? "#1c1c2e" : "#e2e8f0"}` }}>
        <VulnTicker />
      </div>

      {/* ══════════════════════════════════════════════════════
          STATS
      ═════════════════════════════════════════════════════ */}
      <section id="stats" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Smart Contracts Audited" value={2400} suffix="+" icon={Shield} color="#7c3aed" />
            <StatCard label="Vulnerabilities Found" value={18300} suffix="+" icon={AlertTriangle} color="#ef4444" />
            <StatCard label="Contracts Blocked" value={312} suffix="" icon={Lock} color="#f97316" />
            <StatCard label="ETH Secured" value={94} suffix="M+" icon={TrendingUp} color="#22c55e" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES
      ═════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: isDark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.08)",
                border: `1px solid ${isDark ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.2)"}`,
              }}>
              <Cpu size={12} style={{ color: "#7c3aed" }} />
              <span className="text-xs font-semibold" style={{ color: "#7c3aed" }}>Core Capabilities</span>
            </div>
            <h2 className="text-4xl font-black mb-4" style={{ color: text, letterSpacing: "-0.02em" }}>
              Three Layers of Defense
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: sub }}>
              Not just a scanner — a full security lifecycle platform that protects before, during, and after deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={Search} title="AI Smart Contract Scanner" color="#7c3aed" delay={0}
              desc="Five AI models (GPT-4o, Mistral, Gemini, Cohere, Groq) cross-analyze your Solidity code for reentrancy, overflow, access control bugs, and business logic flaws." />
            <FeatureCard icon={Activity} title="Real-Time Transaction Guard" color="#2563eb" delay={100}
              desc="Monitors live mempool transactions and flags suspicious interactions before they execute on-chain — millisecond response time." />
            <FeatureCard icon={Zap} title="Smart Contract Firewall" color="#f97316" delay={200}
              desc="Proxy-based architecture wraps deployed contracts. Can pause, rate-limit, or block specific functions based on AI risk assessment." />
            <FeatureCard icon={Lock} title="On-Chain Circuit Breaker" color="#ef4444" delay={300}
              desc="When risk exceeds your threshold, automated circuit breakers halt interactions, notify admins, and generate auto-patch suggestions." />
            <FeatureCard icon={Eye} title="Adversarially Robust AI" color="#22c55e" delay={400}
              desc="Prompt injection filters, rule-based override layers, and sandboxed AI execution ensure attackers can't manipulate the audit engine itself." />
            <FeatureCard icon={GitBranch} title="Multi-AI Consensus" color="#ec4899" delay={500}
              desc="Runs your contract through 5 different AI providers and cross-validates findings to minimize false positives and maximize coverage." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ═════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: isDark ? "rgba(37,99,235,0.1)" : "rgba(37,99,235,0.08)",
                border: `1px solid ${isDark ? "rgba(37,99,235,0.25)" : "rgba(37,99,235,0.2)"}`,
              }}>
              <Terminal size={12} style={{ color: "#2563eb" }} />
              <span className="text-xs font-semibold" style={{ color: "#2563eb" }}>Workflow</span>
            </div>
            <h2 className="text-4xl font-black mb-4" style={{ color: text, letterSpacing: "-0.02em" }}>How It Works</h2>
            <p className="text-lg" style={{ color: sub }}>From code submission to on-chain protection in seconds</p>
          </div>

          <div className="max-w-xl mx-auto">
            <StepCard step={1} icon={Code2} title="Submit Solidity Code" color="#7c3aed" delay={0}
              desc="Paste your smart contract into the editor. Sentinel-Chain accepts any Solidity 0.4+ code and instantly begins multi-layer analysis." />
            <StepCard step={2} icon={Cpu} title="AI Multi-Engine Analysis" color="#2563eb" delay={150}
              desc="Five AI providers simultaneously analyze your code. GPT-4o, Mistral Large, Gemini 1.5 Pro, Cohere Command R+, and Groq LLaMA-3 each provide independent assessments." />
            <StepCard step={3} icon={AlertTriangle} title="Risk Score & Classification" color="#f97316" delay={300}
              desc="Findings are aggregated, deduplicated, and scored 0–100. Each vulnerability gets a severity rating, SWC ID, confidence score, and concrete fix." />
            <StepCard step={4} icon={Shield} title="Deploy or Block" color="#22c55e" delay={450}
              desc="Score 0–30: Safe to deploy. Score 31–70: Deploy with firewall proxy. Score 71–100: Deployment blocked. The circuit breaker activates automatically." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          AI PROVIDERS
      ═════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: isDark ? "rgba(236,72,153,0.1)" : "rgba(236,72,153,0.08)",
                border: `1px solid ${isDark ? "rgba(236,72,153,0.25)" : "rgba(236,72,153,0.2)"}`,
              }}>
              <Star size={12} style={{ color: "#ec4899" }} />
              <span className="text-xs font-semibold" style={{ color: "#ec4899" }}>AI Providers</span>
            </div>
            <h2 className="text-4xl font-black mb-4" style={{ color: text, letterSpacing: "-0.02em" }}>
              5 AI Engines, Zero Blind Spots
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: sub }}>
              Each model brings unique strengths. Together, they catch what no single model can.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
            <AIBadge icon="🤖" name="GPT-4o" model="OpenAI" color="#22c55e" />
            <AIBadge icon="🌊" name="Mistral Large" model="Mistral AI" color="#2563eb" />
            <AIBadge icon="💎" name="Gemini 1.5 Pro" model="Google AI" color="#7c3aed" />
            <AIBadge icon="🔮" name="Command R+" model="Cohere" color="#ec4899" />
            <AIBadge icon="⚡" name="LLaMA-3.3 70B" model="Groq" color="#f97316" />
          </div>

          {/* Consensus visualization */}
          <div className="rounded-2xl p-6 text-center"
            style={{ background: isDark ? "rgba(124,58,237,0.05)" : "rgba(124,58,237,0.04)", border: `1px solid ${isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.12)"}` }}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {["🤖", "🌊", "💎", "🔮", "⚡"].map((icon, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-xl">{icon}</span>
                  {i < 4 && <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, #7c3aed50, #2563eb50)" }} />}
                </div>
              ))}
              <ArrowRight size={16} style={{ color: "#7c3aed" }} />
              <div className="px-3 py-1.5 rounded-lg font-bold text-sm"
                style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
                Consensus Report
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: sub }}>All 5 models run in parallel → findings are merged, deduplicated, and confidence-weighted</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA SECTION
      ═════════════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative overflow-hidden">
        <Orb style={{ width: 500, height: 500, top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          background: isDark ? "radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)" : "radial-gradient(circle, rgba(124,58,237,0.1), transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8 mx-auto"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", boxShadow: "0 20px 60px rgba(124,58,237,0.4)" }}>
            <Shield size={36} className="text-white" />
          </div>

          <h2 className="text-5xl lg:text-6xl font-black mb-6" style={{ color: text, letterSpacing: "-0.03em" }}>
            Secure Your Contracts
            <br />
            <span style={{
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
            }}>Before It's Too Late</span>
          </h2>

          <p className="text-xl mb-10" style={{ color: sub }}>
            Don't be the next $60M hack. Deploy with confidence using AI-grade security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onEnterApp}
              className="group relative flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-lg overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white",
                boxShadow: "0 12px 50px rgba(124,58,237,0.5)",
              }}>
              <Shield size={20} />
              Start Free Audit
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              { icon: CheckCircle, text: "No signup required" },
              { icon: CheckCircle, text: "5 AI models" },
              { icon: CheckCircle, text: "Instant results" },
            ].map(({ icon: Icon, text: t }, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Icon size={14} style={{ color: "#22c55e" }} />
                <span className="text-sm" style={{ color: sub }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="py-8 px-6" style={{ borderTop: `1px solid ${isDark ? "#1c1c2e" : "#e2e8f0"}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: text }}>Sentinel-Chain</span>
          </div>
          <p className="text-xs" style={{ color: isDark ? "#334155" : "#94a3b8" }}>
            © 2025 Sentinel-Chain · AI Smart Contract Security Platform
          </p>
          <button onClick={onEnterApp} className="text-xs font-medium hover:underline"
            style={{ color: "#7c3aed" }}>
            Open Dashboard →
          </button>
        </div>
      </footer>

      {/* Global keyframes */}
      <style>{`
        @keyframes scanBeam {
          0%   { transform: translateY(0); opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 0.6; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% center; }
          50%  { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.7s ease forwards; }
        .animate-fadeInUp   { animation: fadeInUp 0.7s ease forwards; opacity: 0; }
        .animate-fadeInRight{ animation: fadeInRight 0.7s ease forwards; opacity: 0; }
        .animate-ticker     { animation: ticker 20s linear infinite; }
        .cursor-blink       { animation: blink 1s step-end infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
}

/* ── small helper (not in lucide) ── */
function Play({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}
