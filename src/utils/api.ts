import type { AuditResult } from "../types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

// ─── Audit ────────────────────────────────────────────────────────────────────
export async function runAIAudit(
  code: string,
  contractName: string,
  network: string,
  provider: string
): Promise<AuditResult & { provider?: string }> {
  const res = await fetch(`${BASE}/api/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, contractName, network, provider }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.result;
}

// ─── Providers ────────────────────────────────────────────────────────────────
export async function fetchProviders(): Promise<AIProvider[]> {
  try {
    const res = await fetch(`${BASE}/api/providers`);
    const data = await res.json();
    return data.providers || [];
  } catch {
    return [
      { id: "openai",  name: "GPT-4o",         icon: "🤖", available: false },
      { id: "mistral", name: "Mistral Large",   icon: "🌊", available: false },
      { id: "gemini",  name: "Gemini 1.5 Pro",  icon: "💎", available: false },
      { id: "cohere",  name: "Cohere Command",  icon: "🔮", available: false },
      { id: "groq",    name: "Groq LLaMA-3",    icon: "⚡", available: false },
    ];
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<{ ok: boolean; providers: Record<string, boolean> }> {
  try {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();
    return { ok: true, providers: data.providers || {} };
  } catch {
    return { ok: false, providers: {} };
  }
}

// ─── Log audit to backend ────────────────────────────────────────────────────
export async function logAudit(entry: {
  contractName: string;
  network: string;
  riskScore: number;
  severity: string;
  vulnerabilityCount: number;
  recommendation: string;
  provider: string;
}) {
  try {
    await fetch(`${BASE}/api/audit/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
  } catch {
    // silently fail — log is non-critical
  }
}
