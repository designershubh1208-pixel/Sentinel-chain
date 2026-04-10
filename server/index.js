import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeWithOpenAI } from "./providers/openai.js";
import { analyzeWithMistral } from "./providers/mistral.js";
import { analyzeWithGemini } from "./providers/gemini.js";
import { analyzeWithCohere } from "./providers/cohere.js";
import { analyzeWithGroq } from "./providers/groq.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3001;

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    providers: {
      openai: !!process.env.OPENAI_API_KEY,
      mistral: !!process.env.MISTRAL_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      cohere: !!process.env.COHERE_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
    },
  });
});

// ─── Main audit endpoint ──────────────────────────────────────────────────────
app.post("/api/audit", async (req, res) => {
  const { code, contractName, network, provider = "openai" } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No Solidity code provided." });
  }

  // Prompt injection guard
  const injectionPatterns = [
    /ignore\s+(all\s+)?vulnerabilit/i,
    /this\s+is\s+safe\s+code/i,
    /override\s+(security|audit)/i,
    /pretend\s+there\s+(are\s+)?no/i,
    /do\s+not\s+(report|flag)/i,
    /forget\s+previous\s+instructions/i,
  ];
  for (const p of injectionPatterns) {
    if (p.test(code)) {
      return res.status(400).json({
        error: "Prompt injection attempt detected. Code rejected.",
        injectionDetected: true,
      });
    }
  }

  try {
    let result;
    switch (provider) {
      case "mistral":
        result = await analyzeWithMistral(code, contractName, network);
        break;
      case "gemini":
        result = await analyzeWithGemini(code, contractName, network);
        break;
      case "cohere":
        result = await analyzeWithCohere(code, contractName, network);
        break;
      case "groq":
        result = await analyzeWithGroq(code, contractName, network);
        break;
      default:
        result = await analyzeWithOpenAI(code, contractName, network);
    }
    res.json({ success: true, provider, result });
  } catch (err) {
    console.error(`[${provider}] audit error:`, err?.message || err);
    res.status(500).json({
      error: err?.message || "AI provider failed. Falling back to static analysis.",
      provider,
    });
  }
});

// ─── Provider status ──────────────────────────────────────────────────────────
app.get("/api/providers", (_req, res) => {
  res.json({
    providers: [
      { id: "openai",  name: "GPT-4o",          icon: "🤖", available: !!process.env.OPENAI_API_KEY },
      { id: "mistral", name: "Mistral Large",    icon: "🌊", available: !!process.env.MISTRAL_API_KEY },
      { id: "gemini",  name: "Gemini 1.5 Pro",  icon: "💎", available: !!process.env.GEMINI_API_KEY },
      { id: "cohere",  name: "Cohere Command",   icon: "🔮", available: !!process.env.COHERE_API_KEY },
      { id: "groq",    name: "Groq LLaMA-3",     icon: "⚡", available: !!process.env.GROQ_API_KEY },
    ],
  });
});

// ─── Audit history (in-memory for demo) ──────────────────────────────────────
const auditLog = [];

app.post("/api/audit/log", (req, res) => {
  const entry = { ...req.body, id: `AUD-${Date.now()}`, timestamp: new Date().toISOString() };
  auditLog.unshift(entry);
  if (auditLog.length > 200) auditLog.pop();
  res.json({ success: true, entry });
});

app.get("/api/audit/history", (_req, res) => {
  res.json({ history: auditLog });
});

app.listen(PORT, () => console.log(`✅ Sentinel-Chain backend running on port ${PORT}`));
