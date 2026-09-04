import { useEffect, useState, useMemo } from "react";
import type { ParsedReport } from "@/lib/parse-prediction-pdf";

interface Props {
  parsedReport: ParsedReport;
  onDone?: () => void;
}

const EVALUATION_STREAM = [
  { code: "AIIMS-DEL", name: "AIIMS New Delhi", quota: "100% MCC AIQ", cutoff: "AIR 57", beds: "2,478 Beds", match: "99.1%", bond: "0 Bond", stipend: "₹1,20,000/mo" },
  { code: "MAMC-DEL", name: "Maulana Azad Medical College", quota: "15% AIQ / 85% DU", cutoff: "AIR 105", beds: "2,800 Beds", match: "98.4%", bond: "1 Yr / ₹10L", stipend: "₹1,15,000/mo" },
  { code: "VMMC-DEL", name: "VMMC & Safdarjung Hospital", quota: "15% AIQ / 85% IPU", cutoff: "AIR 142", beds: "2,900 Beds", match: "97.8%", bond: "1 Yr / ₹10L", stipend: "₹1,12,000/mo" },
  { code: "JIPMER-PUDU", name: "JIPMER Puducherry", quota: "Central University", cutoff: "AIR 277", beds: "2,200 Beds", match: "96.5%", bond: "0 Bond", stipend: "₹1,18,000/mo" },
  { code: "IMS-BHU", name: "IMS Banaras Hindu University", quota: "Central University", cutoff: "AIR 840", beds: "1,800 Beds", match: "95.2%", bond: "0 Bond", stipend: "₹1,10,000/mo" },
  { code: "SETH-GS", name: "Seth GS Medical College, Mumbai", quota: "15% AIQ / 85% MH", cutoff: "AIR 680", beds: "2,250 Beds", match: "94.8%", bond: "1 Yr / ₹10L", stipend: "₹1,05,000/mo" },
  { code: "KGMU-LKO", name: "King George's Medical University", quota: "15% AIQ / 85% UP", cutoff: "AIR 1,850", beds: "4,500 Beds", match: "93.9%", bond: "2 Yrs / ₹10L", stipend: "₹98,000/mo" },
  { code: "CMC-VEL", name: "Christian Medical College, Vellore", quota: "Open Merit / AIQ", cutoff: "AIR 215", beds: "3,000 Beds", match: "92.7%", bond: "2 Yrs Service", stipend: "₹85,000/mo" },
  { code: "MMC-CHE", name: "Madras Medical College", quota: "15% AIQ / 85% TN", cutoff: "AIR 790", beds: "2,722 Beds", match: "91.5%", bond: "5 Yrs / ₹5L", stipend: "₹95,000/mo" },
  { code: "BMCRI-BLR", name: "Bangalore Medical College", quota: "15% AIQ / 85% KA", cutoff: "AIR 1,450", beds: "3,100 Beds", match: "90.2%", bond: "1 Yr / ₹10L", stipend: "₹92,000/mo" },
  { code: "SMS-JAI", name: "SMS Medical College, Jaipur", quota: "15% AIQ / 85% RJ", cutoff: "AIR 1,280", beds: "3,500 Beds", match: "89.4%", bond: "2 Yrs / ₹5L", stipend: "₹90,000/mo" },
  { code: "AFMC-PUN", name: "Armed Forces Medical College", quota: "MoD Screening", cutoff: "AIR 620", beds: "1,200 Beds", match: "93.0%", bond: "Commission Bond", stipend: "₹1,25,000/mo" },
];

const PHASES = [
  { id: 1, title: "1. SCORE DECRYPTION", subtitle: "Extracting 720 marks curve & CRL percentile" },
  { id: 2, title: "2. MCC AIQ 15% NEURAL MATRIX", subtitle: "Screening 15,400+ Govt AIQ MBBS seats" },
  { id: 3, title: "3. 85% STATE DME & BED AUDIT", subtitle: "Evaluating Domicile quota & OPD patient bed diversity" },
  { id: 4, title: "4. BOND INTEGRITY & DOSSIER LOCK", subtitle: "Verifying service bonds and compiling personalized report" },
];

const SCAN_TELEMETRY = [
  "INITIALIZING QUANTUM MCC NEURAL INDEXER...",
  "PARSING CANDIDATE SCORECARD SPECTRUM AGAINST 24 LAKH NTA ROWS...",
  "CALIBRATING APEX AIIMS & CENTRAL UNIVERSITIES (ROUND 1 CUTOFFS)...",
  "CROSS-INDEXING 15% ALL INDIA QUOTA (15,400+ GOVT MBBS SEATS)...",
  "AUDITING 85% STATE DME DOMICILE MATRICES & CATEGORY POOLS...",
  "EVALUATING HOSPITAL BED INFLOW, SURGICAL CUTTING & CLINICAL RATIOS...",
  "COMPUTING STATE SERVICE BOND PENALTIES & RURAL TENURE CONDITIONS...",
  "LOCKING OPTIMAL MEDICAL SEAT DOSSIER WITH ZERO GUESSWORK...",
];

export function NeetClinicalProcessing({ parsedReport, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [activeCollegeIdx, setActiveCollegeIdx] = useState(0);
  const [scannedSeats, setScannedSeats] = useState(0);

  const DURATION_MS = 6000;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / DURATION_MS) * 100));
      setProgress(p);

      const seats = Math.min(108940, Math.round((p / 100) * 108940));
      setScannedSeats(seats);

      const logIdx = Math.min(
        SCAN_TELEMETRY.length - 1,
        Math.floor((elapsed / DURATION_MS) * SCAN_TELEMETRY.length)
      );
      setLogIndex(logIdx);

      const clgIdx = Math.floor((elapsed / 380) % EVALUATION_STREAM.length);
      setActiveCollegeIdx(clgIdx);

      if (elapsed >= DURATION_MS) {
        clearInterval(interval);
        setTimeout(() => {
          if (onDone) onDone();
        }, 150);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [onDone]);

  const activeCollege = EVALUATION_STREAM[activeCollegeIdx];
  const activePhase = Math.min(4, Math.floor(progress / 25) + 1);

  // Concentric radar ring angles for holographic HUD
  const ringAngles = useMemo(() => [0, 45, 90, 135, 180, 225, 270, 315], []);

  return (
    <div className="relative min-h-screen w-full bg-[#05080f] text-[#f1f5f9] font-mono flex flex-col justify-between overflow-hidden select-none">
      {/* Background Holographic Cyber Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 45%, rgba(59, 130, 246, 0.18) 0%, transparent 70%),
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      {/* Top Header Bar with Live Candidate Dossier Pills */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-[#070b14]/90 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-2.5 rounded-full bg-blue-500 animate-ping" />
          <span className="text-xs font-black tracking-[0.25em] text-white">
            MCC COUNSELLING TELEMETRY ENGINE
          </span>
          <span className="rounded-full bg-blue-500/15 border border-blue-500/40 px-2.5 py-0.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
            NEET-UG 2026 DECRYPTOR
          </span>
        </div>

        <div className="flex items-center gap-5 text-xs text-slate-400">
          <div>
            CANDIDATE: <strong className="text-white">{parsedReport.student?.name || "ASPIRANT"}</strong>
          </div>
          <div>
            TOTAL SCORE: <strong className="text-blue-400">{parsedReport.student?.shift || "720 MARKS"}</strong>
          </div>
          <div>
            CALIBRATED AIR: <strong className="text-white">#{parsedReport.student?.categoryRank?.toLocaleString() || "—"}</strong>
          </div>

          <button
            type="button"
            onClick={() => onDone?.()}
            className="mono text-[9px] px-2.5 py-1 rounded border border-white/20 bg-white/5 text-slate-300 hover:text-white hover:border-blue-400 transition"
          >
            SKIP ANIMATION →
          </button>
        </div>
      </header>

      {/* 4-Stage Execution Tracker */}
      <div className="relative z-10 grid grid-cols-4 gap-2 px-8 pt-3">
        {PHASES.map((ph) => {
          const isDone = activePhase > ph.id;
          const isCurrent = activePhase === ph.id;
          return (
            <div
              key={ph.id}
              className={`p-2.5 rounded-lg border transition-all duration-300 flex items-center justify-between ${
                isCurrent
                  ? "border-blue-500 bg-blue-500/15 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                  : isDone
                  ? "border-white/15 bg-white/5 opacity-80"
                  : "border-white/5 bg-black/20 opacity-40"
              }`}
            >
              <div>
                <div className={`text-[10px] font-bold ${isCurrent ? "text-blue-300" : isDone ? "text-white" : "text-slate-500"}`}>
                  {ph.title}
                </div>
                <div className="text-[8.5px] text-slate-400 truncate max-w-[200px]">
                  {ph.subtitle}
                </div>
              </div>
              <span className="text-xs">
                {isDone ? "✓" : isCurrent ? "⚡" : "○"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Centerpiece: High-Tech Cybernetic Medical Command Deck */}
      <main className="relative z-10 flex flex-1 items-center justify-between px-10 py-4 gap-6">
        {/* Left Side: Live Institution Evaluation Terminal Stream */}
        <div className="w-[330px] rounded-xl border border-white/15 bg-[#0a0f1d]/85 p-4 backdrop-blur-xl shadow-2xl flex flex-col justify-between h-[400px]">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
              <span className="mono text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                SEAT STREAM EVALUATOR
              </span>
              <span className="mono text-[9px] text-slate-400">706 GMCs QUEUED</span>
            </div>

            <div className="flex flex-col gap-1.5 overflow-hidden">
              {EVALUATION_STREAM.slice(0, 6).map((item, idx) => {
                const isEvaluating = idx === (activeCollegeIdx % 6);
                return (
                  <div
                    key={item.code}
                    className={`rounded-lg p-2 border transition-all text-xs flex flex-col gap-1 ${
                      isEvaluating
                        ? "border-blue-500 bg-blue-500/15 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-[1.01]"
                        : "border-white/10 bg-[#070b14]/70 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white truncate max-w-[180px] text-[11px]">{item.name}</span>
                      <span className="mono text-[9px] text-blue-400 font-semibold">{item.cutoff}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span>{item.beds}</span>
                      <span className={`mono font-bold px-1.5 py-0.2 rounded text-[8.5px] ${
                        isEvaluating ? "text-blue-300 bg-blue-500/25" : "text-slate-400"
                      }`}>
                        {isEvaluating ? "AUDITING..." : "INDEXED"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
            <span>Seats Analyzed: <strong className="text-white">{scannedSeats.toLocaleString()}</strong></span>
            <span className="text-blue-400 font-bold">100% Calibrated</span>
          </div>
        </div>

        {/* Center: High-Tech Cybernetic 3D Rotating Holographic Radar Reactor */}
        <div className="relative flex size-[420px] items-center justify-center">
          {/* Outer rotating measurement rings */}
          <div
            className="absolute inset-0 rounded-full border border-blue-500/25 animate-spin"
            style={{ animationDuration: "24s" }}
          />
          <div
            className="absolute inset-4 rounded-full border border-dashed border-white/20 animate-spin"
            style={{ animationDuration: "18s", animationDirection: "reverse" }}
          />
          <div
            className="absolute inset-12 rounded-full border border-blue-400/35 animate-spin"
            style={{ animationDuration: "12s" }}
          />
          <div
            className="absolute inset-20 rounded-full border border-cyan-400/25 animate-spin"
            style={{ animationDuration: "8s", animationDirection: "reverse" }}
          />

          {/* Sweeping Scanning Laser Radar Line */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full animate-spin"
            style={{
              animationDuration: "3.2s",
              background: "conic-gradient(from 0deg, transparent 70%, rgba(59, 130, 246, 0.35) 100%)",
            }}
          />

          {/* Radial Axis Nodes */}
          {ringAngles.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const r = 180;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            return (
              <div
                key={i}
                className="absolute size-2 rounded-full bg-blue-400/70 shadow-[0_0_8px_#3b82f6]"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              />
            );
          })}

          {/* Central High-Tech Metric Quantum Core */}
          <div className="relative z-20 flex size-44 flex-col items-center justify-center rounded-full border-2 border-blue-500 bg-[#070b14] p-4 text-center shadow-[0_0_70px_rgba(59,130,246,0.4)]">
            <div className="mono text-[8.5px] tracking-[0.2em] text-blue-400 font-bold uppercase">
              MCC QUANTUM CORE
            </div>

            <div className="mt-1 text-4xl font-black text-white tracking-tight">
              {progress}%
            </div>

            <div className="mt-0.5 mono text-[8px] uppercase tracking-widest text-slate-400 font-semibold">
              INDEXING {scannedSeats.toLocaleString()} SEATS
            </div>

            {/* Pulsing ECG Vitals Graph in core */}
            <div className="mt-2 w-20 h-4 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 20">
                <path
                  d="M0,10 L30,10 L35,2 L40,18 L45,6 L50,14 L55,10 L100,10"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.6"
                />
              </svg>
            </div>

            {/* Glowing progress line */}
            <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-blue-950">
              <div className="h-full bg-blue-400 transition-all duration-100 shadow-[0_0_8px_#38bdf8]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Right Side: Active Hospital Match Inspection Card */}
        <div className="w-[330px] rounded-xl border border-white/15 bg-[#0a0f1d]/85 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between h-[400px]">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="mono text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                ◆ ACTIVE INSPECTION
              </span>
              <span className="mono text-[8.5px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                {activeCollege.match} MATCH
              </span>
            </div>

            <h3 className="text-base font-black text-white leading-snug">
              {activeCollege.name}
            </h3>
            <div className="mt-1 mono text-[10px] text-slate-400">
              Round 1 Cutoff: <strong className="text-blue-400">{activeCollege.cutoff}</strong>
            </div>

            <div className="mt-3.5 space-y-2 rounded-lg bg-[#070b14] p-3 text-xs border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">Quota:</span>
                <span className="font-semibold text-white">{activeCollege.quota}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient Beds:</span>
                <span className="font-semibold text-cyan-300">{activeCollege.beds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service Bond:</span>
                <span className="font-semibold text-amber-300">{activeCollege.bond}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">PG Stipend:</span>
                <span className="font-bold text-white">{activeCollege.stipend}</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg border border-blue-500/25 bg-blue-500/10 text-[9.5px] text-blue-200/90 leading-relaxed">
              Evaluating your exact score against historic 15% AIQ and Domicile State Quotas...
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
            <span>MCC Verification Matrix</span>
            <span className="text-white font-bold">100% Complete</span>
          </div>
        </div>
      </main>

      {/* Bottom Terminal Status Bar & Audio-Visual Equalizer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#070b14]/95 px-6 py-3.5">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold">TELEMETRY:</span>
            <span className="text-white font-semibold tracking-wide text-[11px]">
              {SCAN_TELEMETRY[logIndex]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Animated frequency equalizer bars */}
            <div className="flex items-end gap-0.5 h-3">
              {[8, 14, 6, 12, 16, 9, 13, 5, 11, 15].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-blue-400/80 rounded-t"
                  style={{
                    height: `${(h * ((progress % 30) + 10)) / 25}px`,
                    transition: "height 0.1s ease",
                  }}
                />
              ))}
            </div>
            <span className="font-bold text-blue-400">{progress}% COMPILED</span>
          </div>
        </div>

        {/* Crisp Laser Progress Line */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-400 to-white transition-all duration-100 shadow-[0_0_14px_#3b82f6]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[9.5px] text-slate-400">
          <span>1,08,940 Total MBBS Seats Evaluated</span>
          <span>15% AIQ + 85% State DME Matrices Synchronized</span>
          <span>Zero Guesswork</span>
        </div>
      </footer>
    </div>
  );
}
