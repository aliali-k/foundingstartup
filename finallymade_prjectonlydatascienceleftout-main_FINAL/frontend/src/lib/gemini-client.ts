import { handleLocalTaskFallback, type GeminiTaskResponse } from "./gemini-fallback";

export interface GeminiCallOptions {
  timeoutMs?: number;
}

/**
 * Client abstraction for calling the server-side Gemini endpoint.
 * Ensures the API key is never bundled into client JS or exposed to network inspection.
 * If the server endpoint is unreachable, timed out, or returns a 429/500,
 * it immediately and gracefully invokes handleLocalTaskFallback without crashing.
 */
export async function callGeminiTask(
  task: string,
  payload: Record<string, any>,
  options: GeminiCallOptions = {}
): Promise<GeminiTaskResponse> {
  const timeoutMs = options.timeoutMs ?? 9000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = Date.now();

  try {
    const res = await fetch("/api/counselling/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, payload }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Gemini Server API] Returned HTTP ${res.status}. Engaging local deterministic fallback.`);
      return handleLocalTaskFallback(task, payload);
    }

    const json = await res.json();
    console.info(`[Gemini Task: ${task}] Executed in ${Date.now() - startTime}ms. Fallback: ${!!json.isFallback}`);
    return json;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[Gemini Server API] Network/Timeout error (${err?.message || err}). Engaging local deterministic fallback.`);
    return handleLocalTaskFallback(task, payload);
  }
}
