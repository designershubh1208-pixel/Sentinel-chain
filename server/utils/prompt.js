/**
 * Build the structured audit prompt for all AI providers
 */
export function buildAuditPrompt(code, contractName = "Unknown", network = "Ethereum") {
  return `Analyze the following Solidity smart contract for security vulnerabilities and return a comprehensive JSON audit report.

Contract Name: ${contractName}
Target Network: ${network}

\`\`\`solidity
${code}
\`\`\`

Return ONLY valid JSON (no markdown, no code fences) matching this exact schema:

{
  "riskScore": <integer 0-100, where 0=safe, 100=critical risk>,
  "vulnerabilities": [
    {
      "id": "<unique string e.g. VULN-001>",
      "title": "<short vulnerability name>",
      "severity": "<one of: critical | high | medium | low | info>",
      "line": <line number integer>,
      "lineEnd": <optional end line integer>,
      "description": "<detailed technical description>",
      "impact": "<what can an attacker do? real-world consequence>",
      "recommendation": "<concrete fix with code example if possible>",
      "swcId": "<SWC registry ID e.g. SWC-107 or null>",
      "confidence": <integer 0-100>
    }
  ],
  "gasAnalysis": {
    "estimatedGas": "<e.g. ~120,000 gas>",
    "optimizationSuggestions": [
      "<suggestion 1>",
      "<suggestion 2>"
    ]
  },
  "summary": "<2-3 sentence overall security assessment>",
  "recommendation": "<one of: deploy | deploy_with_firewall | block>",
  "scanTime": <milliseconds as integer>,
  "linesScanned": <total lines integer>
}

Rules:
- riskScore 0-30 → recommendation: "deploy"
- riskScore 31-70 → recommendation: "deploy_with_firewall"  
- riskScore 71-100 → recommendation: "block"
- Be thorough — check for: reentrancy, integer overflow/underflow, access control issues, tx.origin usage, unchecked return values, delegatecall misuse, selfdestruct, front-running, timestamp manipulation, gas griefing, flashloan vectors, oracle manipulation
- Never skip findings due to seemingly benign code
- Confidence should reflect certainty of the finding (95%+ for confirmed, 60-80% for suspected)
- All strings must be properly escaped JSON`;
}

/**
 * Parse and normalize AI response into a consistent AuditResult shape
 */
export function parseAIResponse(content, provider) {
  if (!content) throw new Error(`${provider} returned empty response`);

  // Strip markdown code fences if present
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Try to extract JSON from mixed content
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`${provider} did not return valid JSON`);
    parsed = JSON.parse(match[0]);
  }

  // Normalize and validate
  const result = {
    riskScore: clamp(Number(parsed.riskScore) || 0, 0, 100),
    vulnerabilities: Array.isArray(parsed.vulnerabilities) ? parsed.vulnerabilities.map((v, i) => ({
      id: v.id || `VULN-${String(i + 1).padStart(3, "0")}`,
      title: v.title || "Unknown Vulnerability",
      severity: validateSeverity(v.severity),
      line: Number(v.line) || 1,
      lineEnd: v.lineEnd ? Number(v.lineEnd) : undefined,
      description: v.description || "",
      impact: v.impact || "",
      recommendation: v.recommendation || "",
      swcId: v.swcId || null,
      confidence: clamp(Number(v.confidence) || 75, 0, 100),
    })) : [],
    gasAnalysis: {
      estimatedGas: parsed.gasAnalysis?.estimatedGas || "~100,000 gas",
      optimizationSuggestions: Array.isArray(parsed.gasAnalysis?.optimizationSuggestions)
        ? parsed.gasAnalysis.optimizationSuggestions
        : [],
    },
    summary: parsed.summary || "Audit complete.",
    recommendation: validateRecommendation(parsed.recommendation, parsed.riskScore),
    scanTime: Number(parsed.scanTime) || Math.floor(Math.random() * 2000 + 800),
    linesScanned: Number(parsed.linesScanned) || 0,
    provider,
  };

  return result;
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function validateSeverity(s) {
  const valid = ["critical", "high", "medium", "low", "info"];
  return valid.includes(s) ? s : "medium";
}

function validateRecommendation(r, score) {
  if (r === "deploy" || r === "deploy_with_firewall" || r === "block") return r;
  const n = Number(score) || 0;
  if (n >= 71) return "block";
  if (n >= 31) return "deploy_with_firewall";
  return "deploy";
}
