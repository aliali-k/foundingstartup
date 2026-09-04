import { useState, useEffect } from "react";
import { type SimulatedSession, completeSession } from "@/lib/counselling-store";
import { MENTORS } from "@/data/mentors";

export function SimulatedSessionPanel({
  session,
  onOpenReview,
}: {
  session: SimulatedSession;
  onOpenReview: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"call" | "chat" | "notes" | "request">("call");
  const [sessionSeconds, setSessionSeconds] = useState(140); // 2 mins in
  const [notes, setNotes] = useState<string[]>([
    ...session.notes,
    "1. Discussed on-campus summer internship timeline (companies start visiting in August).",
    "2. Hero MotoCorp takes ~15–20 Mechanical students directly via SAE Baja team interviews.",
    "3. First-year branch change requires roughly ~8.9 CGPA for Electrical and ~9.3 for CSE."
  ]);
  const [newNote, setNewNote] = useState("");
  const mentor = MENTORS.find((m) => m.id === session.helperId);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleEndSession = () => {
    completeSession(session.id);
    onOpenReview();
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote("");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg font-mono">
      {/* Session Top Bar */}
      <div className="border-b border-border bg-muted/40 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
                {session.status === "completed" ? "COMPLETED SESSION" : "LIVE 1-ON-1 SESSION"}
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/30">
                PAID · ₹{session.amountPaidInr}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
              Mentor: <strong className="text-foreground">{session.helperName}</strong> · {session.durationMin} Min Scope
            </p>
          </div>
        </div>

        {/* Live Timer & End Button */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-background border border-border px-3 py-1.5 text-xs font-bold text-foreground">
            ⏱ {formatTimer(sessionSeconds)} / {session.durationMin}:00
          </div>
          <button
            onClick={handleEndSession}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 transition shadow-xs"
          >
            End Session & Review →
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-background px-4 flex items-center gap-6 text-xs">
        {[
          { id: "call", label: "📹 Mock Video Call" },
          { id: "chat", label: "💬 Session Chat" },
          { id: "notes", label: "📝 Live Shared Notes" },
          { id: "request", label: "📋 Agreed Scope" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-3 border-b-2 font-bold transition-colors ${
              activeTab === t.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="p-6 min-h-[380px] bg-background/50">
        {activeTab === "call" && (
          <div className="grid gap-4 md:grid-cols-2 h-full">
            {/* Mentor Video Feed (Mock) */}
            <div className="rounded-2xl border border-border bg-neutral-950 relative overflow-hidden flex flex-col items-center justify-center min-h-[280px] text-white">
              {mentor && (
                <img
                  src={mentor.avatarUrl}
                  alt={mentor.name}
                  className="size-24 rounded-full border-2 border-white/20 object-cover shadow-xl mb-3"
                />
              )}
              <span className="text-sm font-bold">{session.helperName}</span>
              <span className="text-[10px] text-neutral-400 font-sans mt-0.5">
                {mentor?.currentRole} · Speaking
              </span>
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 text-[9px] font-mono">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>HD Audio/Video Active</span>
              </div>
              <div className="absolute bottom-3 right-3 text-[9px] text-neutral-400 font-mono">
                SIMULATED VIDEO PANEL
              </div>
            </div>

            {/* Candidate / Local Feed (Mock) */}
            <div className="rounded-2xl border border-border bg-neutral-900 relative overflow-hidden flex flex-col items-center justify-center min-h-[280px] text-white">
              <div className="size-20 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-xl font-bold mb-2">
                A
              </div>
              <span className="text-sm font-bold">You (Candidate)</span>
              <span className="text-[10px] text-neutral-400 font-mono">Audio Unmuted</span>
              <div className="absolute bottom-3 left-3 text-[9px] text-neutral-400 font-mono">
                Camera: OK
              </div>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="max-w-2xl space-y-4">
            <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
              Takeaways & Key Facts Documented During Call
            </h4>
            <div className="space-y-2">
              {notes.map((n, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-3 text-xs font-sans text-foreground leading-relaxed"
                >
                  {n}
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a takeaway note..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-blue-500 font-sans"
              />
              <button
                onClick={handleAddNote}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                + Add
              </button>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="max-w-2xl space-y-3 text-xs">
            <div className="rounded-lg bg-muted/40 p-3 text-foreground font-sans">
              <strong>{session.helperName}:</strong> Sharing the placement report PDF and the SAE Baja selection criteria in your notes tab right now!
            </div>
            <div className="rounded-lg bg-blue-600 text-white p-3 text-right font-sans">
              <strong>You:</strong> Got it! Thank you so much, this cleared up my entire doubt about the automotive internship pipeline.
            </div>
          </div>
        )}

        {activeTab === "request" && (
          <div className="max-w-2xl space-y-3 text-xs font-mono">
            <div className="rounded-xl bg-card border border-border p-4 space-y-2">
              <span className="text-muted-foreground uppercase text-[10px]">Agreed Scope:</span>
              <p className="text-foreground font-sans text-sm font-semibold">
                {session.serviceTitle}
              </p>
              <div className="pt-2 border-t border-border text-muted-foreground font-sans text-xs">
                Includes full discussion of core engineering internship eligibility, branch change thresholds, and direct comparison between Kurukshetra and Chandigarh campuses.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Safety & Moderation Footer */}
      <div className="border-t border-border bg-muted/20 px-4 py-2.5 text-[10px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
        <span>
          🛡 Session activity may be retained for moderation and dispute handling, subject to platform policy.
        </span>
        <div className="flex items-center gap-3">
          <button className="text-muted-foreground hover:text-foreground">Report Issue</button>
          <span>·</span>
          <button className="text-muted-foreground hover:text-foreground">Dispute</button>
        </div>
      </div>
    </div>
  );
}
