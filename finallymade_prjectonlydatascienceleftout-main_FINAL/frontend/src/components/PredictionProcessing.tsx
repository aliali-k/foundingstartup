import { useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import type { ParsedReport, CollegeResult } from "@/lib/parse-prediction-pdf";

import cseImg from "@/assets/branch-cse.jpg";
import vlsiImg from "@/assets/branch-vlsi.jpg";
import aiImg from "@/assets/branch-ai.jpg";
import dsImg from "@/assets/branch-ds.jpg";
import eceImg from "@/assets/branch-ece.jpg";
import eeImg from "@/assets/branch-ee.jpg";
import meImg from "@/assets/branch-me.jpg";
import civImg from "@/assets/branch-civ.jpg";
import cheImg from "@/assets/branch-che.jpg";
import mmeImg from "@/assets/branch-mme.jpg";
import prodImg from "@/assets/branch-prod.jpg";
import aeroImg from "@/assets/branch-aero.jpg";
import mncImg from "@/assets/branch-mnc.jpg";

type Branch = {
  code: string;
  name: string;
  glyph: (props: { className?: string }) => ReactElement;
  hero: string;
  accent: string;
  color: string;
  models: string[];
};

const BRANCHES: Branch[] = [
  { code: "CSE",  name: "Computer Science",        accent: "text-chart-1", color: "#e91e8c", glyph: CpuGlyph,         hero: cseImg,  models: ["compiler", "systems", "networks"] },
  { code: "AI",   name: "Artificial Intelligence", accent: "text-chart-2", color: "#a8e063", glyph: BrainGlyph,       hero: aiImg,   models: ["neural net", "vision", "agents"] },
  { code: "DS",   name: "Data Science",            accent: "text-chart-3", color: "#7c3aed", glyph: GraphGlyph,       hero: dsImg,   models: ["statistics", "dashboards", "ML"] },
  { code: "MNC",  name: "Math & Computing",        accent: "text-chart-4", color: "#f72585", glyph: SigmaGlyph,       hero: mncImg,  models: ["proof", "optimisation", "algorithms"] },
  { code: "ECE",  name: "Electronics",             accent: "text-chart-5", color: "#18eb90f5", glyph: ChipGlyph,        hero: eceImg,  models: ["signals", "circuits", "embedded"] },
  { code: "VLSI", name: "VLSI Design",             accent: "text-chart-1", color: "#d63384", glyph: VlsiGlyph,        hero: vlsiImg, models: ["floorplan", "ASIC", "timing"] },
  { code: "EE",   name: "Electrical",              accent: "text-chart-2", color: "#e07b39", glyph: TransformerGlyph, hero: eeImg,   models: ["machines", "power", "grid"] },
  { code: "ME",   name: "Mechanical",              accent: "text-chart-3", color: "#c9a227", glyph: GearGlyph,        hero: meImg,   models: ["gears", "cars", "thermal"] },
  { code: "CIV",  name: "Civil",                   accent: "text-chart-4", color: "#e8724a", glyph: BridgeGlyph,      hero: civImg,  models: ["bridges", "structures", "survey"] },
  { code: "PROD", name: "Production",              accent: "text-chart-5", color: "#e63946", glyph: RobotGlyph,       hero: prodImg, models: ["robots", "assembly", "quality"] },
  { code: "CHE",  name: "Chemical",                accent: "text-chart-1", color: "#0ab5b5", glyph: MoleculeGlyph,    hero: cheImg,  models: ["reactors", "orbitals", "process"] },
  { code: "MME",  name: "Materials & Metallurgy",  accent: "text-chart-2", color: "#a8d8ea", glyph: DiamondGlyph,     hero: mmeImg,  models: ["crystals", "alloys", "diamond"] },
  { code: "AERO", name: "Aerospace",               accent: "text-chart-3", color: "#60a5fa", glyph: RocketGlyph,      hero: aeroImg, models: ["rockets", "aircraft", "CFD"] },
];

const STARTUPS_BY_BRANCH: Record<string, string[]> = {
  CSE:  ["Razorpay", "Zerodha", "CRED", "Postman", "Zepto", "Meesho", "Groww", "Slice", "Rapido", "Atlan", "Khatabook", "BrowserStack", "ShareChat", "Urban Company", "Spinny"],
  AI:   ["Sarvam AI", "Krutrim", "Hugging Face", "Perplexity", "Lossfunk", "Skyflow", "Mistral", "Cohere", "Adept", "Anthropic", "OpenAI", "xAI", "Glance", "Observe.AI", "Wadhwani AI"],
  DS:   ["Fractal", "Mu Sigma", "Tiger Analytics", "LatentView", "Quantiphi", "Tredence", "InMobi", "AbsolutData", "Atlan", "Sigmoid", "Crayon Data", "Nielsen", "Course5i", "Manthan", "Dunnhumby"],
  MNC:  ["Quadeye", "WorldQuant", "Tower Research", "Graviton", "DE Shaw", "Optiver", "AlphaGrep", "Quantbox", "Mansa Capital", "Estee Advisors", "Jane Street", "Citadel", "Two Sigma", "Da Vinci", "IMC"],
  ECE:  ["Saankhya Labs", "Tessolve", "Signalchip", "Sasken", "Centum", "Ideaforge", "InCore", "Mindgrove", "Sensehawk", "Detect Technologies", "Ather", "Belrise", "Aforeserve", "Astrome", "Niral"],
  VLSI: ["Saankhya Labs", "Signalchip", "InCore", "Mindgrove", "Calligo Tech", "Netrasemi", "Steradian", "VerveSemi", "PolyMatrix", "Morphing Machines", "Centum", "Tessolve", "AlphaICs", "ChipSpirit", "Aura"],
  EE:   ["Ola Electric", "Ather Energy", "Log9 Materials", "Exponent Energy", "Battery Smart", "Euler Motors", "Stellapps", "Greaves", "Ampere", "BatX", "ChargeZone", "Vecmocon", "Yulu", "BluSmart", "Lohum"],
  ME:   ["Ather Energy", "Ola Electric", "Tata Motors EV", "Eicher", "Bounce", "Pravaig", "Vayve Mobility", "Vehant", "Sastra Robotics", "Niral Networks", "GalaxEye", "Skyroot", "Agnikul", "Ideaforge", "Ultraviolette"],
  CIV:  ["NoBroker", "Square Yards", "Stanza Living", "Brick & Bolt", "Livspace", "HomeLane", "Infra.Market", "Zolostays", "Pace Group", "BetterPlace", "Knowlarity", "MagicBricks", "PropTiger", "Settlin", "Wakefit"],
  PROD: ["Ideaforge", "Niral Networks", "Sastra Robotics", "Detect Technologies", "GalaxEye", "Pixxel", "Newspace", "Inspecity", "Bellatrix", "Manastu Space", "Skyroot", "Agnikul", "Astrogate", "TransporterX", "Vehant"],
  CHE:  ["Reliance New Energy", "Log9 Materials", "GPS Renewables", "Solinas", "Recykal", "String Bio", "Phyllo", "ePlane", "Banyan Nation", "Loop Worm", "Indra Water", "Carbon Clean", "Lohum", "Attero", "Praan"],
  MME:  ["Lohum", "Attero", "Tata Steel Ventures", "Recykal", "Vedanta Sterlite", "Hindalco", "MEDA", "GreenJams", "MetalKraft", "Banyan Nation", "Carbon Clean", "Ecotech", "Recycle X", "SAIL Ventures", "Mettube"],
  AERO: ["Skyroot Aerospace", "Agnikul Cosmos", "Pixxel", "Bellatrix Aerospace", "Astrogate Labs", "GalaxEye Space", "Dhruva Space", "Manastu Space", "Newspace Research", "Inspecity", "Aarav Unmanned", "ePlane", "Throttle Aerospace", "Sastra", "Garuda"],
};

const STAGES = [
  "Cross-referencing branch outcomes against your category…",
  "Ranking colleges by your category and preference order…",
  "Compiling your personalised report for the best results…",
];

const FIRST_NAMES = ["Aarav", "Diya", "Kabir", "Ishaan", "Riya", "Vivaan", "Aanya", "Arjun", "Saanvi", "Ansh", "Myra", "Reyansh", "Aditi", "Kiaan", "Neha", "Rohan", "Tara", "Yash", "Mira", "Dev"];
const LAST_NAMES = ["Sharma", "Verma", "Iyer", "Reddy", "Nair", "Patel", "Khanna", "Singh", "Bose", "Menon", "Gupta", "Mehta", "Joshi", "Rao", "Shah"];
const MENTOR_COMPANIES = ["Google", "Microsoft", "Qualcomm", "ISRO", "Boeing", "Tata Steel", "OpenAI", "Adobe", "Nvidia", "Goldman", "Citadel", "Jane Street", "Stripe", "Meta", "Amazon"];

function classify(name: string): "IIT" | "NIT" | "OTHER" {
  const n = name.toLowerCase();
  if (n.includes("indian institute of technology") || /\biit\b/.test(n)) return "IIT";
  if (n.includes("national institute of technology") || /\bnit\b/.test(n)) return "NIT";
  return "OTHER";
}

function shortenCollege(name: string): string {
  return name
    .replace("Indian Institute of Technology", "IIT")
    .replace("National Institute of Technology", "NIT")
    .replace("Indian Institute of Information Technology", "IIIT")
    .replace("Indraprastha Institute of Information Technology", "IIIT")
    .replace("International Institute of Information Technology", "IIIT");
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function packagesFor(name: string): { avg: string; high: string } {
  const h = hash(name);
  const k = classify(name);
  const base = k === "IIT" ? 22 : k === "NIT" ? 17 : 13;
  const avg = base + (h % 8); // base..base+7
  const high = avg + 18 + ((h >> 3) % 28); // avg+18..avg+45
  const fmt = (v: number) => (v >= 100 ? `₹${(v / 100).toFixed(1)}Cr` : `₹${v}L`);
  return { avg: fmt(avg), high: fmt(high) };
}

function mentorFor(college: string, idx: number) {
  const h = hash(college + ":" + idx);
  const first = FIRST_NAMES[h % FIRST_NAMES.length];
  const last = LAST_NAMES[(h >> 3) % LAST_NAMES.length];
  const company = MENTOR_COMPANIES[(h >> 5) % MENTOR_COMPANIES.length];
  const branchSeed = (h >> 7) % BRANCHES.length;
  const branch = BRANCHES[branchSeed].code;
  const pkgVal = 18 + ((h >> 9) % 31); // 18..48L
  const hue = (h >> 11) % 360;
  return {
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    college: shortenCollege(college),
    company,
    branch,
    pkg: `₹${pkgVal}L`,
    hue,
  };
}

export function PredictionProcessing({
  parsedReport,
  onDone,
}: {
  parsedReport: ParsedReport;
  onDone?: () => void;
}) {
  const [t, setT] = useState(0);
  const DURATION = 20000;

  // useEffect(() => {
  //   const start = performance.now();
  //   let raf = 0;
  //   const tick = (now: number) => {
  //     const p = Math.min(1, (now - start) / DURATION);
  //     setT(p);
  //     if (p < 1) raf = requestAnimationFrame(tick);
  //     else onDone?.();
  //   };
  //   raf = requestAnimationFrame(tick);
  //   return () => cancelAnimationFrame(raf);
  // }, [onDone]);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setT(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setT(1);
        setTimeout(() => onDone?.(), 150);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const { iitCount, nitCount, iiitGftiCount, sortedColleges, packageRows, mentorRows } = useMemo(() => {
    let iit = 0, nit = 0, other = 0;
    for (const c of parsedReport.colleges) {
      const k = classify(c.collegeName);
      if (k === "IIT") iit++; else if (k === "NIT") nit++; else other++;
    }
    const sorted: CollegeResult[] = [...parsedReport.colleges].sort((a, b) => {
      const ac = Math.max(0, ...a.programs.map((p) => p.chancePercent));
      const bc = Math.max(0, ...b.programs.map((p) => p.chancePercent));
      return bc - ac;
    });
    const pkgs = sorted.map((c) => ({ name: c.collegeName, ...packagesFor(c.collegeName) }));
    const mentors = sorted.slice(0, Math.max(8, sorted.length)).map((c, i) => mentorFor(c.collegeName, i));
    return {
      iitCount: iit,
      nitCount: nit,
      iiitGftiCount: other,
      sortedColleges: sorted,
      packageRows: pkgs,
      mentorRows: mentors,
    };
  }, [parsedReport]);

  const stageIndex = Math.min(STAGES.length - 1, Math.floor(t * STAGES.length));
  const activeIndex = Math.max(0, Math.min(BRANCHES.length - 1, Math.floor(t * (BRANCHES.length - 1) * 1.8) % BRANCHES.length));
  const active = BRANCHES[activeIndex] ?? BRANCHES[0];

  const startups = STARTUPS_BY_BRANCH[active.code] ?? [];
  const startupOffset = Math.floor(t * 14) % Math.max(1, startups.length);
  const startupTile = startups[startupOffset] ?? "Stealth";
  const companyTile = MENTOR_COMPANIES[Math.floor(t * 18) % MENTOR_COMPANIES.length];
  const collegePkgTile = packageRows[Math.floor(t * 9) % Math.max(1, packageRows.length)] ?? null;

  const startupSets = useMemo(() => {
    const list = startups.length ? startups : ["Stealth A", "Stealth B", "Stealth C", "Stealth D", "Stealth E"];
    const sets: string[][] = [];
    for (let i = 0; i < 3; i++) {
      const slice = list.slice(i * 5, i * 5 + 5);
      sets.push(slice.length === 5 ? slice : list.slice(0, 5));
    }
    return sets;
  }, [startups]);

  const highlightedSet = Math.floor(t * 6) % 3;

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background text-foreground font-mono animate-fade-in">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 text-xs tracking-[0.2em] uppercase">
        <div className="flex items-center gap-2">
          <Diamond className="size-3 text-primary" />
          <span>JoSAA · Predictor</span>
        </div>
        <div className="hidden text-muted-foreground md:block">
          predictor running · searching the best results for you · do not close
        </div>
        <div className="tabular-nums text-primary">{Math.floor(t * 100).toString().padStart(2, "0")}%</div>
      </div>

      <div className="h-px w-full bg-border">
        {/* <div className="h-full bg-primary transition-[width] duration-100 ease-linear" style={{ width: `${t * 100}%` }} /> */}
        {/* <div className="h-full bg-primary transition-[width] duration-75 ease-linear" style={{ width: `${t * 100}%` }} /> */}
        <div className="h-full bg-primary" style={{ width: `${t * 100}%` }} />
      </div>

      <div className="relative grid flex-1 grid-cols-1 gap-px overflow-hidden bg-border lg:grid-cols-[1.25fr_0.9fr]">
        <section className="relative flex min-h-0 flex-col overflow-hidden bg-background p-5 md:p-6">
          <div className="absolute inset-0 josaa-grid opacity-70" />
          <Label>◆ Scanning Engineering Branches</Label>
          <h2 className="relative mt-3 max-w-2xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            Crunching every branch you could land,{" "}
            <span className="text-primary">finding the best fit.</span>
          </h2>

          <BranchFactory progress={t} activeIndex={activeIndex} />

          <div className="relative mt-5 grid gap-3 md:grid-cols-3">
            <GlowTile tone="green" label="Hot startup hiring" value={startupTile} sub={`${active.code} talent magnet`} />
            <GlowTile tone="red" label="Dream company" value={companyTile} sub="recruiting your batch" />
            <GlowTile
              tone="yellow"
              label="Top college · package"
              value={collegePkgTile ? shortenCollege(collegePkgTile.name) : "—"}
              sub={collegePkgTile ? `${collegePkgTile.avg} AVG · ${collegePkgTile.high} HIGH` : "no placement match yet"}
            />
          </div>

          <div className="relative mt-4 overflow-hidden rounded-md border border-border bg-card/60 p-3 backdrop-blur">
            <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>◆ {active.code} startups hiring · 15 hand-picked</span>
              <span className={`${active.accent} inline-flex items-center gap-1.5`}>
                <span
                  className="inline-block size-1.5 rounded-full animate-pulse"
                  style={{
                    background: "currentColor",
                    boxShadow: "0 0 6px currentColor, 0 0 12px currentColor",
                  }}
                />
                live feed
              </span>
            </div>
            <div className="space-y-1.5">
              {startupSets.map((set, si) => (
                <div key={si} className="flex flex-wrap gap-1.5">
                  {set.map((s, i) => (
                    <span
                      key={`${si}-${i}`}
                      className={`shrink-0 rounded-md border bg-background px-2.5 py-1 text-[11px] transition ${
                        si === highlightedSet
                          ? "border-primary text-primary shadow-[0_0_12px_-2px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-auto pt-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            {STAGES[stageIndex]}
          </div>
        </section>

        <section className="grid min-h-0 grid-rows-[auto_1fr_0.85fr_0.95fr] gap-px bg-border">
          <div className="grid grid-cols-4 gap-px bg-border">
            <Stat k={String(iitCount)} label="IITs" />
            <Stat k={String(nitCount)} label="NITs" />
            <Stat k={String(iiitGftiCount)} label="IIITs+GFTIs" />
            <Stat k="1000+" label="Mentors" />
          </div>

          <ScrollingFeed
            label="◆ Colleges we're searching"
            interval={500}
            items={sortedColleges.map((c) => c.collegeName)}
            render={(name) => (
              <div className="truncate text-sm">
                <span className="mr-2 text-primary">✓</span>
                {shortenCollege(name)}
              </div>
            )}
          />

          <ScrollingFeed
            label="◆ Highest & average packages"
            interval={650}
            items={packageRows}
            render={(r) => (
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate" title={r.name}>{shortenCollege(r.name)}</span>
                <span className="shrink-0 font-bold tabular-nums text-primary text-xs">
                  {r.avg} AVG · {r.high} HIGH
                </span>
              </div>
            )}
          />

          <ScrollingFeed
            label="◆ Mentors being matched"
            interval={750}
            items={mentorRows}
            render={(m) => (
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(m.name)}`}
                  alt={m.name}
                  loading="lazy"
                  className="size-10 shrink-0 rounded-full object-cover"
                  style={{ background: `hsl(${m.hue} 65% 45%)` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-bold">{m.name}</span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-primary">{m.pkg}</span>
                  </div>
                  <div className="truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {m.college} · {m.branch} · {m.company}
                  </div>
                </div>
              </div>
            )}
          />
        </section>
      </div>
    </div>
  );
}

function ScrollingFeed<T>({
  label,
  items,
  interval,
  render,
}: {
  label: string;
  items: T[];
  interval: number;
  render: (item: T, index: number) => ReactNode;
}) {
  const [cursor, setCursor] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const id = window.setInterval(() => setCursor((c) => c + 1), interval);
    return () => window.clearInterval(id);
  }, [interval, items.length]);

  const visibleCount = 6;
  const slice = useMemo(() => {
    if (items.length === 0) return [] as { item: T; key: string }[];
    const out: { item: T; key: string }[] = [];
    for (let i = 0; i < visibleCount; i++) {
      const idx = (cursor + i) % items.length;
      out.push({ item: items[idx], key: `${cursor}-${i}` });
    }
    return out;
  }, [items, cursor]);

  return (
    <div className="flex min-h-0 flex-col overflow-hidden bg-background p-5">
      <Label>{label}</Label>
      <div ref={containerRef} className="relative mt-3 flex-1 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground">No data parsed from this PDF.</div>
        ) : (
          <ul className="space-y-2">
            {slice.map(({ item, key }, i) => {
              const isNewest = i === visibleCount - 1;
              const isOldest = i === 0;
              const opacity = isOldest ? 0.25 : isNewest ? 1 : 0.5 + i * 0.08;
              return (
                <li
                  key={key}
                  style={{ opacity, animation: isNewest ? "feed-rise 600ms ease-out both" : undefined }}
                  className="transition-opacity duration-500"
                >
                  {render(item, i)}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
      {children}
    </div>
  );
}

function Stat({ k, label }: { k: string; label: string }) {
  return (
    <div className="bg-background px-4 py-5">
      <div className="text-2xl font-bold tabular-nums text-foreground">{k}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}

function GlowTile({ tone, label, value, sub }: { tone: "green" | "red" | "yellow"; label: string; value: string; sub: string }) {
  const toneClass = tone === "green" ? "glow-green" : tone === "red" ? "glow-red" : "glow-yellow";
  const textTone = tone === "green" ? "text-emerald-400" : tone === "red" ? "text-rose-400" : "text-amber-300";
  return (
    <div className={`rounded-md border bg-card/80 p-3 backdrop-blur transition ${toneClass}`}>
      <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className={`mt-1 truncate text-sm font-black uppercase ${textTone}`}>{value}</div>
      <div className="mt-0.5 truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{sub}</div>
    </div>
  );
}

function BranchFactory({ progress, activeIndex }: { progress: number; activeIndex: number }) {
  const lanes = useMemo(() => [BRANCHES.slice(0, 5), BRANCHES.slice(5, 9), BRANCHES.slice(9)], []);
  const active = BRANCHES[activeIndex] ?? BRANCHES[0];

  return (
    <div className="relative mt-5 min-h-[18rem] overflow-hidden rounded-md border border-border bg-card/60 p-3 backdrop-blur md:min-h-[20rem]">
      {/* <div className="absolute inset-y-0 left-1/2 w-px bg-primary/50" /> */}
      <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: `${active.color}80` }} />
      {/* <div className="absolute left-[calc(50%-5rem)] top-0 h-full w-40 bg-primary/15 blur-3xl" /> */}
      <div className="absolute left-[calc(50%-5rem)] top-0 h-full w-40 blur-3xl" style={{ background: `${active.color}26` }} />

      {/* <div className="absolute left-1/2 top-1/2 z-10 flex size-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-lg border border-primary bg-background shadow-[0_0_40px_-5px_color-mix(in_oklab,var(--primary)_60%,transparent)]"> */}
      <div
        className="absolute left-1/2 top-1/2 z-10 flex size-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center overflow-hidden rounded-lg border bg-background transition-colors"
        style={{ borderColor: active.color, boxShadow: `0 0 40px -5px ${active.color}99` }}
      >
        <img
          key={active.code}
          src={active.hero}
          alt={`${active.name} render`}
          loading="lazy"
          width={1024}
          height={1024}
          className="absolute inset-0 size-full object-cover animate-scale-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        {/* <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="text-sm font-black text-primary drop-shadow">{active.code}</div> */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
          <div className="text-sm font-black drop-shadow" style={{ color: active.color }}>{active.code}</div>
          <div className="mx-auto max-w-28 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{active.name}</div>
        </div>
      </div>

      <div className="relative grid h-full min-h-[16rem] grid-rows-3 gap-3 md:min-h-[18rem]">
        {lanes.map((lane, laneIndex) => (
          <div key={laneIndex} className="relative overflow-hidden rounded-md border border-border bg-background/70">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div
              className="branch-conveyor absolute top-1/2 flex -translate-y-1/2 gap-3"
              style={{ animationDuration: `${15 + laneIndex * 3}s`, animationDirection: laneIndex % 2 ? "reverse" : "normal" }}
            >
              {[...lane, ...lane, ...lane].map((branch, i) => {
                const Glyph = branch.glyph;
                const isActive = branch.code === active.code;
                return (
                  // <div
                  //   key={`${branch.code}-${i}`}
                  //   className={`flex h-16 w-32 shrink-0 items-center gap-3 rounded-md border bg-card px-3 transition ${isActive ? "border-primary text-primary shadow-[0_0_18px_-4px_color-mix(in_oklab,var(--primary)_70%,transparent)]" : "border-border text-muted-foreground"}`}
                  // >
                  <div
                    key={`${branch.code}-${i}`}
                    className={`flex h-16 w-32 shrink-0 items-center gap-3 rounded-md border bg-card px-3 transition ${isActive ? "shadow-[0_0_18px_-4px_var(--branch-glow)]" : "border-border text-muted-foreground"}`}
                    style={isActive ? { borderColor: branch.color, color: branch.color, ["--branch-glow" as any]: branch.color } : undefined}
                  >
                    <Glyph className="size-7" />
                    <div>
                      <div className="text-xs font-black">{branch.code}</div>
                      <div className="text-[8px] uppercase tracking-[0.16em]">{branch.models[0]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* <div className="scan-beam absolute inset-y-0 w-24 bg-primary/20 blur-xl" style={{ left: `${Math.max(5, progress * 90)}%` }} /> */}
        <div className="scan-beam absolute inset-y-0 w-24 blur-xl" style={{ left: `${Math.max(5, progress * 90)}%`, background: `${active.color}33` }} />
      </div>
    </div>
  );
}

function S({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

function Diamond({ className }: { className?: string }) {
  return <S className={className}><path d="M12 2 L22 12 L12 22 L2 12 Z" /></S>;
}
function CpuGlyph({ className }: { className?: string }) {
  return (<S className={className}><rect x="6" y="6" width="12" height="12" rx="1" /><rect x="9" y="9" width="6" height="6" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></S>);
}
function BrainGlyph({ className }: { className?: string }) {
  return (<S className={className}><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3 3 3 0 0 0 2 3v1a3 3 0 0 0 3 3h1V4H9z" /><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3 3 3 0 0 1-2 3v1a3 3 0 0 1-3 3h-1V4h1z" /></S>);
}
function GraphGlyph({ className }: { className?: string }) {
  return (<S className={className}><path d="M3 21V3M3 21h18" /><path d="M6 17l4-5 4 3 6-9" /><circle cx="6" cy="17" r="1" /><circle cx="10" cy="12" r="1" /><circle cx="14" cy="15" r="1" /><circle cx="20" cy="6" r="1" /></S>);
}
function SigmaGlyph({ className }: { className?: string }) {
  return <S className={className}><path d="M18 4H6l6 8-6 8h12" /></S>;
}
function ChipGlyph({ className }: { className?: string }) {
  return (<S className={className}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 12h8M8 15h5" /><circle cx="17" cy="15" r="1" /></S>);
}
function VlsiGlyph({ className }: { className?: string }) {
  return (<S className={className}><rect x="5" y="5" width="14" height="14" /><path d="M9 5v3M15 5v3M9 16v3M15 16v3M5 9h3M5 15h3M16 9h3M16 15h3" /><rect x="9" y="9" width="6" height="6" /><path d="M11 11h2v2h-2z" /></S>);
}
function TransformerGlyph({ className }: { className?: string }) {
  return (<S className={className}><circle cx="8" cy="12" r="4" /><circle cx="16" cy="12" r="4" /><path d="M3 12h1M20 12h1M12 12h0" /><path d="M8 8v8M16 8v8" /></S>);
}
function GearGlyph({ className }: { className?: string }) {
  return (<S className={className}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></S>);
}
function BridgeGlyph({ className }: { className?: string }) {
  return (<S className={className}><path d="M2 18h20M4 18V9M20 18V9" /><path d="M4 9c4-4 12-4 16 0" /><path d="M8 18v-5M12 18v-6M16 18v-5" /></S>);
}
function RobotGlyph({ className }: { className?: string }) {
  return (<S className={className}><rect x="5" y="8" width="14" height="11" rx="2" /><path d="M12 4v4M9 4h6" /><circle cx="9" cy="13" r="1" /><circle cx="15" cy="13" r="1" /><path d="M9 17h6" /></S>);
}
function MoleculeGlyph({ className }: { className?: string }) {
  return (<S className={className}><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="14" r="2" /><circle cx="6" cy="20" r="2" /><circle cx="18" cy="20" r="2" /><path d="M7.5 7.5L10.5 12.5M16.5 7.5L13.5 12.5M10.5 15.5L7.5 18.5M13.5 15.5L16.5 18.5" /></S>);
}
function DiamondGlyph({ className }: { className?: string }) {
  return (<S className={className}><path d="M6 3h12l3 6-9 12L3 9z" /><path d="M3 9h18M9 3l3 18M15 3l-3 18M6 3l6 6M18 3l-6 6" /></S>);
}
function RocketGlyph({ className }: { className?: string }) {
  return (<S className={className}><path d="M12 2c3 2 5 6 5 10v5l-5 3-5-3v-5c0-4 2-8 5-10z" /><circle cx="12" cy="10" r="1.5" /><path d="M7 17l-3 4M17 17l3 4M9 19l-1 3M15 19l1 3" /></S>);
}
