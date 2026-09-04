import fs from "fs";
import path from "path";

// Attempt to load .env if not already in process.env
function getGeminiApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;

  // Try checking nearby .env files
  const searchPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(process.cwd(), "../../.env"),
  ];

  for (const envPath of searchPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
        if (match && match[1]) {
          process.env.GEMINI_API_KEY = match[1].trim();
          return process.env.GEMINI_API_KEY;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return undefined;
}

const SYSTEM_PROMPTS = {
  college_counselor: `You are an expert, empathetic JoSAA/NEET college admissions counselor.
Your role:
- Guide aspirants exploring engineering and medical colleges in India.
- You are a matching layer that gets the seeker to the right human mentor, NOT an authority who guarantees outcomes.
- NEVER invent college facts, fake cutoffs, or non-existent programs.
- Always use concise, editorial language with clear reasoning and acknowledge trade-offs.
- Respond with a structured JSON object containing "reply" (conversational text) and "extractedProfile" (structured fields).`,

  career_counselor: `You are an experienced technical career advisor.
Your role:
- Understand engineering roles, levels (SDE-1, SDE-2, Senior SDE, Staff), and career ladders.
- Emphasize that mentors should strictly be ahead of the seeker in the target direction (e.g. SDE-1 seeking SDE-2 needs SDE-2+ mentors).
- Respond with a structured JSON object containing "reply" and "extractedProfile".`,

  helper_assistant: `You are an AI assistant helping a simulated mentor draft quick, helpful replies and quotes for an incoming student request.
- Keep tone professional, authentic, and grounded in the mentor's actual background.
- Focus on clarifying scope and confirming fit for a 1-on-1 strategy call.
- Respond with a structured JSON object containing your draft or suggestion.`,

  quote_comparator: `You are an objective advisory assistant comparing quotes from multiple mentors.
- Provide neutral, insightful trade-off analysis explaining who fits which specific questions best.
- Do NOT force the user's decision.
- Respond with a structured JSON object containing "comparisonSummary", "recommendations", and "aiAdvice".`,
};

export async function handleGeminiApiRequest(task: string, payload: any): Promise<any> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.info(`[Gemini Handler] No GEMINI_API_KEY found. Using high-fidelity local fallback for task: "${task}".`);
    const { handleLocalTaskFallback } = await import("../lib/gemini-fallback");
    return handleLocalTaskFallback(task, payload);
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  let prompt = "";
  let systemInstruction = SYSTEM_PROMPTS.college_counselor;

  switch (task) {
    case "college_intake":
      systemInstruction = SYSTEM_PROMPTS.college_counselor;
      prompt = `Student says: "${payload.userMessage || ""}".
Recent context: ${JSON.stringify(payload.currentContext || {})}.
Task: Understand their doubts, extract structured fields (stage, exam, rank, consideredColleges, preferredBranches, primaryPriorities, specificDoubts), and reply warmly asking 1 targeted follow-up question.
Format as JSON: { "reply": string, "extractedProfile": object }`;
      break;

    case "career_intake":
      systemInstruction = SYSTEM_PROMPTS.career_counselor;
      prompt = `User says: "${payload.userMessage || ""}".
Current context: ${JSON.stringify(payload.currentContext || {})}.
Task: Identify current role, target role, experience years, and technical focus (e.g. SDE-1 aiming for SDE-2).
Format as JSON: { "reply": string, "extractedProfile": { "currentRole": string, "targetRole": string, "experienceYears": number, "technicalFocus": string[], "targetCompanies": string[] } }`;
      break;

    case "refine_colleges":
      systemInstruction = SYSTEM_PROMPTS.college_counselor;
      prompt = `Colleges under consideration: ${JSON.stringify(payload.colleges || [])}.
User primary priority: "${payload.priority || "Core placements and internships"}".
Task: Order the colleges by fit, provide honest rationale, highlight trade-offs, and suggest 1 key question to ask a senior.
Format as JSON: { "recommendedOrder": [{ "collegeName": string, "fitScore": number, "rationale": string, "tradeOffs": string, "questionsForSenior": string }], "synthesis": string }`;
      break;

    case "nl_filter":
      prompt = `Extract search filters from user query: "${payload.query || ""}".
Available fields: college (string or null), branch (string or null), maxPrice (number or null), minRating (number or null).
Format as JSON: { "interpretedFilters": { "college": string|null, "branch": string|null, "maxPrice": number|null, "minRating": number|null }, "explanation": string }`;
      break;

    case "helper_response":
      systemInstruction = SYSTEM_PROMPTS.helper_assistant;
      prompt = `You are simulated mentor ${payload.helperName || "Riya Sharma"} (${payload.helperBranch || "Mechanical"} from ${payload.helperCollege || "NIT Kurukshetra"}).
Seeker message: "${payload.seekerMessage || ""}".
Task: Respond authentically confirming whether their questions are within your experience scope. Encourage booking a scoped call if relevant.
Format as JSON: { "response": string, "isWithinScope": boolean, "suggestedNextStep": string }`;
      break;

    case "helper_assistant":
      systemInstruction = SYSTEM_PROMPTS.helper_assistant;
      prompt = `Helper assistant task: "${payload.mode || "draft_response"}".
Seeker's doubts: ${JSON.stringify(payload.questions || [])}.
Mentor background: ${JSON.stringify(payload.mentorProfile || {})}.
Format as JSON with relevant key: "draft", "suggestion", or "summary".`;
      break;

    case "quote_scope":
      prompt = `Seeker questions: ${JSON.stringify(payload.questions || [])}.
Requested service: "${payload.serviceTitle || "1-on-1 Strategy Call"}".
Task: Estimate fair scope, duration (20-35 mins), price range in INR (₹250-₹500), and specific scope bullet points.
Format as JSON: { "suggestedPriceInr": number, "suggestedDurationMin": number, "scopeSummary": string, "scopePoints": string[] }`;
      break;

    case "compare_quotes":
      systemInstruction = SYSTEM_PROMPTS.quote_comparator;
      prompt = `Seeker Request: "${payload.requestSummary || ""}".
Questions: ${JSON.stringify(payload.questions || [])}.
Quotes received: ${JSON.stringify(payload.quotes || [])}.
Task: Provide an objective, insightful comparison of each mentor's strengths and value for money, with clear concluding advice.
Format as JSON: { "comparisonSummary": string, "recommendations": [{ "helperId": string, "helperName": string, "priceInr": number, "badge": string, "verdict": string }], "aiAdvice": string }`;
      break;

    default:
      prompt = `Execute task "${task}" with payload: ${JSON.stringify(payload)}. Respond in JSON.`;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Gemini API Error] HTTP ${response.status}: ${errText}. Using local fallback.`);
      const { handleLocalTaskFallback } = await import("../lib/gemini-fallback");
      return handleLocalTaskFallback(task, payload);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      const { handleLocalTaskFallback } = await import("../lib/gemini-fallback");
      return handleLocalTaskFallback(task, payload);
    }

    const parsedJson = JSON.parse(candidateText);
    return {
      success: true,
      isFallback: false,
      data: parsedJson,
    };
  } catch (err: any) {
    console.warn(`[Gemini API Exception] ${err?.message || err}. Using local fallback.`);
    const { handleLocalTaskFallback } = await import("../lib/gemini-fallback");
    return handleLocalTaskFallback(task, payload);
  }
}
