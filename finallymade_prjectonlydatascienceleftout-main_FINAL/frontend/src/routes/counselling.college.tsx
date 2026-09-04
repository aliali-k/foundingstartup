import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { CounsellingHeader } from "@/components/counselling/CounsellingHeader";
import { SeekerIntakeChat, type SeekerStructuredProfile } from "@/components/counselling/SeekerIntakeChat";
import { CollegeRefineModal } from "@/components/counselling/CollegeRefineModal";
import { MentorCard } from "@/components/counselling/MentorCard";
import { MentorFilterBar, type ActiveFilters } from "@/components/counselling/MentorFilterBar";
import { MentorProfileModal } from "@/components/counselling/MentorProfileModal";
import { QuoteComparisonGrid } from "@/components/counselling/QuoteComparisonGrid";
import { matchMentorsForCollege } from "@/lib/matching-engine";
import { type MentorProfile } from "@/data/mentors";
import {
  createAgentBookingRequest,
  getRequestById,
  getAllRequests,
  type AgentMentorBooking,
  type CounsellingRequest,
} from "@/lib/counselling-store";

export const Route = createFileRoute("/counselling/college")({
  component: CollegeGuidancePage,
  validateSearch: (search: Record<string, unknown>) => ({
    college: typeof search.college === "string" ? search.college : undefined,
    rank: typeof search.rank === "string" ? search.rank : undefined,
    branch: typeof search.branch === "string" ? search.branch : undefined,
    requestId: typeof search.requestId === "string" ? search.requestId : undefined,
  }),
});

function CollegeGuidancePage() {
  const search = useSearch({ from: "/counselling/college" });
  const navigate = useNavigate();
  const compareSectionRef = useRef<HTMLDivElement | null>(null);

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

  // Agent Communication: Track selected mentors & communication modes
  const [selectedBookings, setSelectedBookings] = useState<Map<string, AgentMentorBooking>>(new Map());
  const [activeRequestId, setActiveRequestId] = useState<string | null>(search.requestId || null);

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

  const handleSelectMentorForAgent = (mentor: MentorProfile, mode: "video" | "chat") => {
    setSelectedBookings((prev) => {
      const next = new Map(prev);
      next.set(mentor.id, {
        helperId: mentor.id,
        helperName: mentor.name,
        mode,
      });
      return next;
    });
  };

  const handleDeselectMentor = (mentor: MentorProfile) => {
    setSelectedBookings((prev) => {
      const next = new Map(prev);
      next.delete(mentor.id);
      return next;
    });
  };

  // Called when Seeker types natural language booking in chat (e.g. "book video session with raj and chat session with kabir")
  const handleAgentBookingTriggered = (
    selectedMentors: Array<{ helperId: string; helperName: string; mode: "video" | "chat" }>,
    queries: string[]
  ) => {
    setSelectedBookings((prev) => {
      const next = new Map(prev);
      selectedMentors.forEach((sm) => next.set(sm.helperId, sm));
      return next;
    });

    const req = createAgentBookingRequest({
      seekerName: "Candidate",
      title: `${currentProfile.consideredColleges[0] || "College"} Admissions & Branch Strategy`,
      questions: queries.length > 0 ? queries : currentProfile.specificDoubts,
      mentorBookings: selectedMentors,
      context: currentProfile,
    });

    setActiveRequestId(req.id);

    // Scroll to Compare Quotes section
    setTimeout(() => {
      compareSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  // Called when Seeker clicks "Dispatch Request via AI Agent" button
  const handleDispatchAgentRequest = () => {
    const bookings = Array.from(selectedBookings.values());
    if (bookings.length === 0) return;

    const req = createAgentBookingRequest({
      seekerName: "Candidate",
      title: `${currentProfile.consideredColleges[0] || "College"} Guidance`,
      questions: currentProfile.specificDoubts,
      mentorBookings: bookings,
      context: currentProfile,
    });

    setActiveRequestId(req.id);

    setTimeout(() => {
      compareSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const activeRequest: CounsellingRequest | undefined =
    (activeRequestId && getRequestById(activeRequestId)) ||
    (search.requestId && getRequestById(search.requestId)) ||
    undefined;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      <CounsellingHeader activeSection="seeker" />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-12">
        {/* Page Title */}
        <div className="border-b border-border pb-4">
          <div className="mono text-[10.5px] uppercase font-bold tracking-[0.22em] text-blue-500">
            ◆ 01 · AGENT-MEDIATED COUNSELLING & SENIOR GUIDANCE
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-1 text-foreground">
            Explore Colleges with Seniors via Central AI Agent
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            AI Agent understands your doubts → Matches top seniors → Coordinates multi-mentor booking requests and quotes automatically.
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
            availableMentors={filteredMatches.map((m) => ({
              id: m.mentor.id,
              name: m.mentor.name,
              collegeName: m.mentor.collegeName,
              branch: m.mentor.branch,
            }))}
            onProceedToMatches={(p) => setCurrentProfile(p)}
            onOpenRefineList={(p) => {
              setCurrentProfile(p);
              setRefineModalOpen(true);
            }}
            onAgentBookingTriggered={handleAgentBookingTriggered}
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
                {filteredMatches.length} Verified Mentors Available for Agent Booking
              </h2>
            </div>
            <button
              onClick={() => setRefineModalOpen(true)}
              className="rounded-xl border border-border bg-card hover:border-blue-500 px-4 py-2 text-xs font-mono font-bold text-foreground transition cursor-pointer"
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
            {filteredMatches.map((res, idx) => {
              const selectedMode = selectedBookings.get(res.mentor.id)?.mode || null;
              return (
                <MentorCard
                  key={res.mentor.id}
                  index={idx}
                  mentor={res.mentor}
                  matchPercentage={res.matchPercentage}
                  reasons={res.highlightReasons}
                  selectedMode={selectedMode}
                  onSelectForAgent={handleSelectMentorForAgent}
                  onDeselect={handleDeselectMentor}
                  onViewProfile={(m) => handleOpenProfile(m, res.matchPercentage, res.highlightReasons)}
                />
              );
            })}
          </div>
        </section>

        {/* ─── SECTION 3: COMPARE QUOTES WITH AI SCOPE GUIDANCE ─── */}
        <section ref={compareSectionRef} className="space-y-6 pt-8 border-t border-border">
          <div className="border-b border-border pb-4">
            <div className="mono text-[10.5px] uppercase font-bold tracking-[0.22em] text-purple-600 dark:text-purple-400">
              ◆ SECTION 3 · COMPARE QUOTES WITH AI SCOPE GUIDANCE
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1 text-foreground">
              Compare Quotes & Scope Depth
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              The AI Agent dispatches your queries to selected seniors. Helper quotes stream in below with Gemini trade-off reasoning.
            </p>
          </div>

          {activeRequest ? (
            <QuoteComparisonGrid request={activeRequest} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-10 text-center space-y-2">
              <span className="mono text-xs font-bold text-foreground block">
                No active quote request dispatched yet.
              </span>
              <p className="text-xs text-muted-foreground font-sans max-w-md mx-auto">
                Tell the AI Agent above: <span className="font-mono text-blue-500">"Book video session with Raj and chat session with Kabir"</span> or select Video/Chat on mentor cards above to generate quotes.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Agent Dispatch Dock */}
      {selectedBookings.size > 0 && !activeRequestId && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl rounded-2xl border border-blue-500/50 bg-background/95 backdrop-blur-md shadow-2xl p-4 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <span className="size-2.5 rounded-full bg-blue-500 animate-ping" />
            <div>
              <div className="mono text-xs font-bold text-foreground">
                {selectedBookings.size} Mentor{selectedBookings.size > 1 ? "s" : ""} Queued for Agent
              </div>
              <div className="text-[11px] text-muted-foreground font-sans truncate max-w-xs sm:max-w-md">
                {Array.from(selectedBookings.values()).map(b => `${b.helperName.split(" ")[0]} (${b.mode === "video" ? "📹" : "💬"})`).join(", ")} · {currentProfile.specificDoubts.length} queries attached
              </div>
            </div>
          </div>

          <button
            onClick={handleDispatchAgentRequest}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white font-mono transition shadow-md whitespace-nowrap cursor-pointer"
          >
            Tell Agent to Request Quotes →
          </button>
        </div>
      )}

      {/* College Refinement Modal */}
      <CollegeRefineModal
        isOpen={refineModalOpen}
        onClose={() => setRefineModalOpen(false)}
        initialColleges={currentProfile.consideredColleges}
        onSelectCollege={(college) => {
          setActiveFilters({ ...activeFilters, college });
        }}
      />

      {/* Mentor Profile Modal */}
      <MentorProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        mentor={selectedMentorForProfile?.mentor ?? null}
        matchPercentage={selectedMentorForProfile?.matchPercentage ?? 94}
        matchReasons={selectedMentorForProfile?.highlightReasons ?? []}
        selectedMode={selectedMentorForProfile ? selectedBookings.get(selectedMentorForProfile.mentor.id)?.mode : null}
        onSelectForAgent={(m, mode) => {
          handleSelectMentorForAgent(m, mode);
        }}
      />
    </div>
  );
}
