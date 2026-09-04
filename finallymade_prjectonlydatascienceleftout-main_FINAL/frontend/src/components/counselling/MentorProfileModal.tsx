import { useState } from "react";
import { type MentorProfile } from "@/data/mentors";
import { PLATFORM_SERVICES, type ServiceDefinition } from "@/data/services";

export function MentorProfileModal({
  mentor,
  matchPercentage = 94,
  matchReasons = [],
  isOpen,
  selectedMode = null,
  onClose,
  onSelectForAgent,
}: {
  mentor: MentorProfile | null;
  matchPercentage?: number;
  matchReasons?: string[];
  isOpen: boolean;
  selectedMode?: "video" | "chat" | null;
  onClose: () => void;
  onSelectForAgent?: (mentor: MentorProfile, mode: "video" | "chat") => void;
}) {
  const [selectedTab, setSelectedTab] = useState<"all" | "call" | "chat" | "audit">("all");

  if (!isOpen || !mentor) return null;

  const reasons = matchReasons.length > 0 ? matchReasons : mentor.highlightMatchReasons;

  // Filter services applicable for this mentor
  const services = PLATFORM_SERVICES.filter((s) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "call") return s.format === "call" || s.format === "mock_session";
    if (selectedTab === "chat") return s.format === "chat";
    if (selectedTab === "audit") return s.format === "document";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-background/80 backdrop-blur-md overflow-y-auto">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Profile Modal Container */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase font-bold tracking-[0.22em] text-blue-600 dark:text-blue-400">
              ✦ VERIFIED HELPER PROFILE
            </span>
            <span className="text-border font-mono">|</span>
            <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-bold">
              {mentor.simulatedBadge}
            </span>
          </div>

          <button
            onClick={onClose}
            className="size-8 rounded-full border border-border hover:border-neutral-400 bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition text-sm font-mono"
            aria-label="Close Profile"
          >
            ✕
          </button>
        </div>

        {/* Modal Body: 2-Column Editorial Grid (Inspired by Topmate reference, tuned to JoSAA) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/80">
          {/* ── LEFT COLUMN: MENTOR SIDEBAR (4 cols) ── */}
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 bg-muted/10">
            {/* Avatar & Availability */}
            <div className="flex flex-col items-start gap-4">
              <div className="relative">
                <img
                  src={mentor.avatarUrl}
                  alt={mentor.name}
                  className="size-24 rounded-2xl border-2 border-border object-cover shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[8px] font-bold shadow-xs">
                  <span className="size-1.5 rounded-full bg-white animate-pulse" />
                  AVAILABLE
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    {mentor.name}
                  </h2>
                </div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-sans mt-0.5">
                  {mentor.currentRole}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground mt-1">
                  {mentor.collegeName} · {mentor.branch}
                </p>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/80 bg-background p-3 text-center font-mono">
              <div>
                <span className="text-[9px] text-muted-foreground uppercase block">Rating</span>
                <span className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1 mt-0.5">
                  ★ {mentor.rating.toFixed(2)}
                </span>
              </div>
              <div className="border-x border-border/60">
                <span className="text-[9px] text-muted-foreground uppercase block">Sessions</span>
                <span className="text-sm font-bold text-foreground block mt-0.5">
                  {mentor.sessionsCount}+
                </span>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground uppercase block">Response</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  ~{mentor.avgResponseMinutes}m
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                About & Lived Experience
              </span>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                {mentor.bio}
              </p>
            </div>

            {/* Tags / Topics */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Areas of Direct Advice
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {mentor.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Action Button - Agent Mediated */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <div className="mono text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                ◆ Book via Central AI Agent
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectForAgent?.(mentor, "video");
                  }}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold py-2.5 text-center transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>📹 Video Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectForAgent?.(mentor, "chat");
                  }}
                  className="rounded-xl border border-border bg-background hover:border-blue-500 text-foreground font-mono text-xs font-bold py-2.5 text-center transition flex items-center justify-center gap-1.5"
                >
                  <span>💬 Text Chat</span>
                </button>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground text-center block">
                The AI Agent will dispatch your queries directly to {mentor.name.split(" ")[0]}
              </span>
            </div>
          </div>

          {/* ── RIGHT COLUMN: SERVICES & PACKAGES (7 cols) ── */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 bg-card flex flex-col justify-between">
            <div>
              {/* Category Filter Pills (like the Topmate tabs) */}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/70">
                <span className="font-mono text-xs font-bold tracking-wider text-foreground">
                  Available Services & Scopes
                </span>

                <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                  <button
                    onClick={() => setSelectedTab("all")}
                    className={`px-3 py-1 rounded-md transition ${
                      selectedTab === "all"
                        ? "bg-foreground text-background font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedTab("call")}
                    className={`px-3 py-1 rounded-md transition ${
                      selectedTab === "call"
                        ? "bg-foreground text-background font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    1:1 Call
                  </button>
                  <button
                    onClick={() => setSelectedTab("chat")}
                    className={`px-3 py-1 rounded-md transition ${
                      selectedTab === "chat"
                        ? "bg-foreground text-background font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Scope Chat
                  </button>
                  <button
                    onClick={() => setSelectedTab("audit")}
                    className={`px-3 py-1 rounded-md transition ${
                      selectedTab === "audit"
                        ? "bg-foreground text-background font-bold"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Audit
                  </button>
                </div>
              </div>

              {/* Service Package Cards Grid */}
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border hover:border-blue-500/70 bg-background p-4.5 transition-all hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-[9.5px]">
                        <span className="text-muted-foreground uppercase tracking-wider">
                          {svc.format === "call" ? "Video Meeting" : svc.format === "chat" ? "Priority Scope DM" : "Document Audit"} · {svc.typicalDurationMin}m
                        </span>
                        {svc.isFree && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 uppercase text-[8.5px]">
                            Recommended First
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-foreground mt-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {svc.title}
                      </h4>

                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-sans">
                        {svc.shortDesc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-foreground font-mono">
                          {svc.isFree ? "Free" : `₹${svc.basePriceInr}`}
                        </span>
                        {!svc.isFree && (
                          <span className="text-[9px] text-muted-foreground font-mono ml-1">
                            indicative
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectForAgent?.(mentor, svc.format === "chat" ? "chat" : "video");
                        }}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-[10px] font-bold px-3 py-1.5 transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Request via Agent</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why This Match Analytic Box */}
            <div className="mt-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 p-4 space-y-2">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  ✦ Why This Match For Your Doubts ({matchPercentage}% Match)
                </span>
              </div>
              <div className="grid gap-1.5 font-sans text-xs">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{r.replace(/^✓\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
