import { createFileRoute, useNavigate, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CounsellingHeader } from "@/components/counselling/CounsellingHeader";
import { useExamMode } from "@/lib/exam-mode-context";
import { getReport } from "@/lib/prediction-store";
import { MENTORS } from "@/data/mentors";

export const Route = createFileRoute("/counselling")({
  head: () => ({
    meta: [
      { title: "JoSAA & NEET Counselling · One-to-One Senior & Professional Guidance" },
      { name: "description", content: "Talk to seniors, alumni, and working professionals who have walked the path you are choosing." },
    ],
  }),
  component: CounsellingLayout,
});

function CounsellingLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isExactIndex = pathname === "/counselling" || pathname === "/counselling/";

  if (!isExactIndex) {
    return <Outlet />;
  }

  return <CounsellingHomePage />;
}

function CounsellingHomePage() {
  const navigate = useNavigate();
  const { isNeet } = useExamMode();
  const existingReport = getReport();

  const reportCollege = existingReport?.colleges?.[0]?.collegeName || (isNeet ? "AIIMS New Delhi" : "NIT Kurukshetra");
  const reportRank = existingReport?.student?.categoryRank || (isNeet ? 1420 : 32450);
  const reportBranch = existingReport?.colleges?.[0]?.programs?.[0]?.program || (isNeet ? "MBBS (Bachelor of Medicine & Surgery)" : "Mechanical Engineering");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <CounsellingHeader activeSection="seeker" />

      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 space-y-12">
        {/* ─── 1. EDITORIAL HERO SECTION ─── */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-mono font-bold ${
            isNeet
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          }`}>
            <span>◆</span>
            <span>{isNeet ? "NEET-UG · 1-ON-1 DOCTOR & SENIOR GUIDANCE" : "COUNSELLING · ONE-TO-ONE GUIDANCE"}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.08] text-foreground">
            Don’t just choose a path. <br />
            <span className="text-blue-600 dark:text-blue-400">Talk to someone</span> who has{" "}
            <span className="text-purple-600 dark:text-purple-400">already walked it.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
            Find seniors, alumni, and working professionals who can answer the questions that cutoffs and brochures cannot: real placement data, branch change reality, and day-to-day campus truth.
          </p>
        </section>

        {/* ─── 2. TWO PROMINENT MODE CARDS (EDITORIAL PASTEL CARDS) ─── */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Mode 01: College Guidance (Soft Sky/Blue Gradient Card) */}
          <div
            onClick={() => navigate({ to: "/counselling/college" })}
            className="group relative flex flex-col justify-between rounded-2xl border border-sky-200/80 dark:border-sky-800/40 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] dark:from-sky-950/20 dark:to-sky-900/10 p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-blue-700 dark:text-blue-400 font-bold tracking-[0.2em] uppercase text-[11px]">
                  01 · COLLEGE GUIDANCE
                </span>
                <span className="text-xl group-hover:scale-110 transition-transform">🏛</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-4">
                Talk to seniors from your considered colleges.
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Connect with seniors and recent graduates from NIT Kurukshetra, PEC Chandigarh, IIT Kanpur, IIT BHU, and 10+ institutions. Ask about cutoff reality, branch change, hostel life, and core vs software placements.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px]">
                <span className="px-2.5 py-1 rounded-md bg-white/80 dark:bg-black/30 border border-sky-300/60 dark:border-sky-700/40 text-blue-700 dark:text-blue-300 font-medium">
                  ✦ Cutoff Trade-offs
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/80 dark:bg-black/30 border border-sky-300/60 dark:border-sky-700/40 text-blue-700 dark:text-blue-300 font-medium">
                  ✦ Core Placements
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/80 dark:bg-black/30 border border-sky-300/60 dark:border-sky-700/40 text-blue-700 dark:text-blue-300 font-medium">
                  ✦ Branch Switch Reality
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-sky-200/80 dark:border-sky-800/40 flex items-center justify-between font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
              <span>EXPLORE COLLEGE ADVISORS →</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Mode 02: Career Guidance (Soft Purple/Violet Gradient Card) */}
          <div
            onClick={() => navigate({ to: "/counselling/career" })}
            className="group relative flex flex-col justify-between rounded-2xl border border-purple-200/80 dark:border-purple-800/40 bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] dark:from-purple-950/20 dark:to-purple-900/10 p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-purple-700 dark:text-purple-400 font-bold tracking-[0.2em] uppercase text-[11px]">
                  02 · CAREER GUIDANCE
                </span>
                <span className="text-xl group-hover:scale-110 transition-transform">⚡</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-4">
                Find professionals who are already there.
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Target mentors who are strictly ahead of you on the ladder. SDE-1 aiming for SDE-2, Mechanical to Backend switch, or preparing for product system design with senior engineers.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px]">
                <span className="px-2.5 py-1 rounded-md bg-white/80 dark:bg-black/30 border border-purple-300/60 dark:border-purple-700/40 text-purple-700 dark:text-purple-300 font-medium">
                  ✦ SDE-1 → SDE-2
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/80 dark:bg-black/30 border border-purple-300/60 dark:border-purple-700/40 text-purple-700 dark:text-purple-300 font-medium">
                  ✦ System Design
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/80 dark:bg-black/30 border border-purple-300/60 dark:border-purple-700/40 text-purple-700 dark:text-purple-300 font-medium">
                  ✦ Non-CS Switch
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-purple-200/80 dark:border-purple-800/40 flex items-center justify-between font-mono text-xs font-bold text-purple-700 dark:text-purple-300">
              <span>EXPLORE CAREER MENTORS →</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </section>

        {/* ─── 3. FROM YOUR JOSAA REPORT STRIP (MATCHING SCREENSHOT 1 WARM AMBER CARD) ─── */}
        <section className="rounded-2xl border border-amber-200/80 dark:border-amber-800/40 bg-gradient-to-br from-[#FEF9EE] to-[#FFF3DC] dark:from-amber-950/20 dark:to-amber-900/10 p-6 md:p-8 font-mono shadow-xs relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-200/70 dark:border-amber-800/40">
            <div>
              <div className="text-[10.5px] uppercase font-bold tracking-[0.22em] text-amber-700 dark:text-amber-400">
                01 · FROM YOUR JOSAA REPORT INTEGRATION
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-1 font-sans">
                Seamlessly Carry Over Your Prediction Radar
              </h3>
            </div>

            <span className="text-[11px] px-3 py-1 rounded-full bg-white/80 dark:bg-black/30 text-amber-800 dark:text-amber-300 border border-amber-300/60 font-bold">
              ✓ Prediction Radar Linked
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-white/70 dark:bg-black/20 p-4 space-y-1">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold block">Candidate Rank</span>
              <span className="text-2xl font-black text-neutral-900 dark:text-neutral-50">
                #{reportRank.toLocaleString()} AIR
              </span>
              <span className="text-[10px] text-neutral-500 block font-sans">
                JEE Main 2026 Session 2
              </span>
            </div>

            <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-white/70 dark:bg-black/20 p-4 space-y-1">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold block">Top Matched Institution</span>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-50 block truncate">
                {reportCollege}
              </span>
              <span className="text-[10px] text-neutral-500 block font-sans">
                {reportBranch}
              </span>
            </div>

            <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-white/70 dark:bg-black/20 p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold block">Available Mentors</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50 block mt-1">
                  {MENTORS.filter((m) => m.collegeName.includes("Kurukshetra") || m.collegeName.includes("PEC")).length} Verified Seniors Ready
                </span>
              </div>
              <button
                onClick={() =>
                  navigate({
                    to: "/counselling/college",
                    search: { college: reportCollege, rank: String(reportRank), branch: reportBranch },
                  })
                }
                className="mt-3 w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 transition shadow-xs text-center"
              >
                Ask a Senior from this College →
              </button>
            </div>
          </div>
        </section>

        {/* ─── 4. THE COMMUNITY SECTION (EXACT REPLICA FROM SCREENSHOT 4) ─── */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/70 pb-4">
            <div>
              <span className="font-mono text-[10.5px] font-bold tracking-[0.25em] text-blue-600 dark:text-blue-400 uppercase block">
                ✦ THE COMMUNITY
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mt-1">
                You won't be alone. Ever.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-sans max-w-md">
              Alumni from top companies and seniors from your target institutes guide you before you even fill your choices.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Alumni Network (Sky Blue) */}
            <div className="rounded-2xl border border-sky-200/80 dark:border-sky-800/40 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] dark:from-sky-950/20 dark:to-sky-900/10 p-5 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider">
                <span>✦ ALUMNI NETWORK</span>
                <span>01</span>
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                Seniors at Amazon, Google, Microsoft & startups
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Direct LinkedIn connections · Mock interview calls · Referral pipelines · Pre-joining guidance before day one.
              </p>
              <div className="flex items-center -space-x-2 pt-1">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Alumni" className="size-7 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Alumni" className="size-7 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" alt="Alumni" className="size-7 rounded-full border-2 border-white object-cover" />
                <span className="size-7 rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  +48
                </span>
              </div>
            </div>

            {/* Card 2: College Guidance (Mint Green) */}
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/40 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] dark:from-emerald-950/20 dark:to-emerald-900/10 p-5 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                <span>✦ COLLEGE GUIDANCE</span>
                <span>02</span>
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                Branch-specific real experiences from current students
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Hostel life · Faculty reality · Campus culture rated · Not what the brochure says — what students actually live.
              </p>
              <div className="flex items-center -space-x-2 pt-1">
                <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80" alt="Student" className="size-7 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Student" className="size-7 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Student" className="size-7 rounded-full border-2 border-white object-cover" />
                <span className="size-7 rounded-full bg-emerald-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  +112
                </span>
              </div>
            </div>

            {/* Card 3: Real Placement Insights (Amber/Peach) */}
            <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/40 bg-gradient-to-br from-[#FEF9EE] to-[#FFF3DC] dark:from-amber-950/20 dark:to-amber-900/10 p-5 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                <span>✦ REAL PLACEMENT INSIGHTS</span>
                <span>03</span>
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                Real placement data per branch & per year
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Median: ₹14 LPA · Top 10%: ₹45 LPA · Dream: ₹1.2 Cr · Know the numbers before you choose the branch.
              </p>
              <div className="flex items-center gap-2 pt-1 font-mono text-[10px] font-bold text-amber-800 dark:text-amber-300">
                <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-black/20 border border-amber-300">Google</span>
                <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-black/20 border border-amber-300">Qualcomm</span>
                <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-black/20 border border-amber-300">Stripe</span>
              </div>
            </div>

            {/* Card 4: Live Counselling (Coral/Rose) */}
            <div className="rounded-2xl border border-rose-200/80 dark:border-rose-800/40 bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] dark:from-rose-950/20 dark:to-rose-900/10 p-5 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider">
                <span>✦ LIVE COUNSELLING</span>
                <span>04</span>
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                Guidance during JoSAA choice filling
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Order choices by real data not hype · Avoid the trap: CSE in lower tier vs Top NIT Core · One right session = 4 right years.
              </p>
              <div className="flex items-center -space-x-2 pt-1">
                <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80" alt="Counselor" className="size-7 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" alt="Counselor" className="size-7 rounded-full border-2 border-white object-cover" />
                <span className="size-7 rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  Live
                </span>
              </div>
            </div>

            {/* Card 5: Branch Switch Hacks (Violet/Purple) */}
            <div className="rounded-2xl border border-purple-200/80 dark:border-purple-800/40 bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] dark:from-purple-950/20 dark:to-purple-900/10 p-5 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase tracking-wider">
                <span>✦ BRANCH SWITCH HACKS</span>
                <span>05</span>
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                Got Mech but want CS? Here is your roadmap
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Dual degrees · Interdisciplinary minors · Branch change CGPA cutoffs · Your branch is not your destiny — change it smartly.
              </p>
              <div className="flex items-center gap-1.5 pt-1 font-mono text-[10px] text-purple-700 dark:text-purple-300">
                <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-black/20 border border-purple-300">CGPA 9.2+ Target</span>
                <span className="px-2 py-0.5 rounded bg-white/80 dark:bg-black/20 border border-purple-300">CS Electives</span>
              </div>
            </div>

            {/* Card 6: Internship Pipeline (Teal/Cyan) */}
            <div className="rounded-2xl border border-teal-200/80 dark:border-teal-800/40 bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] dark:from-teal-950/20 dark:to-teal-900/10 p-5 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider">
                <span>✦ INTERNSHIP PIPELINE</span>
                <span>06</span>
              </div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                Referrals into FAANG, quant & top startups
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
                Alumni-referred students last season · Mock interviews · Cold email templates · Your first internship decides your job offer.
              </p>
              <div className="flex items-center -space-x-2 pt-1">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" alt="Intern" className="size-7 rounded-full border-2 border-white object-cover" />
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80" alt="Intern" className="size-7 rounded-full border-2 border-white object-cover" />
                <span className="size-7 rounded-full bg-teal-600 text-white font-mono text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  +85
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. CORE PLATFORM PHILOSOPHY BANNER ─── */}
        <section className="rounded-2xl border border-border/80 bg-muted/20 p-6 text-center space-y-2 font-mono text-xs text-muted-foreground">
          <p className="font-bold text-foreground uppercase tracking-wider text-[11px]">
            The MentorMatch Guarantee
          </p>
          <p className="font-sans max-w-2xl mx-auto leading-relaxed text-xs">
            Free pre-session chat for fit confirmation · Scope-based quotes · No hidden commissions · AI-powered comparison with zero vendor lock-in.
          </p>
        </section>
      </main>
    </div>
  );
}
