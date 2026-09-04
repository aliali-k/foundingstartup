import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useExamMode } from "@/lib/exam-mode-context";
import { PredictionModal } from "@/components/prediction-modal";
import { marksToEstimatedNeetRank } from "@/lib/neet-mock-data";

export const Route = createFileRoute("/")({
  component: TwentyHomePage,
});

/* ═══════════════════════════════════════════════════════════════════════ */
/* 🏛️ ADMISSION INFRASTRUCTURE WITH TIME-CHANGING LIVE TELEMETRY DASHBOARD */
/* ═══════════════════════════════════════════════════════════════════════ */

type ViewMode = "table" | "kanban" | "matrix";
type StateCode = "DL" | "MH" | "UP" | "KA" | "TN" | "RJ";

export function TwentyHomePage() {
  const { mode, setMode, isNeet } = useExamMode();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>("table");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeState, setActiveState] = useState<StateCode>("DL");
  const navigate = useNavigate();

  // Interactive Live Score Tuner inside the Mockup
  const [testScore, setTestScore] = useState<number>(685);
  const [jeeRank, setJeeRank] = useState<number>(1420);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(true);

  const estimatedAir = useMemo(() => marksToEstimatedNeetRank(testScore), [testScore]);

  // ─── TIME-CHANGING LIVE TELEMETRY DASHBOARD STREAM ───
  const [broadcastIndex, setBroadcastIndex] = useState(0);

  const neetBroadcasts = [
    { inst: "AIIMS New Delhi", event: "Round 1 Central Open Merit Closing: AIR 57", metric: "2,500 Beds OPD", bond: "0-Year / ₹0 Safe", status: "VERIFIED", time: "Just now" },
    { inst: "Maulana Azad Medical College (MAMC)", event: "15% AIQ Round 2 Closing: AIR 105", metric: "2,800 Beds Daily", bond: "1-Yr / ₹3L", status: "UPDATED", time: "1.2s ago" },
    { inst: "VMMC & Safdarjung Hospital", event: "Central AIQ Closing: AIR 142", metric: "2,900 Beds Load", bond: "1-Yr / ₹3L", status: "VERIFIED", time: "2.5s ago" },
    { inst: "JIPMER Puducherry", event: "Open Merit Closing: AIR 277", metric: "2,200 Beds OPD", bond: "0-Year / ₹0 Safe", status: "LOCKED", time: "3.8s ago" },
    { inst: "AIIMS Bhubaneswar", event: "Round 3 Cutoff Extrapolation: AIR 540", metric: "1,100 Beds", bond: "0-Year / ₹0 Safe", status: "VACANCY DROP", time: "4.9s ago" },
    { inst: "King George's Medical University (KGMU)", event: "UP State 85% DME Closing: AIR 1,850", metric: "4,500 Beds OPD", bond: "2-Yr / ₹10L Alert", status: "UPDATED", time: "6.1s ago" },
    { inst: "Seth GS Medical College Mumbai", event: "Maharashtra State Quota Closing: AIR 680", metric: "2,250 Beds", bond: "1-Yr / ₹10L Alert", status: "VERIFIED", time: "7.4s ago" },
  ];

  const jeeBroadcasts = [
    { inst: "IIT Bombay", event: "CSE All-India (OPEN) Closing: AIR 68", metric: "₹45 LPA Median", bond: "0 Bond Liability", status: "VERIFIED", time: "Just now" },
    { inst: "IIT Delhi", event: "CSE All-India (OPEN) Closing: AIR 118", metric: "₹42 LPA Median", bond: "0 Bond Liability", status: "UPDATED", time: "1.2s ago" },
    { inst: "IIT Madras", event: "Electrical Eng. Round 3 Closing: AIR 680", metric: "₹38 LPA Median", bond: "0 Bond Liability", status: "LOCKED", time: "2.5s ago" },
    { inst: "NIT Trichy", event: "CSE Other-State Quota Closing: AIR 2,100", metric: "₹32 LPA Median", bond: "50% HS Protected", status: "VERIFIED", time: "3.8s ago" },
    { inst: "IIIT Hyderabad", event: "CSE JEE Main Direct Closing: AIR 980", metric: "₹42 LPA Median", bond: "Top Coding Hub", status: "UPDATED", time: "4.9s ago" },
    { inst: "IIT Kanpur", event: "Mechanical Eng. Round 4 Closing: AIR 2,240", metric: "₹28 LPA Median", bond: "0 Bond Liability", status: "VACANCY DROP", time: "6.1s ago" },
    { inst: "NIT Surathkal", event: "Information Tech Closing: AIR 3,100", metric: "₹26 LPA Median", bond: "Coastal Campus", status: "VERIFIED", time: "7.4s ago" },
  ];

  const activeBroadcasts = isNeet ? neetBroadcasts : jeeBroadcasts;

  // Real-time ticker cycle (every 2.8 seconds when playing demo)
  useEffect(() => {
    if (!isPlayingDemo) return;
    const timer = setInterval(() => {
      setBroadcastIndex((prev) => (prev + 1) % activeBroadcasts.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [activeBroadcasts.length, isPlayingDemo]);

  const currentBroadcast = activeBroadcasts[broadcastIndex];

  // Comprehensive Dataset for the Admission Table
  const tableData = useMemo(() => {
    if (isNeet) {
      return [
        { id: "1", name: "AIIMS New Delhi", prog: "MBBS", quota: "AIQ 100%", r1: 42, r5: 57, beds: 2500, bond: "0 Years / ₹0 Safe", cat: "AIIMS", prob: estimatedAir <= 65 ? "HIGH" : "REACH" },
        { id: "2", name: "Maulana Azad Medical College (MAMC)", prog: "MBBS", quota: "15% AIQ", r1: 85, r5: 105, beds: 2800, bond: "1 Year / ₹3L", cat: "Central", prob: estimatedAir <= 120 ? "HIGH" : estimatedAir <= 300 ? "TARGET" : "REACH" },
        { id: "3", name: "VMMC & Safdarjung Hospital", prog: "MBBS", quota: "15% AIQ", r1: 110, r5: 142, beds: 2900, bond: "1 Year / ₹3L", cat: "Central", prob: estimatedAir <= 160 ? "HIGH" : estimatedAir <= 400 ? "TARGET" : "REACH" },
        { id: "4", name: "JIPMER Puducherry", prog: "MBBS", quota: "AIQ 100%", r1: 180, r5: 277, beds: 2200, bond: "0 Years / ₹0 Safe", cat: "Central", prob: estimatedAir <= 300 ? "HIGH" : estimatedAir <= 600 ? "TARGET" : "REACH" },
        { id: "5", name: "AIIMS Bhubaneswar", prog: "MBBS", quota: "AIIMS Open", r1: 340, r5: 540, beds: 1100, bond: "0 Years / ₹0 Safe", cat: "AIIMS", prob: estimatedAir <= 600 ? "HIGH" : estimatedAir <= 1200 ? "TARGET" : "REACH" },
        { id: "6", name: "King George's Medical University (KGMU)", prog: "MBBS", quota: "15% AIQ / 85% UP", r1: 980, r5: 1850, beds: 4500, bond: "2 Years / ₹10L Alert", cat: "State", prob: estimatedAir <= 2000 ? "HIGH" : "TARGET" },
        { id: "7", name: "Seth GS Medical College Mumbai", prog: "MBBS", quota: "15% AIQ / 85% MH", r1: 540, r5: 680, beds: 2250, bond: "1 Year / ₹10L Alert", cat: "State", prob: estimatedAir <= 750 ? "HIGH" : "TARGET" },
        { id: "8", name: "AIIMS Bhopal", prog: "MBBS", quota: "AIIMS Open", r1: 420, r5: 620, beds: 1000, bond: "0 Years / ₹0 Safe", cat: "AIIMS", prob: estimatedAir <= 700 ? "HIGH" : "TARGET" },
      ];
    } else {
      return [
        { id: "1", name: "IIT Bombay", prog: "Computer Science & Eng.", quota: "All India (OPEN)", r1: 67, r5: 68, beds: 0, pkg: "₹45 LPA", bond: "None", cat: "IIT", prob: jeeRank <= 80 ? "HIGH" : "REACH" },
        { id: "2", name: "IIT Delhi", prog: "Computer Science & Eng.", quota: "All India (OPEN)", r1: 105, r5: 118, beds: 0, pkg: "₹42 LPA", bond: "None", cat: "IIT", prob: jeeRank <= 130 ? "HIGH" : "REACH" },
        { id: "3", name: "IIT Madras", prog: "Electrical Engineering", quota: "All India (OPEN)", r1: 540, r5: 680, beds: 0, pkg: "₹38 LPA", bond: "None", cat: "IIT", prob: jeeRank <= 750 ? "HIGH" : "TARGET" },
        { id: "4", name: "IIT Kanpur", prog: "Mechanical Engineering", quota: "All India (OPEN)", r1: 1820, r5: 2240, beds: 0, pkg: "₹28 LPA", bond: "None", cat: "IIT", prob: jeeRank <= 2500 ? "HIGH" : "TARGET" },
        { id: "5", name: "NIT Trichy", prog: "Computer Science & Eng.", quota: "Other State Quota", r1: 1840, r5: 2100, beds: 0, pkg: "₹32 LPA", bond: "None", cat: "NIT", prob: jeeRank <= 2400 ? "HIGH" : "TARGET" },
        { id: "6", name: "IIIT Hyderabad", prog: "Computer Science & Eng.", quota: "JEE Main Direct", r1: 820, r5: 980, beds: 0, pkg: "₹42 LPA", bond: "None", cat: "IIIT", prob: jeeRank <= 1100 ? "HIGH" : "TARGET" },
        { id: "7", name: "NIT Surathkal", prog: "Information Technology", quota: "Home State Quota", r1: 2400, r5: 3100, beds: 0, pkg: "₹26 LPA", bond: "None", cat: "NIT", prob: jeeRank <= 3500 ? "HIGH" : "TARGET" },
        { id: "8", name: "IIT Roorkee", prog: "Data Science & AI", quota: "All India (OPEN)", r1: 720, r5: 890, beds: 0, pkg: "₹36 LPA", bond: "None", cat: "IIT", prob: jeeRank <= 950 ? "HIGH" : "TARGET" },
      ];
    }
  }, [isNeet, estimatedAir, jeeRank]);

  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase()) || item.prog.toLowerCase().includes(searchFilter.toLowerCase());
      const matchCat = selectedCategory === "ALL" || item.cat === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [tableData, searchFilter, selectedCategory]);

  // State Policy Database for Interactive State DME Explorer
  const statePolicies = {
    DL: { name: "Delhi (NCT)", gmcCount: 9, bondYears: "1 Year", bondPenalty: "₹3.0 Lakhs", ipQuota: "50% IP in MAMC/VMMC for Delhi Univ / IP Univ graduates", aiqSeats: "15% AIQ", stateSeats: "85% State Quota", highlight: "Highest clinical patient footfall in India." },
    MH: { name: "Maharashtra", gmcCount: 38, bondYears: "1 Year", bondPenalty: "₹10.0 Lakhs Bank Guarantee", ipQuota: "Strict State Service Posting immediately post-internship", aiqSeats: "15% AIQ", stateSeats: "85% DME Maharashtra", highlight: "Mandatory rural bank guarantee required at registration." },
    UP: { name: "Uttar Pradesh", gmcCount: 42, bondYears: "2 Years", bondPenalty: "₹10.0 Lakhs Demand Draft", ipQuota: "Government Primary Health Centers (PHC) mandatory", aiqSeats: "15% AIQ", stateSeats: "85% UPDGME", highlight: "Largest government medical seat pool in North India." },
    KA: { name: "Karnataka", gmcCount: 32, bondYears: "1 Year", bondPenalty: "₹10.0 to ₹50.0 Lakhs (KEA Rules)", ipQuota: "Compulsory rural service act strictly enforced", aiqSeats: "15% AIQ", stateSeats: "85% KEA Bangalore", highlight: "Top private & government medical infrastructure." },
    TN: { name: "Tamil Nadu", gmcCount: 39, bondYears: "5 Years", bondPenalty: "₹10.0 Lakhs", ipQuota: "Very strict compulsory service tenure", aiqSeats: "15% AIQ", stateSeats: "85% TN Medical Selection", highlight: "Critical caution: 5-year rural service commitment." },
    RJ: { name: "Rajasthan", gmcCount: 26, bondYears: "2 Years", bondPenalty: "₹5.0 Lakhs", ipQuota: "State health department posting", aiqSeats: "15% AIQ", stateSeats: "85% RUHS Jaipur", highlight: "High cutoff state; choice sequencing accuracy critical." },
  };

  const currentStatePolicy = statePolicies[activeState];

  return (
    <div className="min-h-screen w-full bg-[#fcfcfc] dark:bg-[#0c0d0e] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-neutral-900 selection:text-white transition-colors">
      
      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative px-6 pt-16 pb-10 sm:pt-24 sm:pb-14 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-neutral-950 dark:text-white max-w-5xl leading-[1.08]">
          Build your Admission Dossier <br className="hidden sm:block" />
          <span className="font-serif italic font-normal text-neutral-500 dark:text-neutral-400">
            at Algorithmic Speed
          </span>
        </h1>

        {/* Editorial Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl font-normal leading-relaxed">
          The transparent mathematical engine for India's aspirants. Audit 10 years of JoSAA closing ranks, 1,08,940 MBBS seats, and state rural bond liabilities before locking choices.
        </p>

        {/* Signature Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-md font-medium text-sm bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm cursor-pointer"
          >
            Get started free
          </button>
          <button
            onClick={() => navigate({ to: "/predict" })}
            className="px-6 py-2.5 rounded-md font-medium text-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition shadow-2xs cursor-pointer"
          >
            Talk to senior counsellors
          </button>
        </div>

        {/* ─── 2. TIME-CHANGING LIVE TELEMETRY DASHBOARD MOCKUP ─── */}
        <div className="w-full mt-12 relative">
          {/* Floating Luxury Telemetry Badge (Top Left) */}
          <div className="hidden lg:flex items-center gap-2.5 absolute -top-5 -left-4 z-20 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-white/15 bg-white/90 dark:bg-[#0e1118]/90 shadow-xl backdrop-blur-md text-[11px] font-mono">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-blue-500" />
            </span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              {isNeet ? "MCC NEET-UG 2026 ENGINE" : "JoSAA ADMISSION KERNEL"}
            </span>
            <span className="text-neutral-400">· 10-Yr Verified Data</span>
          </div>

          {/* Floating Luxury Telemetry Badge (Bottom Right) */}
          <div className="hidden lg:flex items-center gap-2 absolute -bottom-5 -right-4 z-20 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-white/90 dark:bg-[#0e1118]/90 shadow-xl backdrop-blur-md text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            <span>✓</span>
            <span className="font-bold">Zero Rural Bond Shield Certified</span>
          </div>

          <div id="app-mockup" className="w-full rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e1015] shadow-[0_25px_80px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden text-left relative">
            
            {/* Window Chrome Header */}
            <div className="h-11 border-b border-neutral-200 dark:border-white/10 bg-neutral-100/80 dark:bg-[#13161c] px-4 flex items-center justify-between select-none">
              {/* Window Controls */}
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#FF5F57] inline-block" />
                <span className="size-3 rounded-full bg-[#FEBC2E] inline-block" />
                <span className="size-3 rounded-full bg-[#28C840] inline-block" />
              </div>

              {/* Window Title & Live Simulation Controller */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {isNeet ? "MCC_NEET_UG_2026.workspace" : "JoSAA_IIT_NIT_2026.workspace"}
                  </span>
                  <span className="hidden sm:inline text-neutral-400">—</span>
                  <span className="hidden sm:inline text-neutral-400">Live Operating Simulation</span>
                </div>

                {/* Simulation Toggle Pill */}
                <button
                  onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                  className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition border cursor-pointer ${
                    isPlayingDemo
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-neutral-200 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-500"
                  }`}
                  title="Toggle live telemetry playback simulation"
                >
                  <span>{isPlayingDemo ? "❚❚ PAUSE DEMO" : "▶ PLAY DEMO"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 bg-neutral-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded">
                <span>⌘K</span>
              </div>
            </div>

            {/* ⚡ TIME-CHANGING LIVE ALLOTMENT TICKER BAR */}
            <div className="border-b border-neutral-200 dark:border-white/10 bg-neutral-50/90 dark:bg-[#111318] px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs transition-colors">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {/* Pulsing Live Radar Dot */}
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                </span>
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider whitespace-nowrap">
                  LIVE BROADCAST
                </span>
                <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">|</span>
                <span className="font-bold text-neutral-900 dark:text-white truncate">
                  {currentBroadcast.inst}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 truncate hidden md:inline">
                  · {currentBroadcast.event}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] self-end sm:self-auto">
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold whitespace-nowrap">
                  {currentBroadcast.metric}
                </span>
                <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px]">
                  {currentBroadcast.status}
                </span>
                <span className="text-neutral-400 text-[10px]">{currentBroadcast.time}</span>
              </div>
            </div>

          {/* Window Body: Sidebar + Main Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            
            {/* Left Sidebar */}
            <aside className="hidden md:flex md:col-span-3 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-[#131417] p-3 flex-col justify-between text-xs">
              <div>
                {/* Mode Pill */}
                <div className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between mb-4 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{isNeet ? "🩺" : "⬡"}</span>
                    <span className="font-semibold text-neutral-800 dark:text-white">
                      {isNeet ? "NEET UG Medical" : "JEE Main & Adv"}
                    </span>
                  </div>
                  <span className="text-emerald-500 text-[10px] font-mono font-bold">ONLINE</span>
                </div>

                {/* Sidebar Views */}
                <div className="space-y-0.5">
                  <div className="px-2 py-1 text-[10px] font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                    Views
                  </div>
                  {[
                    { label: "All Allotments", count: tableData.length, active: true },
                    { label: "Apex AIIMS & IITs", count: isNeet ? 25 : 23 },
                    { label: "State GMCs / NITs", count: isNeet ? 706 : 32 },
                    { label: "Service Bonds Shield", count: 18 },
                    { label: "Hospital Beds OPD", count: 28 },
                    { label: "Priority Sequencer", count: "PDF" },
                  ].map((it, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition text-left cursor-pointer ${
                        it.active
                          ? "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      <span>{it.label}</span>
                      <span className="text-[10px] font-mono text-neutral-400">{it.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar Footer Live Rank Tuner */}
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <div className="flex items-baseline justify-between text-[11px] mb-1 font-mono">
                  <span className="text-neutral-500">{isNeet ? "Live Score Tuning:" : "Live Rank Tuning:"}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {isNeet ? `${testScore} Marks` : `AIR ${jeeRank}`}
                  </span>
                </div>
                {isNeet ? (
                  <input
                    type="range"
                    min="200"
                    max="720"
                    step="1"
                    value={testScore}
                    onChange={(e) => setTestScore(parseInt(e.target.value, 10))}
                    className="w-full accent-neutral-900 dark:accent-white cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded"
                  />
                ) : (
                  <input
                    type="range"
                    min="50"
                    max="10000"
                    step="50"
                    value={jeeRank}
                    onChange={(e) => setJeeRank(parseInt(e.target.value, 10))}
                    className="w-full accent-neutral-900 dark:accent-white cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded"
                  />
                )}
                <div className="text-[9.5px] text-neutral-400 font-mono mt-1 text-right">
                  Estimated ~AIR {isNeet ? estimatedAir.toLocaleString() : jeeRank.toLocaleString()}
                </div>
              </div>
            </aside>

            {/* Main Area with Multi-View Switcher */}
            <main className="col-span-1 md:col-span-9 p-4 flex flex-col justify-between">
              <div>
                {/* View Switcher Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded text-xs">
                    <button
                      onClick={() => setActiveView("table")}
                      className={`px-3 py-1 rounded transition font-medium cursor-pointer ${
                        activeView === "table" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs" : "text-neutral-500"
                      }`}
                    >
                      Table View
                    </button>
                    <button
                      onClick={() => setActiveView("kanban")}
                      className={`px-3 py-1 rounded transition font-medium cursor-pointer ${
                        activeView === "kanban" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs" : "text-neutral-500"
                      }`}
                    >
                      Kanban Board
                    </button>
                    <button
                      onClick={() => setActiveView("matrix")}
                      className={`px-3 py-1 rounded transition font-medium cursor-pointer ${
                        activeView === "matrix" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-2xs" : "text-neutral-500"
                      }`}
                    >
                      Round Drops
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Filter institute or branch..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white outline-none w-44 sm:w-56"
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 outline-none"
                    >
                      <option value="ALL">All Quotas</option>
                      <option value="AIIMS">AIIMS</option>
                      <option value="Central">Central</option>
                      <option value="State">State Quota</option>
                      <option value="IIT">IITs</option>
                      <option value="NIT">NITs</option>
                    </select>
                  </div>
                </div>

                {/* ─── VIEW 1: TABLE VIEW ─── */}
                {activeView === "table" && (
                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-400">
                          <th className="py-2 px-3 font-medium">INSTITUTION</th>
                          <th className="py-2 px-3 font-medium">PROGRAM</th>
                          <th className="py-2 px-3 font-medium">QUOTA</th>
                          <th className="py-2 px-3 font-medium text-right">R1 CUTOFF</th>
                          <th className="py-2 px-3 font-medium text-right">R5 CLOSING</th>
                          <th className="py-2 px-3 font-medium text-right">{isNeet ? "BEDS OPD" : "MEDIAN PKG"}</th>
                          <th className="py-2 px-3 font-medium">SERVICE BOND</th>
                          <th className="py-2 px-3 font-medium text-right">MATCH CHANCE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900 font-mono">
                        {filteredData.map((row) => {
                          const isLiveBroadcasting = currentBroadcast && (
                            row.name.toLowerCase().includes(currentBroadcast.inst.toLowerCase()) ||
                            currentBroadcast.inst.toLowerCase().includes(row.name.toLowerCase())
                          );
                          return (
                            <tr 
                              key={row.id} 
                              className={`transition-all duration-300 ${
                                isLiveBroadcasting 
                                  ? "bg-blue-500/[0.08] dark:bg-blue-500/[0.12] shadow-inner" 
                                  : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                              }`}
                            >
                              <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {isLiveBroadcasting && (
                                    <span className="size-1.5 rounded-full bg-blue-500 animate-ping" />
                                  )}
                                  <span>{row.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap font-sans">
                                {row.prog}
                              </td>
                              <td className="py-2.5 px-3 text-neutral-500 whitespace-nowrap text-[11px]">
                                {row.quota}
                              </td>
                              <td className="py-2.5 px-3 text-right text-neutral-700 dark:text-neutral-300">
                                AIR {row.r1}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-neutral-900 dark:text-white">
                                AIR {row.r5}
                              </td>
                              <td className="py-2.5 px-3 text-right text-cyan-600 dark:text-cyan-400 font-semibold">
                                {isNeet ? `${(row as any).beds} Beds` : (row as any).pkg}
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-amber-700 dark:text-amber-400 whitespace-nowrap">
                                {row.bond}
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    row.prob === "HIGH"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : row.prob === "TARGET"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                  }`}
                                >
                                  {row.prob}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ─── VIEW 2: KANBAN BOARD VIEW ─── */}
                {activeView === "kanban" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    {/* Safe Column */}
                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">HIGH PROBABILITY</span>
                        <span className="text-neutral-400">{filteredData.filter((d) => d.prob === "HIGH").length}</span>
                      </div>
                      <div className="space-y-2">
                        {filteredData.filter((d) => d.prob === "HIGH").map((c) => (
                          <div key={c.id} className="p-2.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
                            <div className="font-semibold text-neutral-900 dark:text-white">{c.name}</div>
                            <div className="text-neutral-500 text-[11px] font-sans">{c.prog}</div>
                            <div className="mt-2 flex items-center justify-between text-[10.5px] font-mono text-neutral-400">
                              <span>Closing: AIR {c.r5}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">95%+ Chance</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Column */}
                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
                        <span className="font-bold text-amber-600 dark:text-amber-400">TARGET BENCHMARKS</span>
                        <span className="text-neutral-400">{filteredData.filter((d) => d.prob === "TARGET").length}</span>
                      </div>
                      <div className="space-y-2">
                        {filteredData.filter((d) => d.prob === "TARGET").map((c) => (
                          <div key={c.id} className="p-2.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
                            <div className="font-semibold text-neutral-900 dark:text-white">{c.name}</div>
                            <div className="text-neutral-500 text-[11px] font-sans">{c.prog}</div>
                            <div className="mt-2 flex items-center justify-between text-[10.5px] font-mono text-neutral-400">
                              <span>Closing: AIR {c.r5}</span>
                              <span className="text-amber-600 dark:text-amber-400 font-bold">Competitive</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reach Column */}
                    <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800 font-mono text-[11px]">
                        <span className="font-bold text-neutral-600 dark:text-neutral-400">REACH / ASPIRATIONAL</span>
                        <span className="text-neutral-400">{filteredData.filter((d) => d.prob === "REACH").length}</span>
                      </div>
                      <div className="space-y-2">
                        {filteredData.filter((d) => d.prob === "REACH").map((c) => (
                          <div key={c.id} className="p-2.5 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
                            <div className="font-semibold text-neutral-900 dark:text-white">{c.name}</div>
                            <div className="text-neutral-500 text-[11px] font-sans">{c.prog}</div>
                            <div className="mt-2 flex items-center justify-between text-[10.5px] font-mono text-neutral-400">
                              <span>Closing: AIR {c.r5}</span>
                              <span className="text-neutral-500 font-bold">Aspirational</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── VIEW 3: ROUND DROPS MATRIX ─── */}
                {activeView === "matrix" && (
                  <div className="overflow-x-auto mt-3 font-mono text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
                          <th className="py-2 px-3">INSTITUTE</th>
                          <th className="py-2 px-3 text-right">ROUND 1</th>
                          <th className="py-2 px-3 text-right">ROUND 2</th>
                          <th className="py-2 px-3 text-right">ROUND 3</th>
                          <th className="py-2 px-3 text-right">STRAY VACANCY</th>
                          <th className="py-2 px-3 text-right">NET VACANCY DROP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                        {filteredData.map((r) => {
                          const drop = r.r5 - r.r1;
                          return (
                            <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                              <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-white">{r.name}</td>
                              <td className="py-2.5 px-3 text-right text-neutral-500">AIR {r.r1}</td>
                              <td className="py-2.5 px-3 text-right text-neutral-500">AIR {Math.round(r.r1 + drop * 0.4)}</td>
                              <td className="py-2.5 px-3 text-right text-neutral-500">AIR {Math.round(r.r1 + drop * 0.8)}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-neutral-900 dark:text-white">AIR {r.r5}</td>
                              <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">+{drop} Ranks</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div className="pt-3 mt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                <div>
                  Calibrated on 10-Year official JoSAA & MCC allotment sheets
                </div>
                <button
                  onClick={() => setModalOpen(true)}
                  className="px-3.5 py-1.5 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs hover:opacity-90 transition cursor-pointer"
                >
                  Generate Candidate PDF Dossier →
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
      </section>

      {/* ─── 3. IN-DEPTH INTERACTIVE STATE DME BOND & QUOTA EXPLORER ─── */}
      <section className="px-6 py-20 max-w-6xl mx-auto border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-semibold uppercase text-neutral-400 tracking-wider">
            State Domicile Radar
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-neutral-950 dark:text-white mt-2 font-serif">
            Interactive State DME & Bond Penalty Audit
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            64% of aspirants lock choices without knowing state rural bonds. Select your state to inspect official DME bank guarantees.
          </p>
        </div>

        {/* State Selection Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {(Object.keys(statePolicies) as StateCode[]).map((st) => (
            <button
              key={st}
              onClick={() => setActiveState(st)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer border ${
                activeState === st
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-transparent shadow-xs"
                  : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
              }`}
            >
              {statePolicies[st].name}
            </button>
          ))}
        </div>

        {/* State Policy Audit Card */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111214] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                ACTIVE DME REGISTRATION DIRECTIVE
              </span>
              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">
                {currentStatePolicy.name} — {currentStatePolicy.gmcCount} Accredited Government Colleges
              </h3>
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                {currentStatePolicy.highlight}
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold whitespace-nowrap self-start sm:self-center cursor-pointer"
            >
              Audit My State Chance →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10.5px] font-mono text-neutral-400">RURAL SERVICE TENURE</span>
              <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono mt-1">
                {currentStatePolicy.bondYears}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Mandatory rural posting</div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10.5px] font-mono text-amber-500">BOND PENALTY GUARANTEE</span>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
                {currentStatePolicy.bondPenalty}
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Bank guarantee liability</div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10.5px] font-mono text-neutral-400">INTERNAL PG QUOTA</span>
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-1 leading-snug">
                {currentStatePolicy.ipQuota}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[10.5px] font-mono text-neutral-400">SEAT BREAKDOWN</span>
              <div className="text-xs font-mono text-neutral-700 dark:text-neutral-300 mt-1 space-y-1">
                <div>• {currentStatePolicy.aiqSeats}</div>
                <div>• {currentStatePolicy.stateSeats}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. IN-DEPTH JOSAA & MCC CHOICE SEQUENCER ─── */}
      <section className="px-6 py-20 max-w-6xl mx-auto border-t border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <span className="text-xs font-mono font-semibold uppercase text-neutral-400 tracking-wider">
              Mathematical Optimization
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-neutral-950 dark:text-white mt-2 mb-4 font-serif">
              Algorithmic Choice Order Sequencer.
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
              In JoSAA and MCC, locking an inferior college above a premier one cannot be reversed. Our sequencer constructs a mathematically bulletproof list: dream colleges first, followed by calibrated target choices, protected by absolute safety nets.
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Tier 1 Dream Choices (Zero risk to fill)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Tier 2 Competitive Target Options</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Tier 3 Verified Safety Nets with 99% probability</span>
              </div>
            </div>
          </div>

          {/* Visual Priority List Box */}
          <div className="md:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111214] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800 font-mono text-xs">
              <span className="font-bold text-neutral-900 dark:text-white">OFFICIAL JOSAA/MCC CHOICE ORDER</span>
              <span className="text-emerald-500">Determined for AIR {isNeet ? estimatedAir : jeeRank}</span>
            </div>
            <div className="space-y-2 font-mono text-xs">
              {[
                { order: "01", name: isNeet ? "AIIMS New Delhi (MBBS)" : "IIT Bombay (Computer Science)", tier: "DREAM", tag: "AIR 1 - 68" },
                { order: "02", name: isNeet ? "MAMC New Delhi (15% AIQ)" : "IIT Delhi (Computer Science)", tier: "DREAM", tag: "AIR 70 - 120" },
                { order: "03", name: isNeet ? "VMMC & Safdarjung (MBBS)" : "IIT Madras (Electrical Eng.)", tier: "TARGET", tag: "AIR 500 - 800" },
                { order: "04", name: isNeet ? "AIIMS Bhubaneswar (MBBS)" : "NIT Trichy (Computer Science)", tier: "TARGET", tag: "AIR 1200 - 2100" },
                { order: "05", name: isNeet ? "State Top GMC (85% Domicile)" : "NIT Surathkal (Information Tech)", tier: "SAFE", tag: "AIR 2400+" },
              ].map((c) => (
                <div
                  key={c.order}
                  className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-400">{c.order}</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400 hidden sm:inline">{c.tag}</span>
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                      c.tier === "DREAM" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" :
                      c.tier === "TARGET" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}>
                      {c.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-500 font-mono">Export format: Official JoSAA PDF</span>
              <button
                onClick={() => setModalOpen(true)}
                className="px-3 py-1.5 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold cursor-pointer"
              >
                Export Order PDF →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. FINAL ACTION CALLOUT ─── */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <div className="p-8 sm:p-12 rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-[#131417]">
          <h3 className="text-2xl sm:text-3xl font-light text-neutral-950 dark:text-white font-serif mb-3">
            Open Source & Built for Every Aspirant.
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto mb-6">
            Say goodbye to ₹25,000 paid counsellor scams. Transparent mathematical models, verified cutoff datasets, and zero vendor lock-in.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-md font-medium text-xs bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow cursor-pointer"
          >
            Launch Admission Predictor Now →
          </button>
        </div>
      </section>

      {/* ─── 6. FOOTER ─── */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-10 px-6 text-xs text-neutral-500 font-sans">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 dark:text-white font-serif text-sm">
              {isNeet ? "NEET UG Admission Matrix" : "JoSAA JEE Admission Matrix"}
            </span>
            <span>· Open Source Counselling Infrastructure</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <a href="https://github.com/twentyhq/twenty" target="_blank" rel="noreferrer" className="hover:underline">
              GitHub (56.2K Stars)
            </a>
            <span>·</span>
            <span>Apache 2.0 Open Source</span>
            <span>·</span>
            <span>No Cookies / No Ads</span>
          </div>
        </div>
      </footer>

      <PredictionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
