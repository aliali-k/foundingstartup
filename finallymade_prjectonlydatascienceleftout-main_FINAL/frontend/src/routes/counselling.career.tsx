import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CounsellingHeader } from "@/components/counselling/CounsellingHeader";
import { MentorCard } from "@/components/counselling/MentorCard";
import { MentorProfileModal } from "@/components/counselling/MentorProfileModal";
import { FreeChatDrawer } from "@/components/counselling/FreeChatDrawer";
import { MultiMentorModal } from "@/components/counselling/MultiMentorModal";
import { matchMentorsForCareer } from "@/lib/matching-engine";
import { callGeminiTask } from "@/lib/gemini-client";
import { type MentorProfile } from "@/data/mentors";
import { type CounsellingRequest } from "@/lib/counselling-store";

export const Route = createFileRoute("/counselling/career")({
  component: CareerGuidancePage,
});

function CareerGuidancePage() {
  const navigate = useNavigate();

  const [currentRole, setCurrentRole] = useState("Software Engineer I (SDE-1)");
  const [targetRole, setTargetRole] = useState("Software Engineer II (SDE-2)");
  const [expYears, setExpYears] = useState(1.5);
  const [techFocus, setTechFocus] = useState<string[]>(["Distributed Systems", "Backend APIs", "System Design"]);
  const [userQuery, setUserQuery] = useState(
    "I'm an SDE-1 with 1.5 years experience. I want to become SDE-2 at a Tier-1 product company. I am backend focused."
  );
  const [aiReply, setAiReply] = useState<string | null>(
    "Understood. You are an SDE-1 aiming for SDE-2. In Tier-1 engineering ladders, the step from SDE-1 to SDE-2 hinges on independently handling ambiguous system design, high throughput caching, and driving cross-team delivery. Here are verified mentors who are directly ahead of your path."
  );
  const [busy, setBusy] = useState(false);

  const [selectedMentorForChat, setSelectedMentorForChat] = useState<MentorProfile | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [multiModalOpen, setMultiModalOpen] = useState(false);
  const [activeReqForMulti, setActiveReqForMulti] = useState<CounsellingRequest | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedMentorForProfile, setSelectedMentorForProfile] = useState<{
    mentor: MentorProfile;
    matchPercentage: number;
    highlightReasons: string[];
  } | null>(null);

  const handleOpenProfile = (mentor: MentorProfile, matchPercentage: number = 94, highlightReasons: string[] = []) => {
    setSelectedMentorForProfile({ mentor, matchPercentage, highlightReasons });
    setProfileModalOpen(true);
  };

  // Match mentors using deterministic career-level progression rule
  const matchedResults = matchMentorsForCareer({
    currentRoleTitle: currentRole,
    targetRoleTitle: targetRole,
    experienceYears: expYears,
    technicalFocus: techFocus,
  });

  const handleRefineWithAi = async () => {
    if (!userQuery.trim() || busy) return;
    setBusy(true);

    try {
      const res = await callGeminiTask("career_intake", { userMessage: userQuery });
      if (res.data?.reply) setAiReply(res.data.reply);
      if (res.data?.extractedProfile) {
        if (res.data.extractedProfile.currentRole) setCurrentRole(res.data.extractedProfile.currentRole);
        if (res.data.extractedProfile.targetRole) setTargetRole(res.data.extractedProfile.targetRole);
        if (res.data.extractedProfile.experienceYears) setExpYears(res.data.extractedProfile.experienceYears);
        if (res.data.extractedProfile.technicalFocus) setTechFocus(res.data.extractedProfile.technicalFocus);
      }
    } catch (e) {
      console.error("Career AI Intake failed:", e);
    } finally {
      setBusy(false);
    }
  };

  const handleOpenFreeChat = (mentor: MentorProfile) => {
    setSelectedMentorForChat(mentor);
    setChatDrawerOpen(true);
  };

  const handleRequestQuote = (mentor: MentorProfile, req: CounsellingRequest) => {
    setChatDrawerOpen(false);
    navigate({
      to: "/counselling/compare",
      search: { requestId: req.id },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <CounsellingHeader activeSection="seeker" />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-10">
        {/* Title */}
        <div className="border-b border-border pb-4">
          <div className="mono text-[10.5px] uppercase font-bold tracking-[0.22em] text-purple-600 dark:text-purple-400">
            ◆ 02 · CAREER GUIDANCE & LEVEL-GAP MATCHING
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-1 text-foreground">
            Connect with Engineers & Leads Ahead on Your Path
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Strict Career Progression Rule: Mentors must be higher level (SDE-2 / Senior / Staff) than your current role.
          </p>
        </div>

        {/* ─── INTAKE & PROFILE CARDS ─── */}
        <div className="grid gap-6 lg:grid-cols-12 items-start font-mono">
          {/* Left: Interactive Goals Builder (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">
              Tell us where you are now — and where you want to go
            </span>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">
                  Current Role (Level 2)
                </label>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none"
                >
                  <option value="Software Engineer I (SDE-1)">Software Engineer I (SDE-1)</option>
                  <option value="Software Engineering Intern">Intern / Final Year Student</option>
                  <option value="Junior Data Scientist">Junior Data Scientist</option>
                  <option value="Design & R&D Mechanical Engineer">Mechanical Engineer (Non-CS)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">
                  Target Role (Level 3+)
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none font-bold text-purple-600 dark:text-purple-400"
                >
                  <option value="Software Engineer II (SDE-2)">Software Engineer II (SDE-2)</option>
                  <option value="Senior Software Engineer">Senior SDE / Lead</option>
                  <option value="Staff Software Engineer">Staff Engineer / Architect</option>
                  <option value="Backend Systems Switcher">Backend Systems Switcher</option>
                </select>
              </div>
            </div>

            {/* Freeform Prompt */}
            <div>
              <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-1">
                Refine With Natural Language (Gemini Reasoning)
              </label>
              <div className="flex gap-2">
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRefineWithAi()}
                  placeholder="e.g. 'I am backend focused, need help with system design promotion criteria'..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-purple-500 font-sans"
                />
                <button
                  onClick={handleRefineWithAi}
                  disabled={busy}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition"
                >
                  {busy ? "Parsing…" : "Refine →"}
                </button>
              </div>
            </div>

            {/* AI Reply Card */}
            {aiReply && (
              <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4 text-xs font-sans leading-relaxed text-foreground">
                <span className="mono text-[9px] font-bold text-purple-600 uppercase block mb-1">
                  ◆ Career Advisor Synthesis:
                </span>
                {aiReply}
              </div>
            )}
          </div>

          {/* Right: Progression Ladder Rule Card (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-border bg-muted/30 p-6 space-y-4 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              ✦ Level-Gated Matching Rule
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border">
                <span>You: {currentRole}</span>
                <span className="text-blue-500 font-bold">Level 2</span>
              </div>
              <div className="text-center text-muted-foreground text-[10px]">
                ↓ Prioritizing verified mentors at Level 3, 4 & 5 ↓
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold">
                <span>Target: {targetRole}</span>
                <span>Level 3+ Mentors</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
              We strictly deprioritize peer-level engineers and freshers. You will be matched with mentors who have either recently been promoted or hold senior technical decision-making authority.
            </p>
          </div>
        </div>

        {/* ─── MATCHED MENTORS LIST ─── */}
        <section className="space-y-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="mono text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                ◆ QUALIFIED SENIOR MENTORS
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground mt-0.5">
                {matchedResults.length} Engineers Ahead of Your Path
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matchedResults.map((res, idx) => (
              <MentorCard
                key={res.mentor.id}
                index={idx}
                mentor={res.mentor}
                matchPercentage={res.matchPercentage}
                reasons={res.highlightReasons}
                onAskForFree={handleOpenFreeChat}
                onViewProfile={(m) => handleOpenProfile(m, res.matchPercentage, res.highlightReasons)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Free Chat Drawer */}
      {selectedMentorForChat && (
        <FreeChatDrawer
          isOpen={chatDrawerOpen}
          onClose={() => setChatDrawerOpen(false)}
          mentor={selectedMentorForChat}
          initialQuestion={`Hi ${selectedMentorForChat.name.split(" ")[0]}, I am an SDE-1 aiming for SDE-2. Can you help assess my system design gap and project ownership scope?`}
          onRequestQuote={handleRequestQuote}
          onOpenMultiMentorModal={(req) => {
            setActiveReqForMulti(req);
            setMultiModalOpen(true);
          }}
        />
      )}

      {/* Multi-Mentor Modal */}
      {activeReqForMulti && (
        <MultiMentorModal
          isOpen={multiModalOpen}
          onClose={() => setMultiModalOpen(false)}
          request={activeReqForMulti}
        />
      )}

      {/* Mentor Profile Modal */}
      <MentorProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        mentor={selectedMentorForProfile?.mentor ?? null}
        matchPercentage={selectedMentorForProfile?.matchPercentage ?? 94}
        matchReasons={selectedMentorForProfile?.highlightReasons ?? []}
        onStartFreeChat={(m) => {
          setProfileModalOpen(false);
          handleOpenFreeChat(m);
        }}
      />
    </div>
  );
}
