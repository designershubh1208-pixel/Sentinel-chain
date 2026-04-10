import OpenAI from "openai";
import { buildAuditPrompt, parseAIResponse } from "../utils/prompt.js";

export async function analyzeWithOpenAI(code, contractName, network) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are Sentinel-Chain, a world-class Solidity smart contract security auditor. You analyze Solidity code for vulnerabilities, provide risk scores, and output structured JSON audit reports. Be thorough, precise, and never ignore potential vulnerabilities. Always respond with valid JSON only.",
      },
      {
        role: "user",
        content: buildAuditPrompt(code, contractName, network),
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  return parseAIResponse(content, "openai");
}
