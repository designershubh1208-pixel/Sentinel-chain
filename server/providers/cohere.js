import { buildAuditPrompt, parseAIResponse } from "../utils/prompt.js";

export async function analyzeWithCohere(code, contractName, network) {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("COHERE_API_KEY not set");

  const response = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "command-r-plus-08-2024",
      messages: [
        {
          role: "system",
          content:
            "You are Sentinel-Chain, a world-class Solidity smart contract security auditor. Analyze the given Solidity code for vulnerabilities and output a structured JSON audit report. Always respond with valid JSON only, no markdown, no code fences.",
        },
        {
          role: "user",
          content: buildAuditPrompt(code, contractName, network),
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cohere API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.message?.content?.[0]?.text || data.text;
  return parseAIResponse(content, "cohere");
}
