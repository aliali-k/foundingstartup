import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { JEE_MAIN_SHIFTS } from "@/lib/jee-main-shifts";
import { setPendingPredictPayload, setReport, clearReport } from "@/lib/prediction-store";
import { useExamMode } from "@/lib/exam-mode-context";
import { useTheme } from "./theme-provider";
import { predictNeetColleges, marksToEstimatedNeetRank } from "@/lib/neet-mock-data";
import type { ParsedReport } from "@/lib/parse-prediction-pdf";

type JeeExamType = "jee main" | "jee advanced" | null;
type Gender = "GENDER NEUTRAL" | "FEMALE" | null;
type NeetCourse = "MBBS" | "BDS" | "BAMS";

const CATEGORIES = [
  "OPEN",
  "EWS",
  "OBC-NCL",
  "SC",
  "ST",
  "OPEN (PwD)",
  "EWS (PwD)",
  "OBC-NCL (PwD)",
  "SC (PwD)",
  "ST (PwD)",
];

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Daman and Diu","Dadra and Nagar Haveli",
];

const YEARS = [2026, 2025, 2024, 2023, 2022];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PredictionModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { isNeet } = useExamMode();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [step, setStep] = useState(1);
  const [fading, setFading] = useState(false);

  // Common Candidate Info
  const [name, setName] = useState("");
  const [year, setYear] = useState<number>(2026);
  const [gender, setGender] = useState<Gender>(null);
  const [state, setState] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [stateOpen, setStateOpen] = useState(false);
  const [category, setCategory] = useState("OPEN");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Result Out Question
  const [resultOut, setResultOut] = useState<boolean | null>(null);

  // NEET Specific Fields
  const [neetCourse, setNeetCourse] = useState<NeetCourse>("MBBS");
  const [neetMarks, setNeetMarks] = useState("");
  const [neetAir, setNeetAir] = useState("");
  const [neetPercentile, setNeetPercentile] = useState("");
  const [neetCatRank, setNeetCatRank] = useState("");

  // JEE Specific Fields
  const [jeeExamType, setJeeExamType] = useState<JeeExamType>("jee main");
  const [shiftSession, setShiftSession] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [shift, setShift] = useState("");
  const [jeePercentile, setJeePercentile] = useState("");
  const [jeeMarks, setJeeMarks] = useState("");
  const [jeeCrl, setJeeCrl] = useState("");

  const reset = () => {
    setStep(1);
    setName("");
    setYear(2026);
    setGender(null);
    setState(""); setStateQuery(""); setStateOpen(false);
    setCategory("OPEN");
    setResultOut(null);
    setErrors({});

    setNeetCourse("MBBS");
    setNeetMarks(""); setNeetAir(""); setNeetPercentile(""); setNeetCatRank("");

    setJeeExamType("jee main");
    setShiftSession(""); setShiftDate(""); setShift("");
    setJeePercentile(""); setJeeMarks(""); setJeeCrl("");
  };

  const close = () => { reset(); onClose(); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") close(); 
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const yearShifts = jeeExamType === "jee main" ? JEE_MAIN_SHIFTS[year] : undefined;
  const sessionOptions = yearShifts ? Object.keys(yearShifts) : [];
  const dateOptions = yearShifts && shiftSession && yearShifts[shiftSession]
    ? Object.keys(yearShifts[shiftSession]) : [];
  const shiftOptions = yearShifts && shiftSession && shiftDate && yearShifts[shiftSession]?.[shiftDate]
    ? yearShifts[shiftSession][shiftDate] : [];

  const goStep = (n: number) => {
    setFading(true);
    setTimeout(() => { setStep(n); setFading(false); }, 140);
  };

  const filteredStates = STATES.filter((s) =>
    s.toLowerCase().includes(stateQuery.toLowerCase())
  );

  const resolvedState = state || STATES.find((s) => s.toLowerCase() === stateQuery.trim().toLowerCase()) || "";

  // Step 1 Validation
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Please enter candidate full name";
    if (!isNeet && !jeeExamType) e.jeeExamType = "Please select JEE examination stream";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (resultOut === null) {
      e.resultOut = isNeet
        ? "Please select if official NTA NEET result is declared"
        : "Please select if official NTA JEE result is declared";
    }

    if (isNeet) {
      if (resultOut === true) {
        if (!neetAir && !neetMarks) e.neetScores = "Please enter either All India Rank (AIR) or Total Marks";
      } else if (resultOut === false) {
        if (!neetMarks) e.neetMarks = "Please enter your expected NEET score (out of 720)";
      }

      if (neetMarks) {
        const v = parseFloat(neetMarks);
        if (isNaN(v) || v < 0 || v > 720) e.neetMarks = "Score must be between 0 and 720";
      }
      if (!gender) e.gender = "Please select candidate gender";
    } else {
      if (resultOut === true) {
        if (!jeeCrl && !jeePercentile) e.scores = "Please enter your CRL Rank or NTA Percentile";
      } else if (resultOut === false) {
        if (!jeeMarks) e.scores = "Please enter your expected raw score";
      } else {
        const anyScore = jeePercentile || jeeMarks || jeeCrl;
        if (!anyScore) e.scores = "Please fill at least one score field";
      }
      if (!gender) e.gender = "Please select a gender";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!resolvedState) {
      e.state = isNeet
        ? "Please select Domicile State (Required for 85% State Quota counselling)"
        : "Please select State of Education / Domicile";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onNext = () => {
    if (step === 1 && validateStep1()) goStep(2);
    else if (step === 2 && validateStep2()) goStep(3);
  };

  const onPredict = () => {
    if (!validateStep3()) return;

    if (isNeet) {
      const numMarks = neetMarks ? parseFloat(neetMarks) : null;
      const numAir = neetAir ? parseInt(neetAir, 10) : (numMarks ? marksToEstimatedNeetRank(numMarks) : 2500);

      const neetMatches = predictNeetColleges({
        name: name.trim() || "Doctor Aspirant",
        year,
        marks: numMarks,
        air: numAir,
        percentile: neetPercentile ? parseFloat(neetPercentile) : 99.2,
        category: category.replace(" (PwD)", "") as any,
        domicileState: resolvedState,
        coursePreference: neetCourse,
      });

      const parsedReport: ParsedReport = {
        student: {
          name: name.trim() || "Candidate",
          examType: "NEET UG",
          yearOfData: String(year),
          percentile: neetPercentile ? parseFloat(neetPercentile) : 99.2,
          category,
          categoryRank: numAir,
          session: "MCC AIQ & State Quota",
          shift: `${neetMarks || "720"} Marks / 720`,
        },
        colleges: neetMatches.map((m) => ({
          collegeName: m.college.name,
          website: m.college.website,
          programs: [
            {
              program: `${m.matchedProgram.course} (${m.matchedProgram.quota})`,
              category,
              quota: m.matchedProgram.quota,
              genderPool: gender === "FEMALE" ? "Female Only" : "Gender Neutral",
              openingRank: m.matchedProgram.openingRank,
              closingRank: m.closingRank,
              yourRank: m.userRank,
              chancePercent: m.chancePercent,
              chanceLabel: m.chanceTier,
            },
          ],
        })),
        isNeet: true,
        neetResults: neetMatches,
      };

      clearReport();
      setReport(parsedReport);
      close();
      navigate({ to: "/processing" });
      return;
    }

    // Pure JEE flow
    const data = {
      exam_type: jeeExamType,
      name: name.trim(),
      year,
      exam_shift: jeeExamType === "jee main" && shiftSession && shiftDate && shift
        ? { session: shiftSession, date: shiftDate, shift }
        : null,
      percentile: jeePercentile ? parseFloat(jeePercentile) : null,
      marks: jeeMarks ? parseFloat(jeeMarks) : null,
      crl_rank: jeeCrl ? parseInt(jeeCrl, 10) : null,
      result_out: resultOut,
      category_and_rank: { [category]: jeeCrl ? parseInt(jeeCrl, 10) : 12000 },
      category_only: category,
      gender,
      state: resolvedState,
    };

    clearReport();
    setPendingPredictPayload(data);
    close();
    navigate({ to: "/processing" });
  };

  const estimatedNeetRank = neetMarks ? marksToEstimatedNeetRank(parseFloat(neetMarks)) : null;

  if (!open) return null;

  const accentColor = isNeet ? "#10b981" : "#3b82f6";
  const accentGlow = isNeet ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.2)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: isDark ? "rgba(4, 6, 12, 0.85)" : "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(24px) saturate(190%)",
        WebkitBackdropFilter: "blur(24px) saturate(190%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fade-in 0.2s ease-out",
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[680px] max-h-[92vh] rounded-3xl border border-neutral-200 dark:border-white/12 bg-white/95 dark:bg-[#0c0e14]/95 text-neutral-900 dark:text-neutral-100 shadow-[0_30px_100px_rgba(0,0,0,0.5)] dark:shadow-[0_35px_120px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative"
        style={{
          animation: "scale-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Modal Top Subtle Light Rim */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-24 rounded-full blur-2xl opacity-40 dark:opacity-30"
          style={{ background: accentColor }}
        />

        {/* ─── MODAL HEADER ─── */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div
              className="size-9 rounded-xl flex items-center justify-center text-lg border shadow-2xs"
              style={{
                borderColor: `${accentColor}40`,
                background: `${accentColor}15`,
                color: accentColor,
              }}
            >
              {isNeet ? "🩺" : "⚛"}
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
                {isNeet ? "MCC NEET-UG 2026 ADMISSION ENGINE" : "JoSAA 2026 JEE ADMISSION ENGINE"}
              </div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-white">
                Candidate Prediction Dossier
              </h3>
            </div>
          </div>

          {/* Clean Segmented Step Indicator */}
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10.5px]">
            {[
              { num: 1, label: "Profile" },
              { num: 2, label: "Scores" },
              { num: 3, label: "Matrix" },
            ].map((st) => {
              const active = step >= st.num;
              const isCurrent = step === st.num;
              return (
                <span
                  key={st.num}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    isCurrent
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold shadow-2xs"
                      : active
                      ? "text-neutral-800 dark:text-neutral-200 font-semibold bg-neutral-200/50 dark:bg-white/10"
                      : "text-neutral-400 dark:text-neutral-600"
                  }`}
                >
                  0{st.num} {st.label}
                </span>
              );
            })}
          </div>

          <button
            onClick={close}
            aria-label="Close modal"
            className="size-8 rounded-full border border-neutral-200 dark:border-white/10 bg-transparent hover:bg-neutral-200/60 dark:hover:bg-white/10 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ─── MODAL BODY (STEPPED) ─── */}
        <div
          className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6"
          style={{
            opacity: fading ? 0 : 1,
            transform: fading ? "translateY(6px)" : "translateY(0)",
            transition: "opacity 0.14s ease, transform 0.14s ease",
          }}
        >
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STEP 1: CANDIDATE INFO & TARGET PROGRAM */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <>
              {isNeet ? (
                /* PURE NEET STEP 1 */
                <div className="space-y-5">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                      Select Target Medical Discipline
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "MBBS" as NeetCourse, title: "MBBS", sub: "Allopathy & Surgery (5.5 Yrs)" },
                        { id: "BDS" as NeetCourse, title: "BDS", sub: "Dental Surgery (5 Yrs)" },
                        { id: "BAMS" as NeetCourse, title: "BAMS", sub: "Ayurvedic Medicine (5.5 Yrs)" },
                      ].map((crs) => {
                        const active = neetCourse === crs.id;
                        return (
                          <button
                            key={crs.id}
                            type="button"
                            onClick={() => setNeetCourse(crs.id)}
                            className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                              active
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.18)]"
                                : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                            }`}
                          >
                            <div className="font-mono text-sm font-bold">{crs.title}</div>
                            <div className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 mt-1 leading-tight">
                              {crs.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                      Candidate Full Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium transition"
                      maxLength={100}
                    />
                    {errors.name && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.name}</div>}
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                      Admission Academic Cycle
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value, 10))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
                    >
                      {YEARS.map((y) => <option key={y} value={y}>{y} Admission Counselling Cycle</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                /* PURE JEE STEP 1 */
                <div className="space-y-5">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                      Engineering Examination Stream
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v: "jee main" as JeeExamType, title: "JEE MAIN", sub: "NITs · IIITs · GFTIs" },
                        { v: "jee advanced" as JeeExamType, title: "JEE ADVANCED", sub: "IITs Only (23 Campuses)" },
                      ].map((c) => {
                        const active = jeeExamType === c.v;
                        return (
                          <button
                            key={c.title}
                            type="button"
                            onClick={() => setJeeExamType(c.v)}
                            className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                              active
                                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.18)]"
                                : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                            }`}
                          >
                            <div className="font-mono text-sm font-bold">{c.title}</div>
                            <div className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                              {c.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                      Candidate Full Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium transition"
                      maxLength={100}
                    />
                    {errors.name && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.name}</div>}
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                      JoSAA Counselling Academic Cycle
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value, 10))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:border-blue-500 transition"
                    >
                      {YEARS.map((y) => <option key={y} value={y}>{y} Admission Cycle</option>)}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STEP 2: SCORES & CALIBRATION */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <>
              {isNeet ? (
                /* PURE NEET STEP 2 */
                <div className="space-y-5">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                      Is Your Official NTA NEET Scorecard Declared?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v: true, label: "YES, RESULT DECLARED" },
                        { v: false, label: "NO, EXPECTED SCORE ONLY" },
                      ].map((o) => {
                        const active = resultOut === o.v;
                        return (
                          <button
                            key={o.label}
                            type="button"
                            onClick={() => setResultOut(o.v)}
                            className={`py-3 px-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                              active
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.18)]"
                                : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                            }`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.resultOut && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.resultOut}</div>}
                  </div>

                  {/* If Result is Out -> AIR and Cat Rank */}
                  {resultOut === true && (
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                      <div>
                        <label className="block font-mono text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                          All India Rank (AIR CRL)
                        </label>
                        <input
                          value={neetAir}
                          onChange={(e) => setNeetAir(e.target.value.replace(/[^\d]/g, ""))}
                          placeholder="e.g. 1420"
                          className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10.5px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          Category Rank (Optional)
                        </label>
                        <input
                          value={neetCatRank}
                          onChange={(e) => setNeetCatRank(e.target.value.replace(/[^\d]/g, ""))}
                          placeholder="e.g. 350"
                          className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Total Marks Out of 720 */}
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                      Total NEET Marks (Out of 720)
                    </label>
                    <div className="relative">
                      <input
                        value={neetMarks}
                        onChange={(e) => setNeetMarks(e.target.value)}
                        placeholder="e.g. 685"
                        inputMode="decimal"
                        className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-400">
                        / 720
                      </span>
                    </div>

                    {estimatedNeetRank && (
                      <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        <span>◆ Calibrated AIR Projection:</span>
                        <strong className="font-bold">~AIR {estimatedNeetRank.toLocaleString()}</strong>
                      </div>
                    )}
                    {errors.neetMarks && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.neetMarks}</div>}
                    {errors.neetScores && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.neetScores}</div>}
                  </div>

                  {/* Reservation Category */}
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                      Reservation Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-500 transition"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Gender Pool */}
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                      Candidate Gender Seat Pool
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["GENDER NEUTRAL", "FEMALE"] as const).map((g) => {
                        const active = gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`py-3 px-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                              active
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.18)]"
                                : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                            }`}
                          >
                            {g === "FEMALE" ? "Female (Includes LHMC Delhi Seats)" : "Gender Neutral"}
                          </button>
                        );
                      })}
                    </div>
                    {errors.gender && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.gender}</div>}
                  </div>
                </div>
              ) : (
                /* PURE JEE STEP 2 */
                <div className="space-y-5">
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                      Is Your Official NTA Scorecard / CRL Rank Declared?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v: true, label: "YES, RESULT DECLARED" },
                        { v: false, label: "NO, EXPECTED RAW SCORE" },
                      ].map((o) => {
                        const active = resultOut === o.v;
                        return (
                          <button
                            key={o.label}
                            type="button"
                            onClick={() => setResultOut(o.v)}
                            className={`py-3 px-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                              active
                                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.18)]"
                                : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                            }`}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.resultOut && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.resultOut}</div>}
                  </div>

                  {/* If Result Declared -> Rank & Percentile */}
                  {resultOut === true && (
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                      <div>
                        <label className="block font-mono text-[10.5px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">
                          All India CRL Rank
                        </label>
                        <input
                          value={jeeCrl}
                          onChange={(e) => setJeeCrl(e.target.value.replace(/[^\d]/g, ""))}
                          placeholder="e.g. 5420"
                          className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10.5px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                          NTA Percentile (0–100)
                        </label>
                        <input
                          value={jeePercentile}
                          onChange={(e) => setJeePercentile(e.target.value)}
                          placeholder="e.g. 98.65"
                          className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* If Expected Score / Exam Shift */}
                  {resultOut === false && (
                    <div className="space-y-4">
                      {jeeExamType === "jee main" ? (
                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02] space-y-3">
                          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-semibold">
                            Exam Shift Details ({year})
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">Session</label>
                              <select
                                value={shiftSession}
                                onChange={(e) => { setShiftSession(e.target.value); setShiftDate(""); setShift(""); }}
                                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-xs font-medium"
                              >
                                <option value="">Select session</option>
                                {sessionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">Exam Date</label>
                              <select
                                value={shiftDate}
                                onChange={(e) => { setShiftDate(e.target.value); setShift(""); }}
                                disabled={!shiftSession}
                                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-xs font-medium disabled:opacity-50"
                              >
                                <option value="">{shiftSession ? "Select date" : "Session first"}</option>
                                {dateOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block font-mono text-[10px] text-neutral-500 uppercase mb-1">Shift</label>
                              <select
                                value={shift}
                                onChange={(e) => setShift(e.target.value)}
                                disabled={!shiftDate}
                                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-xs font-medium disabled:opacity-50"
                              >
                                <option value="">{shiftDate ? "Select shift" : "Date first"}</option>
                                {shiftOptions.map((s, i) => (
                                  <option key={i} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                              Expected Raw Marks (0–300)
                            </label>
                            <input
                              value={jeeMarks}
                              onChange={(e) => setJeeMarks(e.target.value)}
                              placeholder="e.g. 195"
                              className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-blue-600 dark:text-blue-400 font-mono text-base font-bold focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                            Expected JEE Advanced Raw Marks (0–360)
                          </label>
                          <input
                            value={jeeMarks}
                            onChange={(e) => setJeeMarks(e.target.value)}
                            placeholder="e.g. 180"
                            className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-blue-600 dark:text-blue-400 font-mono text-base font-bold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}
                      {errors.scores && <div className="font-mono text-[11px] text-red-500 mt-1">{errors.scores}</div>}
                    </div>
                  )}

                  {/* Reservation Category */}
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                      Reservation Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:border-blue-500 transition"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Gender Pool */}
                  <div>
                    <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                      Candidate Gender Seat Pool
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["GENDER NEUTRAL", "FEMALE"] as const).map((g) => {
                        const active = gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`py-3 px-3 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
                              active
                                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.18)]"
                                : "border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400"
                            }`}
                          >
                            {g === "FEMALE" ? "Female Supernumerary Quota" : "Gender Neutral"}
                          </button>
                        );
                      })}
                    </div>
                    {errors.gender && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.gender}</div>}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* STEP 3: DOMICILE & CANDIDATE DOSSIER AUDIT */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="relative">
                <label className="block font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  {isNeet ? "Domicile State (Required for 85% State Quota Seats)" : "State of Schooling / Domicile"}
                </label>
                <input
                  value={stateOpen ? stateQuery : state}
                  onChange={(e) => { setStateQuery(e.target.value); setStateOpen(true); }}
                  onFocus={() => { setStateOpen(true); setStateQuery(""); }}
                  onBlur={() => setTimeout(() => setStateOpen(false), 180)}
                  placeholder="Search state (e.g. Delhi, Maharashtra, Uttar Pradesh, Karnataka)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-white/15 bg-white dark:bg-[#131620] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-blue-500 text-sm font-medium transition"
                />
                {stateOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 max-h-48 overflow-y-auto bg-white dark:bg-[#11141c] border border-neutral-300 dark:border-white/15 rounded-xl mt-1.5 shadow-xl">
                    {filteredStates.map((s) => (
                      <div
                        key={s}
                        onMouseDown={() => { setState(s); setStateOpen(false); setStateQuery(""); }}
                        className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
                {errors.state && <div className="font-mono text-[11px] text-red-500 mt-1.5">{errors.state}</div>}
              </div>

              {isNeet && (
                <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-xs font-mono space-y-1.5">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    ◆ ACTIVE COUNSELLING RADAR QUOTAS:
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11.5px]">
                    ✓ 15% All India Quota (MCC) across 350+ Central Medical Colleges<br />
                    ✓ 85% State Quota in {resolvedState || "your selected Domicile State"}<br />
                    ✓ 100% Apex Institutions (AIIMS, JIPMER, AMU, BHU)
                  </div>
                </div>
              )}

              {/* Executive Summary Card */}
              <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/80 dark:bg-[#11141c]/90 p-5 font-mono text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200 dark:border-white/10">
                  <span className="text-neutral-500 uppercase tracking-wider">EXAMINATION ENGINE</span>
                  <strong className="font-bold" style={{ color: accentColor }}>
                    {isNeet ? "MCC NEET-UG MEDICAL" : "JoSAA JEE ENGINEERING"}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">CANDIDATE:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{name || "—"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">SCORE / MARKS:</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {isNeet ? (neetMarks ? `${neetMarks} / 720` : "—") : (jeeMarks ? `${jeeMarks} Marks` : "—")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">ALL INDIA RANK (AIR):</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {isNeet 
                      ? (neetAir ? `#${neetAir}` : estimatedNeetRank ? `~AIR ${estimatedNeetRank.toLocaleString()}` : "—") 
                      : (jeeCrl ? `#${jeeCrl}` : "—")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-neutral-500">CATEGORY & GENDER:</span>
                  <span>{category} · {gender === "FEMALE" ? "Female" : "Gender Neutral"}</span>
                </div>

                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-white/10">
                  <span className="text-neutral-500">DOMICILE STATE:</span>
                  <strong className="text-neutral-900 dark:text-white">{resolvedState || "—"}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── MODAL FOOTER ─── */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-neutral-200 dark:border-white/10 bg-neutral-50/60 dark:bg-white/[0.02]">
          {step > 1 ? (
            <button
              onClick={() => goStep(step - 1)}
              className="px-5 py-2 rounded-xl border border-neutral-300 dark:border-white/15 bg-transparent text-neutral-700 dark:text-neutral-300 font-mono text-xs font-semibold hover:bg-neutral-200/50 dark:hover:bg-white/10 transition cursor-pointer"
            >
              ← BACK
            </button>
          ) : <span />}

          {step < 3 ? (
            <button
              onClick={onNext}
              className="px-6 py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition cursor-pointer"
            >
              CONTINUE →
            </button>
          ) : (
            <button
              onClick={onPredict}
              className="px-6 py-2.5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-md transition cursor-pointer"
            >
              {isNeet ? "COMPILE MEDICAL DOSSIER →" : "COMPILE ADMISSION DOSSIER →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
