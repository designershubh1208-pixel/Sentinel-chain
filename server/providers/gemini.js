import { buildAuditPrompt, parseAIResponse } from "../utils/prompt.js";

export async function analyzeWithGemini(code, contractName, network) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const prompt = buildAuditPrompt(code, contractName, network);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "You are Sentinel-Chain, a world-class Solidity smart contract security auditor. Analyze the given Solidity code for vulnerabilities and output a structured JSON audit report. Always respond with valid JSON only.\n\n" +
                  prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return parseAIResponse(content, "gemini");
}
