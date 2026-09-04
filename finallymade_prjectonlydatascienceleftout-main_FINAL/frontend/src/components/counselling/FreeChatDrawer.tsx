import { useState, useEffect } from "react";
import { type MentorProfile } from "@/data/mentors";
import {
  getChatMessages,
  appendChatMessage,
  type ChatMessage,
  type CounsellingRequest,
  saveRequest,
  getAllRequests,
} from "@/lib/counselling-store";
import { callGeminiTask } from "@/lib/gemini-client";

export function FreeChatDrawer({
  isOpen,
  onClose,
  mentor,
  initialQuestion,
  onRequestQuote,
  onOpenMultiMentorModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  mentor: MentorProfile;
  initialQuestion?: string;
  onRequestQuote: (mentor: MentorProfile, request: CounsellingRequest) => void;
  onOpenMultiMentorModal: (request: CounsellingRequest) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState(initialQuestion || "");
  const [busy, setBusy] = useState(false);
  const [activeRequest, setActiveRequest] = useState<CounsellingRequest | null>(null);
  const [showMultiPrompt, setShowMultiPrompt] = useState(false);

  // Initialize or load chat for this mentor
  useEffect(() => {
    if (!isOpen || !mentor) return;

    const allReqs = getAllRequests();
    let req = allReqs.find((r) => r.activeHelperId === mentor.id || r.sentToHelperIds.includes(mentor.id));

    if (!req) {
      req = {
        id: `req-${Date.now()}`,
        seekerId: "current-seeker",
        seekerName: "Aman (Class 12 / JEE Aspirant)",
        seekerType: "class_12_jee",
        title: `Guidance for ${mentor.collegeName} (${mentor.branch})`,
        category: "college_guidance",
        rawText: initialQuestion || `Doubt about ${mentor.branch} at ${mentor.collegeName}`,
        normalizedSummary: `Seeking advice from ${mentor.name} on ${mentor.branch} at ${mentor.collegeName}, focusing on core internships and branch change.`,
        context: {
          consideredColleges: [mentor.collegeName],
          preferredBranches: [mentor.branch],
        },
        questions: initialQuestion ? [initialQuestion] : ["Can you help me understand on-campus core internships and placement reality?"],
        requestedServiceId: "college-branch-deep-dive",
        preferredFormat: "call",
        sentToHelperIds: [mentor.id],
        receivedQuotes: [],
        activeHelperId: mentor.id,
        status: "chatting",
        createdAt: new Date().toISOString(),
      };
      saveRequest(req);
    }

    setActiveRequest(req);
    const existingChats = getChatMessages(req.id);

    if (existingChats.length === 0) {
      // Seed welcome prompt from helper
      const welcome: ChatMessage = {
        id: `w-${Date.now()}`,
        requestId: req.id,
        senderId: mentor.id,
        senderRole: "helper",
        text: `Hi! I'm ${mentor.name} (${mentor.degree} ${mentor.branch} from ${mentor.collegeName}). What specific doubts do you have about the branch or campus? Ask me for free so we can make sure this is the exact right fit before booking.`,
        timestamp: "Just now",
      };
      appendChatMessage(req.id, welcome);
      setMessages([welcome]);
    } else {
      setMessages(existingChats);
    }
  }, [isOpen, mentor]);

  if (!isOpen || !mentor) return null;

  const sendMessage = async () => {
    const text = inputVal.trim();
    if (!text || busy || !activeRequest) return;

    setInputVal("");
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId: activeRequest.id,
      senderId: "current-seeker",
      senderRole: "seeker",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    appendChatMessage(activeRequest.id, userMsg);
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);

    // Call Gemini (or local fallback) to simulate mentor's reply
    try {
      const res = await callGeminiTask("helper_response", {
        helperName: mentor.name,
        helperBranch: mentor.branch,
        helperCollege: mentor.collegeName,
        seekerMessage: text,
      });

      const helperReplyText = res.data?.response || `Yes, I can definitely help with that. That is right in my wheelhouse at ${mentor.collegeName}.`;

      const helperMsg: ChatMessage = {
        id: `msg-h-${Date.now()}`,
        requestId: activeRequest.id,
        senderId: mentor.id,
        senderRole: "helper",
        text: helperReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isAiAssisted: true,
      };

      appendChatMessage(activeRequest.id, helperMsg);
      setMessages((prev) => [...prev, helperMsg]);

      // Show multi-mentor prompt after first substantive exchange
      setShowMultiPrompt(true);
    } catch (e) {
      console.error("Helper reply error:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-card h-full flex flex-col border-l border-border shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="border-b border-border p-4 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={mentor.avatarUrl}
              alt={mentor.name}
              className="size-10 rounded-full border border-border object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground font-mono">{mentor.name}</h3>
                <span className="mono text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                  FREE PRE-SESSION CHAT
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-sans">
                {mentor.currentRole} · {mentor.collegeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Soft Scope Banner */}
        <div className="border-b border-border/80 bg-blue-500/5 px-4 py-2 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
          <span>ℹ Free chat is for fit & scope confirmation. Detailed advice is in the 1-on-1 session.</span>
          <span className="text-foreground font-bold shrink-0 ml-2">₹0 Due</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.senderRole === "seeker" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed font-sans ${
                  m.senderRole === "seeker"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-muted/70 text-foreground border border-border/60"
                }`}
              >
                {m.text}
                <span
                  className={`block text-[9px] font-mono mt-1 ${
                    m.senderRole === "seeker" ? "text-blue-100" : "text-muted-foreground"
                  }`}
                >
                  {m.timestamp}
                  {m.isAiAssisted && " · Grounded Helper Simulation"}
                </span>
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-muted/40 border border-border/40 px-3.5 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="mono text-[10px]">{mentor.name} is typing response…</span>
              </div>
            </div>
          )}

          {/* AI Multi-Mentor Opportunity Callout */}
          {showMultiPrompt && activeRequest && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3.5 text-xs font-mono space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-300 font-bold text-[11px]">
                <span>✦ AI MATCHING BROKER</span>
              </div>
              <p className="text-foreground/90 font-sans text-[11.5px] leading-relaxed">
                "I found 3 other mentors with matching backgrounds ({mentor.collegeName} & {mentor.branch}). Would you like me to broadcast this same request to them so you can compare multiple quotes?"
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenMultiMentorModal(activeRequest)}
                  className="rounded bg-purple-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-purple-700 transition"
                >
                  Broadcast to Matching Mentors →
                </button>
                <button
                  type="button"
                  onClick={() => setShowMultiPrompt(false)}
                  className="rounded border border-border bg-background px-2.5 py-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Only {mentor.name.split(" ")[0]}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions & Input */}
        <div className="border-t border-border p-3 bg-card space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={`Ask ${mentor.name.split(" ")[0]} preliminary doubts…`}
              disabled={busy}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={busy || !inputVal.trim()}
              className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-40"
            >
              Ask →
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="mono text-[10px] text-muted-foreground">
              Scope verified? Request a quote:
            </span>
            <button
              type="button"
              onClick={() => activeRequest && onRequestQuote(mentor, activeRequest)}
              className="mono text-[10.5px] font-bold px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Request 1-on-1 Quote →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
