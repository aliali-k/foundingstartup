import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ThemeSwitch } from "./ThemeSwitch";
import { getReportPdf } from "@/lib/prediction-store";
import type { ParsedReport } from "@/lib/parse-prediction-pdf";
import { BRANCH_PLANETS } from "@/lib/branch-planets";
import { NEET_COLLEGES, type PredictedNeetCollegeResult } from "@/lib/neet-mock-data";

// External "coming soon" placeholder for the College Rank Predictor feature.
const RANK_PREDICTOR_URL = "https://josaa-rank-predictor.lovable.app/";

/** Tiny inline line chart: marks (x) vs rank (y). Hard-coded prediction curve. */
function MarksVsRankChart({ color }: { color: string }) {
  const pts: [number, number][] = [
    [10, 40],
    [22, 30],
    [36, 22],
    [52, 16],
    [70, 11],
    [88, 8],
    [108, 6],
  ];
  const w = 132;
  const h = 44;
  const d =
    "M" +
    pts
      .map(([x, y], i) => {
        const px = 6 + (x / 120) * (w - 12);
        const py = 4 + (y / 44) * (h - 8);
        return `${i === 0 ? "" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      <line x1="6" y1={h - 4} x2={w - 6} y2={h - 4} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
      <path d={`${d} L${w - 6},${h - 4} L6,${h - 4} Z`} fill={color} fillOpacity="0.15" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {pts.map(([x, y], i) => {
        const px = 6 + (x / 120) * (w - 12);
        const py = 4 + (y / 44) * (h - 8);
        return <circle key={i} cx={px} cy={py} r="1.6" fill={color} />;
      })}
      <text x="6" y={h - 0.5} fontSize="6" fill="currentColor" fillOpacity="0.5">MARKS</text>
      <text x={w - 22} y={h - 0.5} fontSize="6" fill="currentColor" fillOpacity="0.5">RANK</text>
    </svg>
  );
}

/** NEET Marks vs AIR Rank SVG curve */
function NeetMarksVsAirChart({ userMarks, userAir }: { userMarks?: number; userAir?: number }) {
  // Score 720 -> AIR 1, Score 680 -> AIR 4k, Score 650 -> AIR 18k, Score 600 -> AIR 68k, Score 500 -> AIR 200k
  const pts: [number, number][] = [
    [10, 5],
    [28, 9],
    [48, 15],
    [70, 24],
    [92, 34],
    [114, 40],
  ];
  const w = 150;
  const h = 48;
  const d =
    "M" +
    pts
      .map(([x, y], i) => `${i === 0 ? "" : "L"}${x},${y}`)
      .join(" ");

  return (
    <div className="flex flex-col items-end">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
        <line x1="6" y1={h - 4} x2={w - 6} y2={h - 4} stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <path d={`${d} L${w - 6},${h - 4} L6,${h - 4} Z`} fill="#10b981" fillOpacity="0.18" />
        <path d={d} fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill="#10b981" />
        ))}
        {/* User indicator point */}
        <circle cx={48} cy={15} r="3.2" fill="#34d399" className="animate-pulse" />
        <text x="6" y={h - 0.5} fontSize="6" fill="#10b981" fillOpacity="0.8">720 MARKS</text>
        <text x={w - 38} y={h - 0.5} fontSize="6" fill="#10b981" fillOpacity="0.8">AIR 1–50K</text>
      </svg>
      <span className="mono text-[8px] text-emerald-500 font-semibold mt-0.5">
        YOUR CALIBRATED POSITION
      </span>
    </div>
  );
}

type TileKind = "download" | "link";

type Tile = {
  n: string;
  kind: TileKind;
  header: string;
  desc: string;
  cta: string;
  to?: string;
  glow: string;
  accent: string;
};

const JEE_NAV_TILES: Tile[] = [
  {
    n: "02",
    kind: "link",
    header: "One-to-One Connectivity",
    desc: "Connect personally with seniors and mentors for guidance tailored to your college and branch.",
    cta: "Find your mentor",
    to: "http://localhost:8084",
    glow: "#38bdf8",
    accent: "#38bdf8",
  },
  {
    n: "03",
    kind: "link",
    header: "Alternate Pathway Guidance",
    desc: "Beyond traditional colleges — skill-based learning tracks built for your future.",
    cta: "Explore pathways",
    to: "/alternate-pathway",
    glow: "#22d3a4",
    accent: "#22d3a4",
  },
  {
    n: "04",
    kind: "link",
    header: "Club Sessions & Hackathons",
    desc: "Live sessions from college clubs and societies, plus hackathons and competitions curated for you.",
    cta: "See what's live",
    to: "/clubs-hackathons",
    glow: "#f59e0b",
    accent: "#f59e0b",
  },
  {
    n: "05",
    kind: "link",
    header: "Global Pathways Explorer",
    desc: "Indian and foreign universities where your JEE score can open doors beyond the usual path.",
    cta: "Go global",
    to: "/global-pathways",
    glow: "#a78bfa",
    accent: "#a78bfa",
  },
  {
    n: "06",
    kind: "link",
    header: "Verify Your Result",
    desc: "Got your final seat? Tell us — help make predictions sharper for future students.",
    cta: "Verify now",
    to: "/verify-result",
    glow: "#f472b6",
    accent: "#f472b6",
  },
];

const NEET_NAV_TILES: Tile[] = [
  {
    n: "02",
    kind: "link",
    header: "AIIMS & PGI Resident Network",
    desc: "Connect with Senior Resident doctors across AIIMS New Delhi, PGI, and KGMU for clinical guidance.",
    cta: "Connect with Doctors",
    to: "http://localhost:8084",
    glow: "#10b981",
    accent: "#10b981",
  },
  {
    n: "03",
    kind: "link",
    header: "State Bond & Penalty Matrix",
    desc: "Detailed state-by-state mandatory service bonds (0 yrs up to 5 yrs) and financial penalties before locking choices.",
    cta: "Inspect Bonds",
    to: "/alternate-pathway",
    glow: "#06b6d4",
    accent: "#06b6d4",
  },
  {
    n: "04",
    kind: "link",
    header: "Clinical Bed Load & OPD Index",
    desc: "Hospital bed capacities, surgical case diversity, and OPD patient footfalls rated by current medical students.",
    cta: "Explore Hospital Stats",
    to: "/clubs-hackathons",
    glow: "#f59e0b",
    accent: "#f59e0b",
  },
  {
    n: "05",
    kind: "link",
    header: "USMLE & Global Doctor Pathways",
    desc: "ECFMG accreditation, United States Clinical Experience (USCE), and NHS PLAB medical licensing roadmaps.",
    cta: "Go Global Medical",
    to: "/global-pathways",
    glow: "#a78bfa",
    accent: "#a78bfa",
  },
  {
    n: "06",
    kind: "link",
    header: "Verify Final Seat Allotment",
    desc: "Got your Round 1/2 MCC seat? Confirm your college to sharpen cutoff AI models for future aspirants.",
    cta: "Verify Seat",
    to: "/verify-result",
    glow: "#f472b6",
    accent: "#f472b6",
  },
];

function TileLink({ to, children }: { to: string; children: React.ReactNode }) {
  if (to.startsWith("http")) {
    return <a href={to} target="_blank" rel="noopener noreferrer" className="contents">{children}</a>;
  }
  return <Link to={to} className="contents">{children}</Link>;
}

function TileShell({
  glow,
  children,
  onClick,
  className = "",
}: {
  glow: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`dashboard-tile group relative flex h-full min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 ${className}`}
      style={
        {
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--card) 92%, transparent) 0%, color-mix(in oklab, var(--card) 82%, transparent) 100%)",
          border: `1px solid color-mix(in oklab, ${glow} 45%, transparent)`,
          boxShadow: `0 0 0 1px color-mix(in oklab, ${glow} 12%, transparent), 0 24px 60px -30px color-mix(in oklab, ${glow} 55%, transparent)`,
          "--glow-color": glow,
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-24 opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: `radial-gradient(circle at 30% 20%, ${glow}, transparent 60%)` }}
      />
      <div className="relative z-10 flex h-full flex-col justify-between gap-4">
        {children}
      </div>
    </div>
  );
}

export function ResultDashboard({
  parsedReport,
  onReplay,
}: {
  parsedReport: ParsedReport;
  onReplay: () => void;
}) {
  const isNeet = parsedReport.isNeet || parsedReport.student?.examType?.toLowerCase().includes("neet");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // NEET Interactive Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedQuota, setSelectedQuota] = useState<string>("ALL");
  const [selectedCourse, setSelectedCourse] = useState<string>("ALL");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"nirf" | "beds" | "rank">("nirf");
  const [savedChoiceIds, setSavedChoiceIds] = useState<string[]>([]);

  const topCollege = parsedReport.colleges[0];

  // NEET Mock Prediction List
  const neetResultsList: PredictedNeetCollegeResult[] = useMemo(() => {
    if (parsedReport.neetResults && parsedReport.neetResults.length > 0) {
      return parsedReport.neetResults;
    }
    // Fallback: build matches from NEET_COLLEGES
    const userRank = parsedReport.student?.categoryRank || 2400;
    return NEET_COLLEGES.map((c) => {
      const prog = c.programs[0];
      const closing = prog.closingRank.UR;
      const ratio = closing / userRank;
      const tier: "HIGH" | "TARGET" | "REACH" = ratio >= 1.2 ? "HIGH" : ratio >= 0.8 ? "TARGET" : "REACH";
      return {
        college: c,
        matchedProgram: prog,
        closingRank: closing,
        userRank,
        chancePercent: Math.min(99, Math.max(12, Math.round(ratio * 75))),
        chanceTier: tier,
        badgeColor: tier === "HIGH" ? "#10b981" : tier === "TARGET" ? "#f59e0b" : "#ef4444",
      };
    });
  }, [parsedReport]);

  // Filtered NEET List
  const filteredNeetColleges = useMemo(() => {
    let list = neetResultsList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.college.name.toLowerCase().includes(q) ||
        item.college.shortName.toLowerCase().includes(q) ||
        item.college.city.toLowerCase().includes(q) ||
        item.college.state.toLowerCase().includes(q);

      const matchesState = selectedState === "ALL" || item.college.state === selectedState;
      const matchesQuota = selectedQuota === "ALL" || item.matchedProgram.quota.includes(selectedQuota);
      const matchesCourse = selectedCourse === "ALL" || item.matchedProgram.course === selectedCourse;
      const matchesTier = selectedTier === "ALL" || item.chanceTier === selectedTier;

      return matchesSearch && matchesState && matchesQuota && matchesCourse && matchesTier;
    });

    if (sortBy === "nirf") {
      list = [...list].sort((a, b) => a.college.nirfRank - b.college.nirfRank);
    } else if (sortBy === "beds") {
      list = [...list].sort((a, b) => b.college.hospitalBeds - a.college.hospitalBeds);
    } else if (sortBy === "rank") {
      list = [...list].sort((a, b) => a.closingRank - b.closingRank);
    }
    return list;
  }, [neetResultsList, searchQuery, selectedState, selectedQuota, selectedCourse, selectedTier, sortBy]);

  // Unique states for filter dropdown
  const allStates = useMemo(() => {
    const s = new Set<string>();
    NEET_COLLEGES.forEach((c) => s.add(c.state));
    return Array.from(s).sort();
  }, []);

  const branchChips = useMemo(() => {
    const seen = new Set<string>();
    const out: { name: string; color: string }[] = [];
    for (const c of parsedReport.colleges) {
      for (const p of c.programs || []) {
        const key = (p.program || "").trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const planet = BRANCH_PLANETS.find(
          (bp) =>
            key.toLowerCase().includes(bp.name.toLowerCase()) ||
            bp.name.toLowerCase().includes(key.toLowerCase()),
        );
        out.push({ name: key, color: planet?.accent ?? "#a78bfa" });
        if (out.length >= 6) break;
      }
      if (out.length >= 6) break;
    }
    return out;
  }, [parsedReport]);

  const toggleChoice = (id: string) => {
    setSavedChoiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const downloadReport = async () => {
    setDownloadError(null);
    setDownloading(true);
    try {
      if (isNeet) {
        // Generate personalized NEET preference list text/CSV blob
        const lines = [
          `NEET-UG 2026 COUNSELLING CHOICE PREFERENCE LIST`,
          `Candidate: ${parsedReport.student?.name || "Candidate"} | AIR: #${parsedReport.student?.categoryRank || "—"} | Category: ${parsedReport.student?.category || "UR"}`,
          `Generated On: ${new Date().toLocaleDateString()}`,
          `---------------------------------------------------------------------------------`,
          `Rank,College Name,Course,Quota,Closing AIR,Hospital Beds,Annual Fee,Chance`,
          ...filteredNeetColleges.map(
            (c, i) =>
              `${i + 1},"${c.college.name}",${c.matchedProgram.course},"${c.matchedProgram.quota}",${c.closingRank},${c.college.hospitalBeds},"${c.college.annualFee}",${c.chancePercent}% (${c.chanceTier})`
          ),
        ].join("\n");

        const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(parsedReport.student?.name || "NEET").replace(/\s+/g, "_")}_NEET_Counselling_Choices.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }

      // JEE PDF download
      const blob = getReportPdf();
      if (!blob) throw new Error("Report PDF is not available.");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(parsedReport.student?.name || "JEE").replace(/\s+/g, "_")}_Prediction_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
      setDownloadError("Couldn't download your report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const primaryAccent = isNeet ? "#10b981" : "var(--accent)";
  const navTiles = isNeet ? NEET_NAV_TILES : JEE_NAV_TILES;

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span
            className="size-3 rotate-45"
            style={{ background: primaryAccent }}
          />
          <span className="text-xl font-black tracking-tight" style={{ color: isNeet ? "#10b981" : "inherit" }}>
            {isNeet ? "MCC / NEET-UG" : "JoSAA"}
          </span>
          <span
            className="mono text-[9px] px-2 py-0.5 rounded uppercase font-semibold"
            style={{
              background: isNeet ? "rgba(16,185,129,0.15)" : "rgba(79,70,229,0.12)",
              color: isNeet ? "#10b981" : "var(--accent)",
              border: `1px solid ${isNeet ? "rgba(16,185,129,0.3)" : "rgba(79,70,229,0.25)"}`,
            }}
          >
            {isNeet ? "Medical Counselling Control Room" : "Engineering Control Room"}
          </span>
        </Link>
        <div className="hidden text-xs uppercase tracking-[0.4em] text-muted-foreground md:block">
          {isNeet ? "15% AIQ & 85% State Quota Analytics" : "Your personalised control room"}
        </div>
        <ThemeSwitch />
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        {/* Candidate Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: primaryAccent }}>
              ◆ {isNeet ? "NEET-UG 2026 COUNSELLING REPORT READY" : "REPORT READY"}
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {parsedReport.student?.name
                ? `Welcome, ${parsedReport.student.name.split(" ")[0]}.`
                : "Your personalised prediction is in."}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isNeet
                ? `${filteredNeetColleges.length} Premier Medical Colleges Mapped · 15% AIQ + 85% State Quotas Evaluated · 1,200+ Resident Mentors on Standby`
                : `${parsedReport.colleges.length} colleges analysed · ${branchChips.length}+ branches mapped · 1000+ mentors on standby.`}
            </p>
          </div>

          {/* Candidate Stats Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="rounded-lg border border-border bg-card/70 px-4 py-2 flex flex-col">
              <span className="mono text-[9px] text-muted-foreground uppercase tracking-wider">
                {isNeet ? "ALL INDIA RANK (AIR)" : "CATEGORY RANK"}
              </span>
              <span className="text-lg font-black" style={{ color: primaryAccent }}>
                #{parsedReport.student?.categoryRank ? parsedReport.student.categoryRank.toLocaleString() : "—"}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-card/70 px-4 py-2 flex flex-col">
              <span className="mono text-[9px] text-muted-foreground uppercase tracking-wider">
                {isNeet ? "NEET SCORE / SHIFT" : "EXAM / SHIFT"}
              </span>
              <span className="text-lg font-black text-foreground">
                {parsedReport.student?.shift || "720 Marks"}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-card/70 px-4 py-2 flex flex-col">
              <span className="mono text-[9px] text-muted-foreground uppercase tracking-wider">
                CATEGORY
              </span>
              <span className="text-lg font-black" style={{ color: "#f59e0b" }}>
                {parsedReport.student?.category || "OPEN / UR"}
              </span>
            </div>
          </div>
        </div>

        {/* TOP TILES ROW */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* TILE 01 — Top College Match */}
          <TileShell glow={isNeet ? "#10b981" : "#3b82f6"} className="lg:col-span-2">
            <div>
              <div
                className="mono text-[10px] tracking-[0.22em] font-semibold"
                style={{ color: isNeet ? "#10b981" : "#3b82f6" }}
              >
                01 · TOP ADMISSION MATCH
              </div>
              <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight">
                {topCollege?.collegeName ?? (isNeet ? "AIIMS New Delhi / Premier GMC" : "Your top predicted college")}
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                {isNeet
                  ? "Strongest predicted match across your NEET AIR, Category reservation, and State Quota eligibility."
                  : "Best-fit college from your report — the strongest signal across your rank, category and preferences."}
              </p>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(topCollege?.programs ?? []).slice(0, 3).map((p, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-border bg-background/50 px-3 py-1 text-[10px] uppercase tracking-[0.12em]"
                    style={{ borderColor: isNeet ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)" }}
                  >
                    {p.program}
                  </span>
                ))}
              </div>

              {/* Rank / Chance Badge */}
              <div className="relative grid size-24 place-items-center">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-dashed"
                  style={{
                    borderColor: isNeet ? "#10b98166" : "#3b82f666",
                    animation: "orbit-spin 12s linear infinite",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-2 rounded-full border"
                  style={{
                    borderColor: isNeet ? "#10b98140" : "#3b82f640",
                    animation: "orbit-spin-reverse 18s linear infinite",
                  }}
                />
                <div className="flex flex-col items-center text-center">
                  <span className="mono text-[8px] tracking-[0.18em] text-muted-foreground">
                    {isNeet ? "PREDICTED" : "RANK"}
                  </span>
                  <span className="text-base font-black" style={{ color: isNeet ? "#10b981" : "#3b82f6" }}>
                    {isNeet ? "HIGH FIT" : `#${parsedReport.student?.categoryRank ?? "—"}`}
                  </span>
                </div>
              </div>
            </div>
          </TileShell>

          {/* TILE 02 — Download Report */}
          <TileShell glow={isNeet ? "#06b6d4" : "#3b82f6"}>
            <div>
              <div
                className="mono text-[10px] tracking-[0.22em] font-semibold"
                style={{ color: isNeet ? "#06b6d4" : "#3b82f6" }}
              >
                02 · COUNSELLING DOSSIER
              </div>
              <h2 className="mt-2 text-lg font-black tracking-tight">
                {isNeet ? "Download Choice Order List" : "Download Your PDF Report"}
              </h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                {isNeet
                  ? "Export your customized MCC All India Quota & State DME preference order sheet (CSV / Text)."
                  : "Get your complete personalised prediction report — instantly."}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={downloadReport}
                disabled={downloading}
                className="inline-flex w-fit items-center gap-2 rounded-md px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition hover:opacity-90 disabled:opacity-60"
                style={{
                  background: primaryAccent,
                  color: "#ffffff",
                }}
              >
                {downloading ? "Preparing…" : isNeet ? "Export Choice Sheet ↓" : "Download PDF ↓"}
              </button>
              {downloadError && (
                <span className="text-[10px] text-destructive">{downloadError}</span>
              )}
            </div>
          </TileShell>

          {/* TILE 03 — Marks vs Rank Curve */}
          <TileShell glow={isNeet ? "#10b981" : "#22d3a4"}>
            <div>
              <div
                className="mono text-[10px] tracking-[0.22em] font-semibold"
                style={{ color: isNeet ? "#10b981" : "#22d3a4" }}
              >
                03 · {isNeet ? "NEET MARKS → AIR CURVE" : "MARKS → RANK"}
              </div>
              <h2 className="mt-2 text-lg font-black tracking-tight">
                {isNeet ? "NTA Calibrated Rank Curve" : "Marks vs Rank Predictor"}
              </h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                {isNeet
                  ? "See where your score sits across the 24 Lakh candidate density curve."
                  : "See where your marks land on the JEE rank curve."}
              </p>
            </div>
            <div className="flex items-end justify-between gap-3">
              {isNeet ? (
                <NeetMarksVsAirChart
                  userMarks={parseFloat(parsedReport.student?.shift?.split(" ")[0] || "650")}
                  userAir={parsedReport.student?.categoryRank}
                />
              ) : (
                <MarksVsRankChart color="#22d3a4" />
              )}
            </div>
          </TileShell>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* 🔥 INTERACTIVE SEARCH & FILTERING SECTION FOR MEDICAL COLLEGES */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {isNeet && (
          <section className="mt-10 rounded-2xl border border-border bg-card/50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="mono text-[10px] text-emerald-500 uppercase tracking-[0.25em] font-bold">
                  ◆ LIVE ADMISSION EXPLORER
                </div>
                <h2 className="text-2xl font-black tracking-tight mt-1">
                  Search & Filter Medical Colleges
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Explore 30+ premier institutions with cutoff ranks, annual fees, hospital bed strength & service bonds.
                </p>
              </div>

              {/* Saved Choice Counter */}
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="mono text-xs font-bold text-emerald-500">
                  {savedChoiceIds.length} Saved in Choice Order
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {/* Search input */}
              <div className="md:col-span-2">
                <label className="mono text-[9px] uppercase tracking-wider text-muted-foreground block mb-1">
                  Search by College or City
                </label>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. AIIMS, Maulana Azad, Lucknow, Vellore, Mumbai..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                />
              </div>

              {/* State Filter */}
              <div>
                <label className="mono text-[9px] uppercase tracking-wider text-muted-foreground block mb-1">
                  State / Domicile
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All States (India)</option>
                  {allStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Quota Filter */}
              <div>
                <label className="mono text-[9px] uppercase tracking-wider text-muted-foreground block mb-1">
                  Counselling Quota
                </label>
                <select
                  value={selectedQuota}
                  onChange={(e) => setSelectedQuota(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Quotas</option>
                  <option value="All India Quota">15% All India Quota (AIQ)</option>
                  <option value="State Quota">85% State Quota</option>
                  <option value="AIIMS">AIIMS Open Quota</option>
                  <option value="Central">Central Universities</option>
                  <option value="Deemed">Deemed / Trust</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="mono text-[9px] uppercase tracking-wider text-muted-foreground block mb-1">
                  Sort Order
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-emerald-500"
                >
                  <option value="nirf">NIRF Ranking (Top first)</option>
                  <option value="rank">Closing AIR Cutoff (Tightest)</option>
                  <option value="beds">Hospital Beds (Highest)</option>
                </select>
              </div>
            </div>

            {/* Quick Pill Filters */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
              <span className="mono text-[9px] text-muted-foreground uppercase tracking-wider mr-1">
                Chance Tier:
              </span>
              {[
                { id: "ALL", label: "All Colleges" },
                { id: "HIGH", label: "High Chance (≥85%)", color: "#10b981" },
                { id: "TARGET", label: "Target Match (50-84%)", color: "#f59e0b" },
                { id: "REACH", label: "Dream / Reach (<50%)", color: "#ef4444" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  type="button"
                  className={`mono text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    selectedTier === tier.id
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tier.label}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <span className="mono text-[9px] text-muted-foreground uppercase tracking-wider">
                  Course:
                </span>
                {["ALL", "MBBS", "BDS"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCourse(c)}
                    type="button"
                    className={`mono text-[10px] px-2.5 py-0.5 rounded border transition-all ${
                      selectedCourse === c
                        ? "bg-primary/20 border-primary text-primary font-bold"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {c === "ALL" ? "All" : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNeetColleges.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No medical colleges match your active search filters. Try clearing your search query or state filter.
                </div>
              ) : (
                filteredNeetColleges.map((item) => {
                  const isSelected = savedChoiceIds.includes(item.college.id);
                  return (
                    <div
                      key={`${item.college.id}-${item.matchedProgram.course}-${item.matchedProgram.quota}`}
                      className="group relative flex flex-col justify-between rounded-xl border p-5 transition-all hover:-translate-y-1 hover:border-emerald-500/60"
                      style={{
                        background: "var(--card)",
                        borderColor: isSelected ? "rgba(16,185,129,0.7)" : "var(--border)",
                        boxShadow: isSelected ? "0 0 16px rgba(16,185,129,0.15)" : "none",
                      }}
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{
                              background: `${item.badgeColor}20`,
                              color: item.badgeColor,
                              border: `1px solid ${item.badgeColor}40`,
                            }}
                          >
                            {item.chanceTier} CHANCE ({item.chancePercent}%)
                          </span>
                          <span className="mono text-[9px] text-muted-foreground">
                            NIRF #{item.college.nirfRank}
                          </span>
                        </div>

                        <h3 className="mt-2.5 text-base font-black leading-snug tracking-tight text-foreground group-hover:text-emerald-400 transition-colors">
                          {item.college.shortName}
                        </h3>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span>{item.college.city}, {item.college.state}</span>
                          <span>•</span>
                          <span className="font-semibold text-foreground/80">{item.college.type}</span>
                        </div>

                        {/* Program & Quota Badges */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9.5px] font-bold text-emerald-400 uppercase">
                            {item.matchedProgram.course}
                          </span>
                          <span className="rounded bg-background/60 border border-border px-2 py-0.5 text-[9.5px] text-muted-foreground">
                            {item.matchedProgram.quota}
                          </span>
                        </div>

                        {/* Medical Specs (Beds, Fees, Bonds) */}
                        <div className="mt-3.5 space-y-1 rounded-md bg-background/40 p-2.5 text-[10.5px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hospital Beds:</span>
                            <span className="font-semibold text-foreground">{item.college.hospitalBeds.toLocaleString()} Beds</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annual Fee:</span>
                            <span className="font-semibold text-foreground">{item.college.annualFee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Service Bond:</span>
                            <span className="font-semibold text-foreground">
                              {item.college.bondYears > 0 ? `${item.college.bondYears} Yrs (${item.college.bondPenalty})` : "None"}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-border/50">
                            <span className="text-muted-foreground">Closing Cutoff AIR:</span>
                            <span className="font-bold text-emerald-400">
                              ~AIR {item.closingRank.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                        <a
                          href={item.college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          Portal ↗
                        </a>

                        <button
                          onClick={() => toggleChoice(item.college.id)}
                          type="button"
                          className={`mono text-[10px] px-3 py-1.5 rounded transition-all font-bold ${
                            isSelected
                              ? "bg-emerald-500 text-white shadow-sm"
                              : "border border-border text-foreground hover:border-emerald-500"
                          }`}
                        >
                          {isSelected ? "✓ Added to List" : "+ Add Choice"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* NAV TILES — Medical / JoSAA specific */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {navTiles.slice(0, 2).map((t) => (
            <TileLink key={t.to} to={t.to!}>
              <TileShell glow={t.glow}>
                <div>
                  <div className="mono text-[10px] tracking-[0.22em]" style={{ color: t.accent }}>
                    {t.n} · SECTION
                  </div>
                  <h2 className="mt-2 text-lg font-black tracking-tight">{t.header}</h2>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                    {t.desc}
                  </p>
                </div>
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.18em] transition group-hover:translate-x-0.5"
                  style={{ color: t.accent }}
                >
                  {t.cta} →
                </span>
              </TileShell>
            </TileLink>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {navTiles.slice(2).map((t) => (
            <TileLink key={t.to} to={t.to!}>
              <TileShell glow={t.glow}>
                <div>
                  <div className="mono text-[10px] tracking-[0.22em]" style={{ color: t.accent }}>
                    {t.n} · SECTION
                  </div>
                  <h2 className="mt-2 text-lg font-black tracking-tight">{t.header}</h2>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                    {t.desc}
                  </p>
                </div>
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.18em] transition group-hover:translate-x-0.5"
                  style={{ color: t.accent }}
                >
                  {t.cta} →
                </span>
              </TileShell>
            </TileLink>
          ))}
        </div>

        {/* Back and Replay Controls */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="rounded-md border border-border bg-card px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] transition hover:border-accent"
          >
            ↻ Replay Animation
          </button>
          <Link
            to="/"
            className="rounded-md border border-border bg-card px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] transition hover:border-accent"
          >
            ← Back home
          </Link>
        </div>
      </main>
    </div>
  );
}
