import { buildAuditPrompt, parseAIResponse } from "../utils/prompt.js";

export async function analyzeWithGroq(code, contractName, network) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
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
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  return parseAIResponse(content, "groq");
}
