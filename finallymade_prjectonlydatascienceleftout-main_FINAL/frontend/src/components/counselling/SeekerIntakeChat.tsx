import { useState, useEffect, useRef } from "react";
import { callGeminiTask } from "@/lib/gemini-client";
import { onQuoteReceived, type ReceivedQuote } from "@/lib/counselling-store";

export interface SeekerStructuredProfile {
  stage: string;
  exam: string;
  rank?: number;
  consideredColleges: string[];
  preferredBranches: string[];
  primaryPriorities: string[];
  specificDoubts: string[];
}

export interface ExternalBookingIntent {
  mentorName: string;
  helperId?: string;
  mode: "video" | "chat";
  serviceTitle?: string;
  offeredPriceInr?: number;
  timestamp: number;
}

interface IntakeMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  isQuoteNotification?: boolean;
  quote?: ReceivedQuote;
  isPricePrompt?: boolean;
  pendingMentor?: {
    helperId: string;
    helperName: string;
    mode: "video" | "chat";
    basePriceInr: number;
    serviceTitle?: string;
  };
}

export function SeekerIntakeChat({
  initialContext,
  availableMentors = [],
  externalBookingIntent,
  onProceedToMatches,
  onOpenRefineList,
  onAgentBookingTriggered,
  onScrollToCompare,
}: {
  initialContext?: {
    college?: string;
    rank?: string;
    branch?: string;
  };
  availableMentors?: Array<{ id: string; name: string; collegeName: string; branch: string }>;
  externalBookingIntent?: ExternalBookingIntent | null;
  onProceedToMatches: (profile: SeekerStructuredProfile) => void;
  onOpenRefineList: (profile: SeekerStructuredProfile) => void;
  onAgentBookingTriggered?: (selectedMentors: Array<{ helperId: string; helperName: string; mode: "video" | "chat"; offeredPriceInr?: number }>, queries: string[]) => void;
  onScrollToCompare?: () => void;
}) {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<SeekerStructuredProfile>({
    stage: "Class 12 / JEE Aspirant",
    exam: "JEE Main 2026",
    rank: initialContext?.rank ? parseInt(initialContext.rank, 10) : 7207,
    consideredColleges: initialContext?.college
      ? [initialContext.college, "PEC / NIT Chandigarh", "Assam University"]
      : ["NIT Kurukshetra", "PEC / NIT Chandigarh", "Assam University"],
    preferredBranches: initialContext?.branch ? [initialContext.branch] : ["Computer Science"],
    primaryPriorities: ["Tier-1 software placements", "Hostel & campus coding culture"],
    specificDoubts: [
      "Tier-1 product & FinTech placement opportunities on campus",
      "Hostel facilities, high-speed coding labs & internet reality",
      "NIT Kurukshetra vs PEC vs Assam University CS curriculum comparison"
    ],
  });

  const [messages, setMessages] = useState<IntakeMessage[]>([
    {
      id: "m-0",
      sender: "ai",
      text: initialContext?.college
        ? `Hello! I am your AI Admissions & Mentorship Agent. I coordinate directly with seniors and professionals so you don't have to message them one by one. Ask me any query, or tell me: "book a request with arnav patel for SDE-1 to SDE-2 Promotion & System Design Audit for 350 rs" or "request a quote of 300 rs with raj" to dispatch booking requests with your custom price!`
        : `Hello! I am your AI Admissions & Mentorship Agent. I understand your queries, match you with verified seniors, and negotiate quotes on your behalf. Ask any query, or specify your custom offer price (e.g. "request a quote of 300 rs with raj for a video meeting").`,
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>("AI Agent Ready (Gemini Active)");
  const [pendingBooking, setPendingBooking] = useState<{
    helperId: string;
    helperName: string;
    mode: "video" | "chat";
    basePriceInr: number;
    serviceTitle?: string;
  } | null>(null);
  const [customOfferInput, setCustomOfferInput] = useState("");

  // Listen for live quotes returned by helpers and post interactive cards into the chat stream!
  useEffect(() => {
    const unsub = onQuoteReceived((newQuote) => {
      setMessages((prev) => {
        // Prevent duplicate notification messages
        if (prev.some((m) => m.quote?.id === newQuote.id)) return prev;
        return [
          ...prev,
          {
            id: `quote-msg-${newQuote.id}`,
            sender: "ai",
            text: `📩 Quote Received from ${newQuote.helperName} (${newQuote.communicationMode === "video" ? "📹 Video Call" : "💬 Text Chat"}) for ₹${newQuote.priceInr}${newQuote.offeredPriceInr ? ` (in response to your ₹${newQuote.offeredPriceInr} offer)` : ""}.\n\n"${newQuote.helperNote}"`,
            isQuoteNotification: true,
            quote: newQuote,
          },
        ];
      });
    });

    return unsub;
  }, []);

  // Handle external booking intent from Mentor Card or Mentor Profile Modal buttons
  useEffect(() => {
    if (!externalBookingIntent) return;
    chatContainerRef.current?.scrollIntoView({ behavior: "smooth" });
    const svc = externalBookingIntent.serviceTitle || (externalBookingIntent.mode === "video" ? "Video Meeting" : "Chat Session");
    if (externalBookingIntent.offeredPriceInr) {
      sendMessage(`book a request with ${externalBookingIntent.mentorName} for ${svc} for ${externalBookingIntent.offeredPriceInr} rs`);
    } else {
      sendMessage(`book a request with ${externalBookingIntent.mentorName} for ${svc}`);
    }
  }, [externalBookingIntent?.timestamp]);

  const handleConfirmOffer = (
    mentorInfo: { helperId: string; helperName: string; mode: "video" | "chat"; basePriceInr: number; serviceTitle?: string },
    offerPrice: number
  ) => {
    setPendingBooking(null);
    setCustomOfferInput("");

    const userMsg: IntakeMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: `Offer ₹${offerPrice} for ${mentorInfo.helperName} (${mentorInfo.serviceTitle || (mentorInfo.mode === "video" ? "Video Call" : "Chat")})`,
    };

    const aiMsg: IntakeMessage = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Target offer of ₹${offerPrice} confirmed for ${mentorInfo.helperName}! I have dispatched your booking request with your queries list. Their customized quote is streaming in now!`,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);

    const doubtsToPass = profile.specificDoubts;
    onAgentBookingTriggered?.([{
      helperId: mentorInfo.helperId,
      helperName: mentorInfo.helperName,
      mode: mentorInfo.mode,
      offeredPriceInr: offerPrice,
    }], doubtsToPass);
  };

  const sendMessage = async (customText?: string) => {
    const text = (customText || inputVal).trim();
    if (!text || busy) return;

    setInputVal("");

    // If user is answering a pending price question with a number like "350" or "350 rs"
    if (pendingBooking) {
      const priceOnlyMatch = text.match(/(?:offer|price|for)?\s*(?:rs\.?|₹)?\s*(\d{2,4})\s*(?:rs|inr|₹|rupees)?/i);
      if (priceOnlyMatch && parseInt(priceOnlyMatch[1], 10) >= 50) {
        handleConfirmOffer(pendingBooking, parseInt(priceOnlyMatch[1], 10));
        return;
      }
    }

    const userMsg: IntakeMessage = { id: `u-${Date.now()}`, sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);
    setAiStatus("Agent reasoning & checking mentor booking commands…");

    try {
      const res = await callGeminiTask("agent_orchestrate", {
        userMessage: text,
        currentContext: profile,
        pendingBooking,
        availableMentors: availableMentors.length > 0 ? availableMentors : undefined,
      });

      if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: res.data.reply,
            isPricePrompt: res.data?.needsPriceSpecification,
            pendingMentor: res.data?.pendingMentor,
          },
        ]);
      }

      if (res.data?.extractedProfile) {
        setProfile((prev) => ({
          ...prev,
          ...res.data.extractedProfile,
          consideredColleges: Array.from(new Set([...(prev.consideredColleges || []), ...(res.data.extractedProfile.consideredColleges || [])])),
          preferredBranches: Array.from(new Set([...(prev.preferredBranches || []), ...(res.data.extractedProfile.preferredBranches || [])])),
          primaryPriorities: Array.from(new Set([...(prev.primaryPriorities || []), ...(res.data.extractedProfile.primaryPriorities || [])])),
          specificDoubts: Array.from(new Set([...(prev.specificDoubts || []), ...(res.data.extractedProfile.specificDoubts || [])])),
        }));
      }

      // Check if price needs to be specified before dispatching!
      if (res.data?.needsPriceSpecification && res.data?.pendingMentor) {
        setPendingBooking(res.data.pendingMentor);
      } else if (res.data?.isBookingIntent && res.data?.selectedMentors?.length > 0) {
        setPendingBooking(null);
        const doubtsToPass = res.data.extractedProfile?.specificDoubts?.length > 0
          ? res.data.extractedProfile.specificDoubts
          : profile.specificDoubts;

        onAgentBookingTriggered?.(res.data.selectedMentors, doubtsToPass);
      }

      setAiStatus(res.isFallback ? "AI Agent (Local Fallback Active)" : "AI Agent (Live Gemini Active)");
    } catch (err) {
      console.error("Agent orchestrate failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const quickPrompts = [
    "Book a request with Arnav Patel for SDE-1 to SDE-2 Promotion & System Design Audit for 350 rs",
    "Request a quote of ₹300 with Raj for a video meeting",
    "Book the video session with Raj and chat session with Kabir",
  ];

  return (
    <div ref={chatContainerRef} className="grid gap-6 lg:grid-cols-12 items-start">
      {/* LEFT / CENTER: Conversational Intake (7 cols) */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-500 animate-ping" />
            <span className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
              Conversational Intake Assistant & Agent Dispatcher
            </span>
          </div>
          {aiStatus && (
            <span className="mono text-[9px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/60">
              {aiStatus}
            </span>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[380px] min-h-[300px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.isQuoteNotification && m.quote ? (
                <div className="max-w-[90%] rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-2 text-xs font-mono shadow-xs animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-bold text-foreground">{m.quote.helperName}</span>
                    </div>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{m.quote.priceInr}
                    </span>
                  </div>

                  <div className="space-y-1 font-sans text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                      <span>{m.quote.communicationMode === "video" ? "📹 1-on-1 Video Session (30 min)" : "💬 Direct Text Chat (20 min)"}</span>
                      {m.quote.offeredPriceInr && (
                        <span className="px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border text-[10px]">
                          Your offer: ₹{m.quote.offeredPriceInr}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground italic text-[11.5px] pt-1">
                      "{m.quote.helperNote}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-emerald-500/20 flex justify-end">
                    <button
                      onClick={onScrollToCompare}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[11px] font-bold font-mono transition shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>Review in Compare Quotes</span>
                      <span>↓</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed font-sans ${
                    m.sender === "user"
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs"
                      : "bg-muted/70 text-foreground border border-border/60"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Interactive Offer Price Selector when price is needed */}
                  {m.isPricePrompt && m.pendingMentor && (
                    <div className="mt-3 pt-3 border-t border-border/60 space-y-2 font-mono">
                      <div className="flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                        <span>◆ Set Your Target Offer Price:</span>
                        <span className="text-muted-foreground font-normal">Base: ~₹{m.pendingMentor.basePriceInr}</span>
                      </div>

                      {/* Quick Offer Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          Math.max(150, m.pendingMentor.basePriceInr - 100),
                          Math.max(200, m.pendingMentor.basePriceInr - 50),
                          m.pendingMentor.basePriceInr,
                          m.pendingMentor.basePriceInr + 50,
                        ].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleConfirmOffer(m.pendingMentor!, p)}
                            className="rounded-md border border-blue-500/40 bg-background hover:bg-blue-600 hover:text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer shadow-xs"
                          >
                            Offer ₹{p}
                          </button>
                        ))}
                      </div>

                      {/* Custom Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                          <span className="text-xs font-bold text-muted-foreground">₹</span>
                          <input
                            type="number"
                            placeholder={String(m.pendingMentor.basePriceInr)}
                            value={customOfferInput}
                            onChange={(e) => setCustomOfferInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = parseInt(customOfferInput, 10);
                                if (!isNaN(val) && val > 0) {
                                  handleConfirmOffer(m.pendingMentor!, val);
                                }
                              }
                            }}
                            className="w-20 bg-transparent text-xs font-bold text-foreground outline-none text-right"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const val = parseInt(customOfferInput, 10);
                            if (!isNaN(val) && val > 0) {
                              handleConfirmOffer(m.pendingMentor!, val);
                            }
                          }}
                          className="rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-bold px-3 py-1.5 transition shadow-xs cursor-pointer"
                        >
                          Confirm Offer →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 border border-border/40 px-4 py-2 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-blue-500 animate-bounce" />
                <span className="size-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                <span className="size-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                <span className="mono text-[10px]">Gemini is reasoning…</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="border-t border-border/50 bg-background/50 px-3 py-2 flex flex-wrap gap-1.5">
          <span className="mono text-[9px] text-muted-foreground self-center mr-1">
            Quick Prompts:
          </span>
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={busy}
              className="mono text-[9px] px-2.5 py-1 rounded border border-border hover:border-blue-500 text-muted-foreground hover:text-foreground transition disabled:opacity-50"
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t border-border p-3 bg-card flex items-center gap-2">
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your colleges, doubts, rank, or branch preference…"
            disabled={busy}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-blue-500 disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage()}
            disabled={busy || !inputVal.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send →
          </button>
        </div>
      </div>

      {/* RIGHT: Subtle "UNDERSTOOD" Panel (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
            <div className="mono text-[10px] uppercase font-bold tracking-[0.2em] text-blue-600 dark:text-blue-400">
              ◆ UNDERSTOOD PREFERENCES
            </div>
            <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Live AI Structured Model
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs font-mono">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Candidate & Rank</span>
              <span className="font-bold text-foreground">
                {profile.stage} · #{profile.rank?.toLocaleString() || "7,207"} AIR ({profile.exam})
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Considered Colleges</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.consideredColleges.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded bg-background border border-border text-[11px] font-semibold text-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Target Branch</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.preferredBranches.map((b) => (
                  <span key={b} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Primary Priorities</span>
              <p className="text-[11px] text-foreground font-sans mt-0.5">
                {profile.primaryPriorities.join(" · ")}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">Specific Doubts Formulated</span>
              <ul className="mt-1 space-y-1 text-[11px] text-muted-foreground font-sans list-disc list-inside">
                {profile.specificDoubts.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 pt-4 border-t border-blue-500/20 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => onOpenRefineList(profile)}
              className="flex-1 rounded-lg border border-border bg-card px-3.5 py-2.5 text-center text-xs font-bold text-foreground transition hover:border-blue-500"
            >
              Refine My College List ↗
            </button>
            <button
              onClick={() => onProceedToMatches(profile)}
              className="flex-1 rounded-lg bg-blue-600 px-3.5 py-2.5 text-center text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm"
            >
              Find Matching Mentors →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
