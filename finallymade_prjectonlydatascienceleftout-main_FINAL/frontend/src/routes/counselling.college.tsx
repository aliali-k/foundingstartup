import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { CounsellingHeader } from "@/components/counselling/CounsellingHeader";
import { SeekerIntakeChat, type SeekerStructuredProfile } from "@/components/counselling/SeekerIntakeChat";
import { CollegeRefineModal } from "@/components/counselling/CollegeRefineModal";
import { MentorCard } from "@/components/counselling/MentorCard";
import { MentorFilterBar, type ActiveFilters } from "@/components/counselling/MentorFilterBar";
import { FreeChatDrawer } from "@/components/counselling/FreeChatDrawer";
import { MentorProfileModal } from "@/components/counselling/MentorProfileModal";
import { MultiMentorModal } from "@/components/counselling/MultiMentorModal";
import { matchMentorsForCollege } from "@/lib/matching-engine";
import { type MentorProfile } from "@/data/mentors";
import { type CounsellingRequest } from "@/lib/counselling-store";

export const Route = createFileRoute("/counselling/college")({
  component: CollegeGuidancePage,
  validateSearch: (search: Record<string, unknown>) => ({
    college: typeof search.college === "string" ? search.college : undefined,
    rank: typeof search.rank === "string" ? search.rank : undefined,
    branch: typeof search.branch === "string" ? search.branch : undefined,
  }),
});

function CollegeGuidancePage() {
  const search = useSearch({ from: "/counselling/college" });
  const navigate = useNavigate();

  const [currentProfile, setCurrentProfile] = useState<SeekerStructuredProfile>({
    stage: "Class 12 / JEE Aspirant",
    exam: "JEE Main 2026",
    rank: search.rank ? parseInt(search.rank, 10) : 32450,
    consideredColleges: search.college
      ? [search.college, "PEC / NIT Chandigarh", "IIT Kanpur"]
      : ["NIT Kurukshetra", "PEC / NIT Chandigarh", "IIT Kanpur"],
    preferredBranches: search.branch ? [search.branch] : ["Mechanical Engineering"],
    primaryPriorities: ["Core internships & placements", "Hostel culture"],
    specificDoubts: ["Automotive recruiters on campus", "Branch change CGPA threshold", "IT placement eligibility"],
  });

  const [refineModalOpen, setRefineModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [selectedMentorForChat, setSelectedMentorForChat] = useState<MentorProfile | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [multiModalOpen, setMultiModalOpen] = useState(false);
  const [activeReqForMulti, setActiveReqForMulti] = useState<CounsellingRequest | null>(null);

  // Compute matched mentors deterministically
  const rawMatches = matchMentorsForCollege({
    collegeNames: activeFilters.college ? [activeFilters.college] : currentProfile.consideredColleges,
    branch: activeFilters.branch || currentProfile.preferredBranches[0],
    concerns: currentProfile.specificDoubts,
  });

  // Apply active facet filters
  const filteredMatches = rawMatches.filter((m) => {
    if (activeFilters.maxPrice && m.mentor.priceRange.min > activeFilters.maxPrice) return false;
    if (activeFilters.minRating && m.mentor.rating < activeFilters.minRating) return false;
    return true;
  });

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

  const handleOpenMulti = (req: CounsellingRequest) => {
    setActiveReqForMulti(req);
    setMultiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <CounsellingHeader activeSection="seeker" />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-10">
        {/* Page Title */}
        <div className="border-b border-border pb-4">
          <div className="mono text-[10.5px] uppercase font-bold tracking-[0.22em] text-blue-500">
            ◆ 01 · COLLEGE GUIDANCE & ADMISSION MATCHING
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-1 text-foreground">
            Explore Colleges with Seniors Who Lived It
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            AI understands your doubts → Refines your choices → Connects you with verified seniors for free scope verification.
          </p>
        </div>

        {/* ─── SECTION 1: AI CONVERSATIONAL INTAKE ─── */}
        <section>
          <SeekerIntakeChat
            initialContext={{
              college: search.college,
              rank: search.rank,
              branch: search.branch,
            }}
            onProceedToMatches={(p) => setCurrentProfile(p)}
            onOpenRefineList={(p) => {
              setCurrentProfile(p);
              setRefineModalOpen(true);
            }}
          />
        </section>

        {/* ─── SECTION 2: MATCHING MENTORS GRID ─── */}
        <section className="space-y-6 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mono text-[10px] uppercase font-bold tracking-wider text-blue-500">
                ◆ TOP ADMISSION MATCHES
              </div>
              <h2 className="text-2xl font-black tracking-tight text-foreground mt-0.5">
                {filteredMatches.length} Verified Mentors Found
              </h2>
            </div>
            <button
              onClick={() => setRefineModalOpen(true)}
              className="rounded-xl border border-border bg-card hover:border-blue-500 px-4 py-2 text-xs font-mono font-bold text-foreground transition"
            >
              ✦ Refine College Order with Gemini ↗
            </button>
          </div>

          {/* Filter Bar */}
          <MentorFilterBar
            filters={activeFilters}
            onChange={(updated) => setActiveFilters(updated)}
          />

          {/* Mentor Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map((res, idx) => (
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

      {/* College Refinement Modal */}
      <CollegeRefineModal
        isOpen={refineModalOpen}
        onClose={() => setRefineModalOpen(false)}
        initialColleges={currentProfile.consideredColleges}
        onSelectCollege={(college) => {
          setActiveFilters({ ...activeFilters, college });
        }}
      />

      {/* Free Pre-Session Chat Drawer */}
      {selectedMentorForChat && (
        <FreeChatDrawer
          isOpen={chatDrawerOpen}
          onClose={() => setChatDrawerOpen(false)}
          mentor={selectedMentorForChat}
          initialQuestion={`Hi ${selectedMentorForChat.name.split(" ")[0]}, can you help me understand on-campus core internships and placement reality for ${selectedMentorForChat.branch} at ${selectedMentorForChat.collegeName}?`}
          onRequestQuote={handleRequestQuote}
          onOpenMultiMentorModal={handleOpenMulti}
        />
      )}

      {/* Multi-Mentor Broadcast Modal */}
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
