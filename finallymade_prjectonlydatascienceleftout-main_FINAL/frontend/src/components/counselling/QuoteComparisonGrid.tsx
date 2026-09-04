import { useState, useEffect } from "react";
import { type CounsellingRequest, type ReceivedQuote, acceptQuote, onQuoteReceived } from "@/lib/counselling-store";
import { MENTORS } from "@/data/mentors";
import { callGeminiTask } from "@/lib/gemini-client";
import { useNavigate } from "@tanstack/react-router";

export function QuoteComparisonGrid({
  request,
}: {
  request: CounsellingRequest;
}) {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<ReceivedQuote[]>(request.receivedQuotes || []);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeQuoteForPay, setActiveQuoteForPay] = useState<ReceivedQuote | null>(null);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Sync quotes if request object changes
  useEffect(() => {
    setQuotes(request.receivedQuotes || []);
  }, [request]);

  // Subscribe to live incoming quotes dispatched by the agent
  useEffect(() => {
    const unsub = onQuoteReceived((newQuote, reqId) => {
      if (reqId === request.id) {
        setQuotes((prev) => {
          if (prev.some((q) => q.id === newQuote.id)) return prev;
          return [...prev, newQuote];
        });
        setAlertBanner(`✨ Received new quote from ${newQuote.helperName} (${newQuote.communicationMode === "video" ? "📹 Video Call" : "💬 Text Chat"}) for ₹${newQuote.priceInr}!`);
        setTimeout(() => setAlertBanner(null), 5000);
      }
    });

    return unsub;
  }, [request.id]);

  // Trigger Gemini comparison when quotes change
  useEffect(() => {
    if (quotes.length === 0) return;

    let isMounted = true;
    setLoadingAi(true);

    callGeminiTask("compare_quotes", {
      requestSummary: request.normalizedSummary,
      questions: request.questions,
      quotes: quotes.map((q) => ({
        helperName: q.helperName,
        helperRole: q.helperRole,
        priceInr: q.priceInr,
        durationMin: q.estimatedDurationMin,
        scopeSummary: q.scopeSummary,
        communicationMode: q.communicationMode || "call",
      })),
    })
      .then((res) => {
        if (isMounted && res.data) {
          setAiAnalysis(res.data);
        }
      })
      .catch((e) => console.error("Compare quotes error:", e))
      .finally(() => {
        if (isMounted) setLoadingAi(false);
      });

    return () => {
      isMounted = false;
    };
  }, [quotes, request.normalizedSummary, request.questions]);

  const handleOpenPay = (quote: ReceivedQuote) => {
    setActiveQuoteForPay(quote);
    setPaymentModalOpen(true);
  };

  const handleConfirmMockPay = () => {
    if (!activeQuoteForPay) return;
    const res = acceptQuote(request.id, activeQuoteForPay.id);
    if (res) {
      setPaymentModalOpen(false);
      navigate({
        to: "/counselling/session/$id",
        params: { id: res.session.id },
      });
    }
  };

  // Compute helpers who were sent request but haven't replied yet
  const pendingHelperIds = (request.sentToHelperIds || []).filter(
    (hId) => !quotes.some((q) => q.helperId === hId)
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner: AI Synthesis */}
      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5 relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-purple-500 animate-ping" />
            <span className="text-[10.5px] uppercase font-bold tracking-[0.2em] text-purple-600 dark:text-purple-400">
              ◆ WHO FITS YOUR QUESTION BEST? (GEMINI COMPARATIVE REASONING)
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
            {loadingAi ? "Gemini Synthesizing Quotes…" : "Grounded Evaluation Ready"}
          </span>
        </div>

        {loadingAi ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
            <span>Evaluating scopes, duration, and mentor backgrounds…</span>
          </div>
        ) : (
          aiAnalysis && (
            <div className="mt-4 space-y-3 text-xs">
              <p className="text-foreground font-sans leading-relaxed text-sm">
                {aiAnalysis.comparisonSummary}
              </p>

              <div className="grid gap-3 sm:grid-cols-3 pt-2">
                {(aiAnalysis.recommendations || []).map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/80 bg-background/80 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{rec.helperName}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        ₹{rec.priceInr}
                      </span>
                    </div>
                    <span className="text-[9px] px-2 py-0.2 rounded bg-purple-500/10 text-purple-500 block w-fit font-semibold">
                      {rec.badge}
                    </span>
                    <p className="text-[11px] text-muted-foreground font-sans pt-1 leading-snug">
                      {rec.verdict}
                    </p>
                  </div>
                ))}
              </div>

              {aiAnalysis.aiAdvice && (
                <div className="pt-2 border-t border-purple-500/20 text-[11px] text-muted-foreground font-sans">
                  <strong className="text-foreground font-mono uppercase text-[10px]">
                    Guidance:{" "}
                  </strong>
                  {aiAnalysis.aiAdvice}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Live Quote Notification Banner */}
      {alertBanner && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold">{alertBanner}</span>
          </div>
          <span className="mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20">
            Live Stream
          </span>
        </div>
      )}

      {/* Quote Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
            Received Quotes ({quotes.length})
          </span>
          <span className="text-[10px] text-muted-foreground">
            Scope-based pricing · Zero obligation
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all bg-card ${
                q.status === "accepted"
                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                  : "border-border hover:border-blue-500/60"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{q.helperName}</h3>
                    <p className="text-[10px] text-muted-foreground font-sans">{q.helperRole}</p>
                    <span className="inline-block mt-1 mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {q.communicationMode === "video" ? "📹 1-on-1 Video Session" : "💬 Direct Text Chat"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-foreground">₹{q.priceInr}</span>
                    <span className="text-[9px] text-muted-foreground block font-mono">
                      {q.estimatedDurationMin} min {q.communicationMode === "video" ? "call" : "chat"}
                    </span>
                  </div>
                </div>

                {/* Scope */}
                <div className="mt-3.5 space-y-2 text-xs">
                  <span className="text-[10px] uppercase text-muted-foreground block font-bold">
                    Agreed Scope:
                  </span>
                  <p className="text-foreground/90 font-sans text-[11.5px] leading-relaxed">
                    {q.scopeSummary}
                  </p>

                  <div className="rounded-lg bg-muted/40 p-2.5 text-[10.5px] text-muted-foreground font-sans italic">
                    "{q.helperNote}"
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-border/60">
                {q.status === "accepted" ? (
                  <div className="text-center font-bold text-emerald-500 text-xs py-2">
                    ✓ Quote Accepted
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenPay(q)}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition shadow-sm cursor-pointer"
                  >
                    Accept Quote (₹{q.priceInr}) →
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pending Helper Cards (Waiting for quotes to arrive) */}
          {pendingHelperIds.map((hId) => {
            const helper = MENTORS.find((m) => m.id === hId);
            if (!helper) return null;
            return (
              <div
                key={hId}
                className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-muted-foreground">{helper.name}</h3>
                      <p className="text-[10px] text-muted-foreground/80 font-sans">{helper.currentRole}</p>
                    </div>
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  </div>

                  <div className="py-8 text-center space-y-2">
                    <span className="mono text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
                      Reviewing your queries…
                    </span>
                    <p className="text-[11px] text-muted-foreground font-sans max-w-xs mx-auto">
                      {helper.name.split(" ")[0]} is reviewing your doubts and calculating custom scope. Quote arriving momentarily.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 text-center">
                  <span className="mono text-[10px] text-muted-foreground">
                    Estimated arrival ~2 seconds
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Payment Modal */}
      {paymentModalOpen && activeQuoteForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                ◆ SIMULATED CHECKOUT (POC MOCK)
              </span>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="size-7 rounded border border-border text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-muted/40 p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mentor:</span>
                <span className="font-bold text-foreground">{activeQuoteForPay.helperName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session Type:</span>
                <span className="text-foreground">{activeQuoteForPay.serviceTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-foreground">{activeQuoteForPay.estimatedDurationMin} Minutes</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
                <span className="text-foreground">Total Fee:</span>
                <span className="text-emerald-500 font-black">₹{activeQuoteForPay.priceInr}</span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-[10px] text-muted-foreground font-sans">
              ℹ No real card or payment is required. Clicking "Confirm Simulated Payment" creates the active 1-on-1 session instantly.
            </div>

            <button
              onClick={handleConfirmMockPay}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black uppercase tracking-wider text-white transition shadow-sm"
            >
              Confirm Simulated Payment (₹{activeQuoteForPay.priceInr}) →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
