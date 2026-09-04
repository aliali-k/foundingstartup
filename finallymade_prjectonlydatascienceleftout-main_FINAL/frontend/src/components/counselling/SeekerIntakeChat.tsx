import { useState } from "react";
import { callGeminiTask } from "@/lib/gemini-client";

export interface SeekerStructuredProfile {
  stage: string;
  exam: string;
  rank?: number;
  consideredColleges: string[];
  preferredBranches: string[];
  primaryPriorities: string[];
  specificDoubts: string[];
}

interface IntakeMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
}

export function SeekerIntakeChat({
  initialContext,
  availableMentors = [],
  onProceedToMatches,
  onOpenRefineList,
  onAgentBookingTriggered,
}: {
  initialContext?: {
    college?: string;
    rank?: string;
    branch?: string;
  };
  availableMentors?: Array<{ id: string; name: string; collegeName: string; branch: string }>;
  onProceedToMatches: (profile: SeekerStructuredProfile) => void;
  onOpenRefineList: (profile: SeekerStructuredProfile) => void;
  onAgentBookingTriggered?: (selectedMentors: Array<{ helperId: string; helperName: string; mode: "video" | "chat" }>, queries: string[]) => void;
}) {
  const [profile, setProfile] = useState<SeekerStructuredProfile>({
    stage: "Class 12 / JEE Aspirant",
    exam: "JEE Main 2026",
    rank: initialContext?.rank ? parseInt(initialContext.rank, 10) : 32450,
    consideredColleges: initialContext?.college
      ? [initialContext.college, "PEC / NIT Chandigarh", "IIT Kanpur"]
      : ["NIT Kurukshetra", "PEC / NIT Chandigarh", "IIT Kanpur"],
    preferredBranches: initialContext?.branch ? [initialContext.branch] : ["Mechanical Engineering"],
    primaryPriorities: ["Core internships & placements", "Hostel culture"],
    specificDoubts: ["Automotive recruiters on campus", "Branch change CGPA threshold", "IT placement eligibility"],
  });

  const [messages, setMessages] = useState<IntakeMessage[]>([
    {
      id: "m-0",
      sender: "ai",
      text: initialContext?.college
        ? `Hello! I am your AI Admissions & Mentorship Agent. I coordinate directly with seniors so you don't have to message them one by one. Ask me any doubt, or tell me: "book the video session with Raj and chat session with Kabir" to dispatch your booking request!`
        : `Hello! I am your AI Admissions & Mentorship Agent. I understand your queries, match you with verified seniors, and dispatch booking requests for you. Tell me your college doubts, or simply tell me: "book the video session with Raj and chat session with Kabir".`,
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>("AI Agent Ready (Gemini Active)");

  const sendMessage = async (customText?: string) => {
    const text = (customText || inputVal).trim();
    if (!text || busy) return;

    setInputVal("");
    const userMsg: IntakeMessage = { id: `u-${Date.now()}`, sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);
    setAiStatus("Agent reasoning & checking mentor booking commands…");

    try {
      const res = await callGeminiTask("agent_orchestrate", {
        userMessage: text,
        currentContext: profile,
        availableMentors: availableMentors.length > 0 ? availableMentors : undefined,
      });

      if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, sender: "ai", text: res.data.reply },
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

      // Check if user issued a booking command (e.g., "book video session with raj and chat session with kabir")
      if (res.data?.isBookingIntent && res.data?.selectedMentors?.length > 0) {
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
    "Book the video session with Raj and chat session with Kabir",
    "Book a video session with Riya Sharma for mechanical core placements",
    "Deciding between NIT Kurukshetra Mechanical and PEC. How is campus placement?",
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* LEFT / CENTER: Conversational Intake (7 cols) */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-blue-500 animate-ping" />
            <span className="mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
              Conversational Intake Assistant
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
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed font-sans ${
                  m.sender === "user"
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs"
                    : "bg-muted/70 text-foreground border border-border/60"
                }`}
              >
                {m.text}
              </div>
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
              "{q.slice(0, 45)}…"
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
                {profile.stage} · #{profile.rank?.toLocaleString() || "32,450"} AIR ({profile.exam})
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
