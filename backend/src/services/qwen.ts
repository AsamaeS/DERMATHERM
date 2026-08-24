// ================================================================
// DERMATHERM BACKEND — Qwen (Featherless) Integration
// Scientific literature extraction service
// ================================================================

import OpenAI from "openai";
import type { LiteratureEvidence } from "../types.js";

const client = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY,
  baseURL: "https://api.featherless.ai/v1",
});

const EXTRACTION_SYSTEM_PROMPT = `You are a scientific literature extraction assistant for the Dermatherm research platform.

Your mission: Extract numerical material property data from academic papers with absolute precision.

CRITICAL RULES:
1. NEVER invent numerical values
2. Extract ONLY values explicitly stated in the source
3. If a value is not explicitly stated, return "NOT AVAILABLE"
4. Always include units, experimental conditions, and source quote
5. If two papers disagree, preserve both as separate records
6. Mark derived values as "DERIVED" with the derivation method
7. Verbatim quotes must be EXACTLY as written in the source

CONFIDENCE LEVELS:
- MEASURED: Direct experimental measurement reported
- REPORTED: Value cited from another source
- DERIVED: Computed from other reported values
- ASSUMED: Estimated or typical value without experimental support

Return JSON matching this schema:
{
  "paper": "Title",
  "authors": ["Author1", "Author2"],
  "year": "YYYY",
  "doi": "10.xxxx/xxxxx or NOT VERIFIED",
  "material": "Material name",
  "parameter": "Parameter name (k, D_eff, etc.)",
  "value": "Numeric value as string",
  "unit": "SI unit",
  "experimental_conditions": "Temperature, humidity, etc.",
  "measurement_method": "Method description",
  "source_quote": "Verbatim quote from paper with page/figure reference",
  "confidence": "MEASURED | REPORTED | DERIVED | ASSUMED"
}

If the paper does not contain the requested parameter, return:
{
  "paper": "...",
  "parameter": "...",
  "value": "NOT AVAILABLE",
  "confidence": "NOT AVAILABLE"
}`;

export async function extractEvidenceWithQwen(
  paperText: string,
  material: string,
  parameter: string
): Promise<LiteratureEvidence> {
  try {
    const response = await client.chat.completions.create({
      model: process.env.FEATHERLESS_MODEL || "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content: EXTRACTION_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Extract the following parameter from this paper:

Material: ${material}
Parameter: ${parameter}

Paper text:
${paperText.slice(0, 8000)}

Return structured JSON only.`,
        },
      ],
      temperature: 0.1, // Low temperature for factual extraction
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Qwen");
    }

    // Parse JSON response
    const evidence = JSON.parse(content) as LiteratureEvidence;
    
    // Validate required fields
    if (!evidence.paper || !evidence.parameter) {
      throw new Error("Invalid evidence structure");
    }

    return evidence;
  } catch (error: any) {
    console.error("Qwen extraction error:", error);
    throw new Error(`Failed to extract evidence: ${error.message}`);
  }
}

export async function explainResult(
  experimentConfig: any,
  result: any,
  question: string
): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: process.env.FEATHERLESS_MODEL || "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content: `You are a scientific explanation assistant for Dermatherm.

Your mission: Explain simulation results based on the physics model.

CRITICAL RULES:
1. Base explanations ONLY on the actual model equations and configuration
2. NEVER invent explanations unsupported by the model
3. If an explanation depends on a simplification or assumption, label it clearly
4. Reference the exact mechanisms: vapor pressure gradient, diffusion, latent heat, etc.
5. Do NOT make medical or physiological claims
6. Do NOT claim causality beyond the computational model

Explain clearly but scientifically. Reference the actual simulation parameters.`,
        },
        {
          role: "user",
          content: `Experiment configuration:
${JSON.stringify(experimentConfig, null, 2)}

Results:
${JSON.stringify(result, null, 2)}

Question: ${question}

Provide a scientific explanation based on the physics model.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "No explanation available";
  } catch (error: any) {
    console.error("Qwen explanation error:", error);
    return "Explanation service unavailable";
  }
}
