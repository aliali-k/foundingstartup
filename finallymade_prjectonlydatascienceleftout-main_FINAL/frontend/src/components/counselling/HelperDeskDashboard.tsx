import { useState } from "react";
import {
  getAllRequests,
  getHelperStatus,
  setHelperStatus,
  type CounsellingRequest,
  type ReceivedQuote,
  saveRequest,
} from "@/lib/counselling-store";
import { MENTORS } from "@/data/mentors";
import { callGeminiTask } from "@/lib/gemini-client";

export function HelperDeskDashboard({
  initialSelectedRequestId,
}: {
  initialSelectedRequestId?: string;
}) {
  const [requests, setRequests] = useState<CounsellingRequest[]>(getAllRequests());
  const [status, setStatusState] = useState<"AVAILABLE" | "OFFLINE">(getHelperStatus());
  const [selectedReqId, setSelectedReqId] = useState<string | null>(
    initialSelectedRequestId || (requests[0]?.id ?? null)
  );

  // Selected request details
  const activeReq = requests.find((r) => r.id === selectedReqId) || requests[0];

  // Helper AI Assistant state
  const [aiAssistantMode, setAiAssistantMode] = useState<string | null>(null);
  const [aiAssistantOutput, setAiAssistantOutput] = useState<string | null>(null);
  const [aiAssistantBusy, setAiAssistantBusy] = useState(false);

  // Quote builder state
  const [quotePrice, setQuotePrice] = useState<number>(350);
  const [quoteDuration, setQuoteDuration] = useState<number>(25);
  const [quoteNote, setQuoteNote] = useState<string>(
    "I will answer all 4 questions in detail, compare NIT Kurukshetra with PEC Chandigarh, and provide raw placement benchmarks."
  );
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const toggleStatus = () => {
    const next = status === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
    setStatusState(next);
    setHelperStatus(next);
  };

  const handleRunAiAssistant = async (mode: "draft_response" | "suggest_clarifying_question" | "summarize_doubts") => {
    if (!activeReq) return;
    setAiAssistantMode(mode);
    setAiAssistantBusy(true);

    try {
      const res = await callGeminiTask("helper_assistant", {
        mode,
        questions: activeReq.questions,
        mentorProfile: MENTORS[0], // Riya Sharma mock context
      });

      if (res.data?.draft) setAiAssistantOutput(res.data.draft);
      else if (res.data?.suggestion) setAiAssistantOutput(res.data.suggestion);
      else if (res.data?.summary) setAiAssistantOutput(Array.isArray(res.data.summary) ? res.data.summary.join("\n") : res.data.summary);
      else setAiAssistantOutput("AI Assistant suggestions ready based on seeker doubts.");
    } catch (e) {
      console.error("Helper AI Assistant error:", e);
    } finally {
      setAiAssistantBusy(false);
    }
  };

  const handleSendQuote = () => {
    if (!activeReq) return;

    const newQuote: ReceivedQuote = {
      id: `quote-helper-desk-${Date.now()}`,
      requestId: activeReq.id,
      helperId: "riya-sharma-nitkkr",
      helperName: "Riya Sharma (Simulated Helper)",
      helperRole: "Hero MotoCorp R&D (NIT Kurukshetra)",
      helperCollege: "NIT Kurukshetra",
      serviceId: "college-branch-deep-dive",
      serviceTitle: "1-on-1 College & Branch Deep Dive",
      priceInr: quotePrice,
      estimatedDurationMin: quoteDuration,
      scopeSummary: `Coverage of ${activeReq.questions.length || 4} points: Hero/Tata on-campus internships, branch change criteria, and Kurukshetra vs Chandigarh comparison.`,
      helperNote: quoteNote,
      status: "sent",
      createdAt: new Date().toISOString(),
    };

    activeReq.receivedQuotes.unshift(newQuote);
    activeReq.status = "quoted";
    saveRequest(activeReq);
    setRequests([...getAllRequests()]);
    setQuoteSubmitted(true);
    setTimeout(() => setQuoteSubmitted(false), 2500);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner: Your Mentor Desk */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] uppercase font-bold tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
              ◆ HELPER PORTAL · MENTOR DESK
            </span>
            <span className="mono text-[8px] bg-muted px-2 py-0.2 rounded border border-border text-muted-foreground font-semibold">
              SIMULATED HELPER ACCOUNT
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">
            Riya Sharma's Advisory Workbench
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            B.Tech Mechanical (NIT Kurukshetra) · GET at Hero MotoCorp R&D
          </p>
        </div>

        {/* Status Toggle & Metrics */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5">
            <span
              className={`size-2.5 rounded-full ${
                status === "AVAILABLE" ? "bg-emerald-500 animate-ping" : "bg-muted-foreground"
              }`}
            />
            <span className="text-xs font-bold text-foreground">
              STATUS: {status}
            </span>
            <button
              onClick={toggleStatus}
              className="text-[10px] text-blue-500 hover:underline ml-1 cursor-pointer font-bold"
            >
              (Toggle)
            </button>
          </div>

          <div className="rounded-xl border border-border bg-emerald-500/10 px-3.5 py-1.5 text-right">
            <span className="text-[9px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block font-bold">
              Simulated Earnings
            </span>
            <span className="text-base font-black text-emerald-500">₹4,250</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4 text-xs">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-muted-foreground uppercase text-[10px] block">Active Requests</span>
          <span className="text-xl font-black text-foreground mt-1 block">
            {requests.filter((r) => r.status !== "completed").length}
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-muted-foreground uppercase text-[10px] block">Pending Quotes</span>
          <span className="text-xl font-black text-blue-500 mt-1 block">
            {requests.filter((r) => r.status === "open" || r.status === "chatting").length}
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-muted-foreground uppercase text-[10px] block">Completed Sessions</span>
          <span className="text-xl font-black text-emerald-500 mt-1 block">31</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-muted-foreground uppercase text-[10px] block">Average Rating</span>
          <span className="text-xl font-black text-amber-500 mt-1 block">★ 4.94 (29)</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Request Queue (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border p-3.5 bg-muted/30 flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-foreground tracking-wider">
              Incoming Seeker Requests
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
              {requests.length} Total
            </span>
          </div>

          <div className="divide-y divide-border/60 max-h-[580px] overflow-y-auto">
            {requests.map((r) => {
              const isSelected = r.id === activeReq?.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedReqId(r.id);
                    setAiAssistantOutput(null);
                  }}
                  className={`p-4 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/10 border-l-4 border-l-blue-600"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">
                      {r.seekerType.replace(/_/g, " ")}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-background border border-border text-muted-foreground font-semibold">
                      {r.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-foreground font-sans line-clamp-1">
                    {r.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-sans line-clamp-2 mt-1">
                    {r.normalizedSummary}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Rank: #{r.context.rank?.toLocaleString() || "—"}</span>
                    <span>{r.questions.length} Questions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Request Detail + Gemini Assistant + Quote Builder (8 cols) */}
        {activeReq && (
          <div className="lg:col-span-8 space-y-6">
            {/* Request Detail Card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                    SEEKER DOSSIER & CONTEXT
                  </span>
                  <h3 className="text-base font-bold text-foreground font-sans mt-0.5">
                    {activeReq.seekerName}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    Found You: Mechanical at NIT Kurukshetra
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Requested Format: {activeReq.preferredFormat.toUpperCase()} CALL
                  </span>
                </div>
              </div>

              {/* Normalized Summary */}
              <div>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider block mb-1">
                  Normalized Doubt Summary
                </span>
                <p className="text-xs font-sans text-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/60">
                  {activeReq.normalizedSummary}
                </p>
              </div>

              {/* Specific Questions */}
              <div>
                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider block mb-1.5">
                  Questions to Answer in Scope ({activeReq.questions.length})
                </span>
                <div className="space-y-1.5">
                  {activeReq.questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg bg-background border border-border p-2.5 text-xs font-sans text-foreground/90 flex items-start gap-2"
                    >
                      <span className="text-blue-500 font-mono font-bold">{idx + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gemini Helper Assistant Toolbar */}
              <div className="pt-3 border-t border-border/60">
                <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block mb-2">
                  ✦ GEMINI HELPER-SIDE ASSISTANT
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleRunAiAssistant("draft_response")}
                    disabled={aiAssistantBusy}
                    className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 transition disabled:opacity-50"
                  >
                    Draft Free Chat Response ↗
                  </button>
                  <button
                    onClick={() => handleRunAiAssistant("suggest_clarifying_question")}
                    disabled={aiAssistantBusy}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-purple-500 transition disabled:opacity-50"
                  >
                    Suggest Clarifying Question ↗
                  </button>
                  <button
                    onClick={() => handleRunAiAssistant("summarize_doubts")}
                    disabled={aiAssistantBusy}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:border-purple-500 transition disabled:opacity-50"
                  >
                    Cluster Questions into 4 Bullets ↗
                  </button>
                </div>

                {aiAssistantBusy && (
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span>Gemini is drafting helper suggestions…</span>
                  </div>
                )}

                {aiAssistantOutput && !aiAssistantBusy && (
                  <div className="mt-3 rounded-xl border border-purple-500/30 bg-purple-500/5 p-3.5 text-xs font-sans leading-relaxed text-foreground whitespace-pre-wrap">
                    <span className="mono text-[9px] font-bold text-purple-600 uppercase block mb-1">
                      Gemini Draft:
                    </span>
                    {aiAssistantOutput}
                  </div>
                )}
              </div>
            </div>

            {/* Scope-Based Quote Builder */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="border-b border-border/60 pb-3">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  ◆ SCOPE-BASED QUOTE BUILDER
                </span>
                <h3 className="text-base font-bold text-foreground font-sans mt-0.5">
                  Set Your Scoped Pricing for This Request
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">
                    Your Quote (INR ₹)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base font-bold text-foreground outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-muted-foreground shrink-0 font-sans">
                      (Suggested: ₹250–₹500)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">
                    Estimated Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={quoteDuration}
                    onChange={(e) => setQuoteDuration(parseInt(e.target.value, 10) || 20)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base font-bold text-foreground outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">
                  Scope Commitment Note to Seeker
                </label>
                <textarea
                  value={quoteNote}
                  onChange={(e) => setQuoteNote(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background p-3 text-xs font-sans text-foreground outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Quotes are binding and visible to candidate in comparison grid.
                </span>
                <button
                  onClick={handleSendQuote}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white transition shadow-sm"
                >
                  {quoteSubmitted ? "✓ Quote Sent!" : "Send Scoped Quote →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
