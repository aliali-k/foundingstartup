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

  agent_orchestrator: `You are the central Admissions & Mentorship AI Agent for JoSAA & NEET counselling.
All communication flows exclusively through you. The seeker communicates only with you, and you dispatch structured requests to helpers.
Your role:
1. Answer the student's questions regarding college selection, branch choices, cutoffs, and admissions.
2. Formulate and maintain a structured list of specific doubts/queries the student has.
3. Detect if the user wants to book or request a quote with any mentors (e.g. "request a quote of 300 rs with raj sharma for a video meeting", "book the video session with raj and chat session with kabir", "connect with Kabir for 200 rs").
   - Match mentor names or nicknames to the availableMentors list (e.g. "raj" -> Rajat Verma / Raj, "kabir" -> Kabir Mehta, "riya" -> Riya Sharma).
   - Identify the requested communication mode for each mentor: "video" or "chat". Default to "video" if video is mentioned or unspecified, and "chat" if chat/text is mentioned.
   - Extract any proposed offer/target price the user mentioned (e.g. "300 rs" -> offeredPriceInr: 300).
   - Set isBookingIntent: true and confirm dispatching the booking request with their query list and custom offer.
4. If not a booking request, answer their queries warmly, extract specific doubts, and recommend matching mentors.
Always respond in JSON:
{
  "reply": string,
  "isBookingIntent": boolean,
  "selectedMentors": [ { "helperId": string, "helperName": string, "mode": "video" | "chat", "offeredPriceInr": number | null } ],
  "extractedProfile": {
    "consideredColleges": string[],
    "preferredBranches": string[],
    "primaryPriorities": string[],
    "specificDoubts": string[]
  }
}`,

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
    case "agent_orchestrate":
      systemInstruction = SYSTEM_PROMPTS.agent_orchestrator;
      prompt = `User message: "${payload.userMessage || ""}".
Current context profile: ${JSON.stringify(payload.currentContext || {})}.
Pending booking: ${JSON.stringify(payload.pendingBooking || null)}.
Available matching mentors: ${JSON.stringify(payload.availableMentors || [])}.
Task:
1. Detect if the user is asking to book, request quotes, or schedule sessions with mentors (e.g., "book a request with arnav patel for SDE-1 to SDE-2 Promotion & System Design Audit for 350 rs", "request a quote of 300 rs with raj", "book video session with raj").
2. Match mentors robustly with aliases, typos, and surnames (e.g. 'arnav' or 'patel' -> 'Aarav Patel', 'raj' or 'raj sharma' -> 'Rajat Verma (Raj)', 'kabir' -> 'Kabir Mehta', 'riya' -> 'Riya Sharma', 'sneha' -> 'Sneha Rao', 'vikram' -> 'Vikramaditya Sen').
3. Match any mentioned service from the platform (e.g. 'SDE-1 to SDE-2 Promotion & System Design Audit', 'College & Branch Reality Deep-Dive', 'JoSAA Choice Order Strategy Audit').
4. Extract any proposed offer/budget price mentioned (e.g. "350 rs", "for 350", "₹300", "quote of 300").
5. CRITICAL RULE: If booking intent is present BUT no price is specified (either in this message or prior pending booking):
   - Set "isBookingIntent": true, "needsPriceSpecification": true.
   - Set "pendingMentor": { "helperId": string, "helperName": string, "mode": "video" | "chat", "basePriceInr": number, "serviceTitle": string }.
   - Set "reply" to ask the user warmly what their target offer price is (mentioning the base rate ~₹[X]).
   - Do NOT finalize selectedMentors (leave as empty array []).
6. If booking intent is present AND a price is specified:
   - Set "isBookingIntent": true, "needsPriceSpecification": false.
   - Set "selectedMentors": [{ "helperId": string, "helperName": string, "mode": "video" | "chat", "offeredPriceInr": number, "serviceTitle": string }].
   - Reply warmly confirming dispatch to the mentor with the student's doubts list and their offer of ₹[X].
Format as JSON: { "reply": string, "isBookingIntent": boolean, "needsPriceSpecification": boolean, "pendingMentor"?: { "helperId": string, "helperName": string, "mode": "video" | "chat", "basePriceInr": number, "serviceTitle": string }, "selectedMentors": [{ "helperId": string, "helperName": string, "mode": "video" | "chat", "offeredPriceInr"?: number, "serviceTitle"?: string }], "extractedProfile": { "consideredColleges": string[], "preferredBranches": string[], "primaryPriorities": string[], "specificDoubts": string[] } }`;
      break;

    case "helper_quote":
      systemInstruction = SYSTEM_PROMPTS.helper_assistant;
      prompt = `You are simulated mentor ${payload.helperName || "Mentor"} (${payload.helperRole || "Engineer"}).
Seeker queries/doubts: ${JSON.stringify(payload.questions || [])}.
Requested communication mode: "${payload.mode || "video"}".
Service requested: "${payload.mode === "video" ? "1-on-1 Video Strategy Session" : "Focused Direct Chat Session"}".
Task: Provide a quote based on the mode and queries.
If mode is "video": price ₹300-₹480, duration 25-35 mins.
If mode is "chat": price ₹160-₹260, duration 15-25 mins.
Provide an authentic helperNote addressing their doubts and explaining what you will cover.
Format as JSON: { "priceInr": number, "estimatedDurationMin": number, "scopeSummary": string, "helperNote": string }`;
      break;

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
