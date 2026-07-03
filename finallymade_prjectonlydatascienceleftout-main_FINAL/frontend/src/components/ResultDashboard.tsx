import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ThemeSwitch } from "./ThemeSwitch";
import { getReportPdf } from "@/lib/prediction-store";
import type { ParsedReport } from "@/lib/parse-prediction-pdf";
import { BRANCH_PLANETS } from "@/lib/branch-planets";

// External "coming soon" placeholder for the College Rank Predictor feature.
const RANK_PREDICTOR_URL = "https://josaa-rank-predictor.lovable.app/";

/** Tiny inline line chart: marks (x) vs rank (y). Hard-coded prediction curve. */
function MarksVsRankChart({ color }: { color: string }) {
  // marks 100..300 → rank ~200k..500 (log-ish curve). Points hand-picked.
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
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      aria-hidden
    >
      {/* baseline */}
      <line
        x1="6"
        y1={h - 4}
        x2={w - 6}
        y2={h - 4}
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      {/* filled area under curve */}
      <path
        d={`${d} L${w - 6},${h - 4} L6,${h - 4} Z`}
        fill={color}
        fillOpacity="0.15"
      />
      {/* curve */}
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* dots */}
      {pts.map(([x, y], i) => {
        const px = 6 + (x / 120) * (w - 12);
        const py = 4 + (y / 44) * (h - 8);
        return <circle key={i} cx={px} cy={py} r="1.6" fill={color} />;
      })}
      {/* axis label ticks */}
      <text x="6" y={h - 0.5} fontSize="6" fill="currentColor" fillOpacity="0.5">MARKS</text>
      <text x={w - 22} y={h - 0.5} fontSize="6" fill="currentColor" fillOpacity="0.5">RANK</text>
    </svg>
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

const NAV_TILES: Tile[] = [
  {
    n: "02",
    kind: "link",
    header: "One-to-One Connectivity",
    desc: "Connect personally with seniors and mentors for guidance tailored to your college and branch.",
    cta: "Find your mentor",
    to: "/connectivity",
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
      className={`dashboard-tile group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 ${className}`}
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
      {/* aurora glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-24 opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${glow}, transparent 60%)`,
        }}
      />
      {/* starfield */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, var(--foreground) 0, transparent 60%), radial-gradient(1px 1px at 70% 60%, var(--foreground) 0, transparent 60%), radial-gradient(1px 1px at 40% 80%, var(--foreground) 0, transparent 60%), radial-gradient(1px 1px at 85% 20%, var(--foreground) 0, transparent 60%)",
          backgroundSize: "220px 220px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.2))",
        }}
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
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const topCollege = parsedReport.colleges[0];

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

  const download = async () => {
    setDownloadError(null);
    setDownloading(true);
    try {
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

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="size-3 rotate-45 bg-accent" />
          <span className="text-xl font-black tracking-tight">JoSAA</span>
        </Link>
        <div className="hidden text-xs uppercase tracking-[0.4em] text-muted-foreground md:block">
          Your personalised control room
        </div>
        <ThemeSwitch />
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <div className="text-[10px] uppercase tracking-[0.3em] text-accent">◆ Report ready</div>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {parsedReport.student?.name
            ? `Welcome, ${parsedReport.student.name.split(" ")[0]}.`
            : "Your personalised prediction is in."}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {parsedReport.colleges.length} colleges analysed · {branchChips.length}+ branches mapped ·
          1000+ mentors on standby.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* TILE 01 — Top College Match with orbit ring */}
          <TileShell glow="#f59e0b" className="lg:col-span-2">
            <div>
              <div className="mono text-[10px] tracking-[0.22em]" style={{ color: "#f59e0b" }}>
                01 · TOP MATCH
              </div>
              <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight">
                {topCollege?.collegeName ?? "Your top predicted college"}
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                Best-fit college from your report — the strongest signal across your rank,
                category and preferences.
              </p>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(topCollege?.programs ?? []).slice(0, 3).map((p, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-border bg-background/40 px-3 py-1 text-[10px] uppercase tracking-[0.12em]"
                  >
                    {p.program}
                  </span>
                ))}
              </div>
              {/* Orbit rank badge */}
              <div className="relative grid size-24 place-items-center">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-dashed"
                  style={{
                    borderColor: "#f59e0b66",
                    animation: "orbit-spin 12s linear infinite",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-2 rounded-full border"
                  style={{
                    borderColor: "#f59e0b40",
                    animation: "orbit-spin-reverse 18s linear infinite",
                  }}
                />
                <div className="flex flex-col items-center">
                  <span className="mono text-[9px] tracking-[0.18em] text-muted-foreground">RANK</span>
                  <span className="text-lg font-black" style={{ color: "#f59e0b" }}>
                    {parsedReport.student?.categoryRank ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </TileShell>

          {/* TILE 02 — Download PDF */}
          <TileShell glow="#e11d48">
            <div>
              <div className="mono text-[10px] tracking-[0.22em]" style={{ color: "#e11d48" }}>
                02 · REPORT
              </div>
              <h2 className="mt-2 text-lg font-black tracking-tight">
                Download Your PDF Report
              </h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                Get your complete personalised prediction report — instantly.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={download}
                disabled={downloading}
                className="inline-flex w-fit items-center gap-2 rounded-md bg-accent px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {downloading ? "Preparing…" : "Download PDF ↓"}
              </button>
              {downloadError && (
                <span className="text-[10px] text-destructive">{downloadError}</span>
              )}
            </div>
          </TileShell>

          {/* TILE 03 — Marks vs Rank Predictor (external, coming soon) */}
          <a
            href={RANK_PREDICTOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="contents"
          >
            <TileShell glow="#22d3a4">
              <div>
                <div className="mono text-[10px] tracking-[0.22em]" style={{ color: "#22d3a4" }}>
                  03 · MARKS → RANK
                </div>
                <h2 className="mt-2 text-lg font-black tracking-tight">Marks vs Rank Predictor</h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  See where your marks land on the JEE rank curve. Live predictor coming soon.
                </p>
              </div>
              <div className="flex items-end justify-between gap-3">
                <MarksVsRankChart color="#22d3a4" />
                <span
                  className="mono text-[9px] tracking-[0.18em] whitespace-nowrap"
                  style={{ color: "#22d3a4" }}
                >
                  OPEN ↗
                </span>
              </div>
            </TileShell>
          </a>

          {/* NAV TILES 04–08 — first two only, remaining shown next row */}
          {NAV_TILES.slice(0, 2).map((t) => (
            <Link key={t.to} to={t.to!} className="contents">
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
            </Link>
          ))}
        </div>

        {/* Secondary row of nav tiles */}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {NAV_TILES.slice(2).map((t) => (
            <Link key={t.to} to={t.to!} className="contents">
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
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="rounded-md border border-border bg-card px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] transition hover:border-accent"
          >
            ↻ Replay
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
