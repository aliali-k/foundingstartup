import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { JEE_MAIN_SHIFTS } from "@/lib/jee-main-shifts";
import { setPendingPredictPayload, clearReport } from "@/lib/prediction-store";


type ExamType = "jee main" | "jee advanced" | null;
type Gender = "GENDER NEUTRAL" | "FEMALE" | null;

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

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

interface Props {
  open: boolean;
  onClose: () => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: "var(--muted-foreground)",
  marginBottom: 6,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--border-strong)",
  color: "var(--foreground)",
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  borderRadius: 4,
  outline: "none",
};

const monoNote: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.5px",
  color: "var(--muted-foreground)",
  marginTop: 8,
};

const errorStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.5px",
  color: "#ef4444",
  marginTop: 6,
};

export function PredictionModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fading, setFading] = useState(false);

  // Step 1
  const [examType, setExamType] = useState<ExamType>(null);
  const [name, setName] = useState("");
  const [year, setYear] = useState<number>(2026);

  // Step 2
  const [shiftSession, setShiftSession] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [shift, setShift] = useState("");
  const [percentile, setPercentile] = useState("");
  const [marks, setMarks] = useState("");
  const [crl, setCrl] = useState("");
  const [resultOut, setResultOut] = useState<boolean | null>(null);
  const [catRanks, setCatRanks] = useState<{ cat: string; rank: string }[]>([]);
  const [catDraft, setCatDraft] = useState("");
  const [catDraftRank, setCatDraftRank] = useState("");
  const [catOnly, setCatOnly] = useState("");
  const [gender, setGender] = useState<Gender>(null);


  // Step 3
  const [state, setState] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [stateOpen, setStateOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setStep(1);
    setExamType(null);
    setName("");
    setYear(2026);
    setShiftSession(""); setShiftDate(""); setShift("");
    setPercentile(""); setMarks(""); setCrl("");

    setResultOut(null);
    setCatRanks([]); setCatDraft(""); setCatDraftRank(""); setCatOnly("");
    setGender(null);
    setState(""); setStateQuery(""); setStateOpen(false);
    setErrors({});
  };

  const close = () => { reset(); onClose(); };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset shift selection when year or exam type changes
  useEffect(() => {
    setShiftSession(""); setShiftDate(""); setShift("");
  }, [year, examType]);

  // Derived shift options
  const yearShifts = examType === "jee main" ? JEE_MAIN_SHIFTS[year] : undefined;
  const sessionOptions = yearShifts ? Object.keys(yearShifts) : [];
  const dateOptions = yearShifts && shiftSession && yearShifts[shiftSession]
    ? Object.keys(yearShifts[shiftSession]) : [];
  const shiftOptions = yearShifts && shiftSession && shiftDate && yearShifts[shiftSession]?.[shiftDate]
    ? yearShifts[shiftSession][shiftDate] : [];



  if (!open) return null;

  const goStep = (n: number) => {
    setFading(true);
    setTimeout(() => { setStep(n); setFading(false); }, 150);
  };

  // Step 1 validation & next-enabled
  const step1Valid = !!examType && name.trim().length > 0;

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!examType) e.examType = "Please select an exam type";
    if (!name.trim()) e.name = "Please enter your name";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const anyScore = percentile || marks || crl;
  const step2HasScore = !!anyScore;

  const commitDraftCatRank = () => {
    if (catDraft && catDraftRank && !catRanks.some((c) => c.cat === catDraft)) {
      const next = [...catRanks, { cat: catDraft, rank: catDraftRank }];
      setCatRanks(next);
      setCatDraft("");
      setCatDraftRank("");
      return next;
    }
    return catRanks;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!step2HasScore) e.scores = "Please fill at least one score field to continue";
    if (percentile) {
      const v = parseFloat(percentile);
      if (isNaN(v) || v < 0 || v > 100) e.percentile = "Percentile must be 0–100";
    }
    if (marks) {
      const v = parseFloat(marks);
      const max = examType === "jee main" ? 300 : 360;
      if (isNaN(v) || v < 0 || v > max) e.marks = `Marks must be 0–${max}`;
    }
    if (crl) {
      if (!/^\d+$/.test(crl)) e.crl = "CRL must be a whole number";
    }
    if (!gender) e.gender = "Please select a gender";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const needsState = examType === "jee main";
  const resolvedState = state || STATES.find((s) => s.toLowerCase() === stateQuery.trim().toLowerCase()) || "";
  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (needsState && !resolvedState) {
      e.state = "Please select a state";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onNext = () => {
    if (step === 1 && validateStep1()) goStep(2);
    else if (step === 2) {
      commitDraftCatRank();
      if (validateStep2()) goStep(3);
    }
  };

const onPredict = async () => {
  if (!validateStep3()) return;
  const finalCatRanks = commitDraftCatRank();
  const hasAnyRank = !!crl || finalCatRanks.length > 0;
  const effectiveResultOut = resultOut === null ? (hasAnyRank ? true : null) : resultOut;
  const data = {
    exam_type: examType,
    name: name.trim(),
    year,
    exam_shift: examType === "jee main" && shiftSession && shiftDate && shift
      ? { session: shiftSession, date: shiftDate, shift }
      : null,
    percentile: percentile ? parseFloat(percentile) : null,
    marks: marks ? parseFloat(marks) : null,
    crl_rank: crl ? parseInt(crl, 10) : null,
    result_out: effectiveResultOut,
    category_and_rank: effectiveResultOut
      ? Object.fromEntries(finalCatRanks.map((c) => [c.cat, parseInt(c.rank, 10)]))
      : null,
    category_only: effectiveResultOut === false ? catOnly : null,
    gender,
    state: needsState ? resolvedState : null,
  };

    // We navigate to /processing immediately (so the solar system shows
    // instantly), and processing.tsx makes the actual /predict call itself.
    clearReport();
    setPendingPredictPayload(data);
    close();
    navigate({ to: "/processing" });
  };

  const addCatRank = () => {
    if (!catDraft || !catDraftRank) return;
    if (catRanks.some((c) => c.cat === catDraft)) return;
    setCatRanks([...catRanks, { cat: catDraft, rank: catDraftRank }]);
    setCatDraft(""); setCatDraftRank("");
  };

  const chooseResultOut = (value: boolean) => {
    setResultOut(value);
    setCatRanks([]);
    setCatDraft("");
    setCatDraftRank("");
    setCatOnly("");
  };

  const filteredStates = STATES.filter((s) =>
    s.toLowerCase().includes(stateQuery.toLowerCase())
  );

  const nextDisabled =
    (step === 1 && !step1Valid) ||
    (step === 2 && (!step2HasScore || !gender));

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, animation: "fade-in 0.2s ease-out",
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="prediction-modal"
        style={{
          width: "100%", maxWidth: 580, maxHeight: "85vh",
          background: "var(--card)",
          border: "1px solid var(--border-strong)",
          borderRadius: 8,
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          animation: "scale-in 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "2px", color: "var(--muted-foreground)" }}>
            STEP {step} / 3
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center", maxWidth: 200 }}>
            {[1, 2, 3].map((n, i) => (
              <div key={n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "0 0 auto" }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: step >= n ? "var(--accent)" : "transparent",
                  border: `1.5px solid ${step >= n ? "var(--accent)" : "var(--border-strong)"}`,
                  transition: "all 0.2s",
                }} />
                {i < 2 && (
                  <div style={{
                    flex: 1, height: 1, margin: "0 6px",
                    background: step > n ? "var(--accent)" : "var(--border-strong)",
                  }} />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={close}
            aria-label="Close"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--muted-foreground)", fontSize: 18, lineHeight: 1,
              padding: 4,
            }}
          >✕</button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 24, overflowY: "auto", flex: 1,
            opacity: fading ? 0 : 1,
            transform: fading ? "translateY(8px)" : "translateY(0)",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
        >
          {step === 1 && (
            <>
              <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 18, color: "var(--foreground)" }}>
                ◆ WHO ARE YOU?
              </h2>

              <label style={labelStyle}>Exam Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
                {([
                  { v: "jee main" as ExamType, title: "JEE MAIN", sub: "NITs · IIITs · GFTIs" },
                  { v: "jee advanced" as ExamType, title: "JEE ADVANCED", sub: "IITs" },
                ]).map((c) => {
                  const active = examType === c.v;
                  return (
                    <button
                      key={c.title}
                      onClick={() => setExamType(c.v)}
                      style={{
                        padding: "16px 12px", textAlign: "center", cursor: "pointer",
                        background: active ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--card)",
                        border: `1.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                        boxShadow: active ? "0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent)" : "none",
                        borderRadius: 6, transition: "all 0.18s",
                        color: "var(--foreground)",
                      }}
                    >
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "1.5px", fontWeight: 600 }}>{c.title}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "1px", color: "var(--muted-foreground)", marginTop: 6 }}>{c.sub}</div>
                    </button>
                  );
                })}
              </div>
              {errors.examType && <div style={errorStyle}>{errors.examType}</div>}

              <div style={{ marginTop: 18 }}>
                <label style={labelStyle}>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name..."
                  style={inputStyle}
                  maxLength={100}
                />
                {errors.name && <div style={errorStyle}>{errors.name}</div>}
              </div>

              <div style={{ marginTop: 18 }}>
                <label style={labelStyle}>Counselling Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  style={inputStyle}
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 18, color: "var(--foreground)" }}>
                ◆ YOUR SCORE & DETAILS
              </h2>

              {examType === "jee main" ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{
                    display: "grid", gap: 10, padding: 12,
                    border: "1px dashed var(--border-strong)", borderRadius: 6,
                  }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted-foreground)" }}>
                      Exam Shift ({year})
                    </div>
                    <div>
                      <label style={labelStyle}>Session</label>
                      <select
                        value={shiftSession}
                        onChange={(e) => { setShiftSession(e.target.value); setShiftDate(""); setShift(""); }}
                        style={inputStyle}
                      >
                        <option value="">Select session</option>
                        {sessionOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Exam Date</label>
                      <select
                        value={shiftDate}
                        onChange={(e) => { setShiftDate(e.target.value); setShift(""); }}
                        disabled={!shiftSession}
                        style={{ ...inputStyle, opacity: shiftSession ? 1 : 0.6 }}
                      >
                        <option value="">{shiftSession ? "Select date" : "Select session first"}</option>
                        {dateOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Shift</label>
                      <select
                        value={shift}
                        onChange={(e) => setShift(e.target.value)}
                        disabled={!shiftDate}
                        style={{ ...inputStyle, opacity: shiftDate ? 1 : 0.6 }}
                      >
                        <option value="">{shiftDate ? "Select shift" : "Select date first"}</option>
                        {shiftOptions.map((s, i) => {
                          const label = s === "Morning Shift" ? "Shift 1 — Morning" :
                                        s === "Evening Shift" ? "Shift 2 — Evening" : s;
                          return <option key={i} value={s}>{label}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Percentile</label>
                    <input value={percentile} onChange={(e) => setPercentile(e.target.value)} placeholder="Enter percentile (0–100)" inputMode="decimal" style={inputStyle} />
                    {errors.percentile && <div style={errorStyle}>{errors.percentile}</div>}
                  </div>

                  <div>
                    <label style={labelStyle}>Marks</label>
                    <input value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="Enter marks (0–300)" inputMode="decimal" style={inputStyle} />
                    {errors.marks && <div style={errorStyle}>{errors.marks}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>CRL Rank</label>
                    <input value={crl} onChange={(e) => setCrl(e.target.value.replace(/[^\d]/g, ""))} placeholder="Enter your CRL rank" inputMode="numeric" style={inputStyle} />
                    {errors.crl && <div style={errorStyle}>{errors.crl}</div>}
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Marks</label>
                    <input value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="Enter marks (0–360)" inputMode="decimal" style={inputStyle} />
                    {errors.marks && <div style={errorStyle}>{errors.marks}</div>}
                  </div>
                  <div>
                    <label style={labelStyle}>CRL Rank</label>
                    <input value={crl} onChange={(e) => setCrl(e.target.value.replace(/[^\d]/g, ""))} placeholder="Enter your CRL rank" inputMode="numeric" style={inputStyle} />
                    {errors.crl && <div style={errorStyle}>{errors.crl}</div>}
                  </div>
                </div>
              )}
              <div style={monoNote}>ℹ️ Fill whichever you have — at least one required</div>
              {errors.scores && <div style={errorStyle}>{errors.scores}</div>}

              <div style={{ marginTop: 22 }}>
                <label style={labelStyle}>Result Out?</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {([
                    { v: true, label: "YES, RESULT OUT" },
                    { v: false, label: "NO, NOT YET" },
                  ] as const).map((o) => {
                    const active = resultOut === o.v;
                    return (
                      <button
                        key={o.label}
                         onClick={() => chooseResultOut(o.v)}
                        style={{
                          padding: "12px", cursor: "pointer",
                          background: active ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--card)",
                          border: `1.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                          borderRadius: 6,
                          fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1px",
                          color: "var(--foreground)",
                        }}
                      >{o.label}</button>
                    );
                  })}
                </div>
                {errors.resultOut && <div style={errorStyle}>{errors.resultOut}</div>}
              </div>

              {resultOut === true && (
                <div style={{ marginTop: 18 }}>
                  <label style={labelStyle}>Categories & Ranks</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8 }}>
                    <select value={catDraft} onChange={(e) => setCatDraft(e.target.value)} style={inputStyle}>
                      <option value="">Select category</option>
                      {CATEGORIES.filter(c => !catRanks.some(r => r.cat === c)).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                      value={catDraftRank}
                      onChange={(e) => setCatDraftRank(e.target.value.replace(/[^\d]/g, ""))}
                      placeholder="Enter rank for this category"
                      disabled={!catDraft}
                      style={{ ...inputStyle, opacity: catDraft ? 1 : 0.6 }}
                    />
                    <button
                      onClick={addCatRank}
                      disabled={!catDraft || !catDraftRank}
                      style={{
                        padding: "0 14px", borderRadius: 6, cursor: catDraft && catDraftRank ? "pointer" : "not-allowed",
                        background: "var(--accent)", color: "var(--background)", border: "none",
                        fontFamily: "var(--font-mono)", fontSize: 12, opacity: catDraft && catDraftRank ? 1 : 0.5,
                      }}
                    >+ Add</button>
                  </div>
                  {catRanks.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {catRanks.map((r) => (
                        <span key={r.cat} style={{
                          padding: "4px 10px", borderRadius: 999,
                          border: "1px solid var(--accent)",
                          background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                          fontFamily: "var(--font-mono)", fontSize: 11,
                          color: "var(--foreground)",
                          display: "inline-flex", alignItems: "center", gap: 6,
                        }}>
                          {r.cat} : {r.rank}
                          <button
                            onClick={() => setCatRanks(catRanks.filter(c => c.cat !== r.cat))}
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-foreground)", padding: 0, fontSize: 12 }}
                          >✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                  {errors.cats && <div style={errorStyle}>{errors.cats}</div>}
                </div>
              )}

              {resultOut === false && (
                <div style={{ marginTop: 18 }}>
                  <label style={labelStyle}>Category</label>
                  <select value={catOnly} onChange={(e) => setCatOnly(e.target.value)} style={inputStyle}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.catOnly && <div style={errorStyle}>{errors.catOnly}</div>}
                </div>
              )}

              <div style={{ marginTop: 22 }}>
                <label style={labelStyle}>Gender</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(["GENDER NEUTRAL", "FEMALE"] as const).map((g) => {
                    const active = gender === g;
                    return (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        style={{
                          padding: "12px", cursor: "pointer",
                          background: active ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "var(--card)",
                          border: `1.5px solid ${active ? "var(--accent)" : "var(--border-strong)"}`,
                          borderRadius: 6,
                          fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1.5px",
                          color: "var(--foreground)",
                        }}
                      >{g}</button>
                    );
                  })}
                </div>
                <div style={monoNote}>ℹ️ Female candidates are evaluated against both Gender-Neutral and Female quota seats</div>
                {errors.gender && <div style={errorStyle}>{errors.gender}</div>}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ fontFamily: "var(--font-mono)", fontSize: 14, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 18, color: "var(--foreground)" }}>
                ◆ LOCATION & CONFIRM
              </h2>

              {needsState && (
                <div style={{ marginBottom: 18, position: "relative" }}>
                  <label style={labelStyle}>State of Education</label>
                  <input
                    value={stateOpen ? stateQuery : state}
                    onChange={(e) => { setStateQuery(e.target.value); setStateOpen(true); }}
                    onFocus={() => { setStateOpen(true); setStateQuery(""); }}
                    onBlur={() => setTimeout(() => setStateOpen(false), 150)}
                    placeholder="Type to search state..."
                    style={inputStyle}
                  />
                  {stateOpen && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                      maxHeight: 200, overflowY: "auto",
                      background: "var(--card)", border: "1px solid var(--border-strong)",
                      borderRadius: 4, marginTop: 4,
                    }}>
                      {filteredStates.length === 0 && (
                        <div style={{ padding: 10, fontSize: 12, color: "var(--muted-foreground)" }}>No matches</div>
                      )}
                      {filteredStates.map((s) => (
                        <div
                          key={s}
                          onMouseDown={() => { setState(s); setStateOpen(false); setStateQuery(""); }}
                          style={{
                            padding: "8px 12px", cursor: "pointer", fontSize: 13,
                            color: "var(--foreground)",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >{s}</div>
                      ))}
                    </div>
                  )}
                  {errors.state && <div style={errorStyle}>{errors.state}</div>}
                </div>
              )}

              <div style={{
                border: "1px solid var(--border-strong)",
                borderRadius: 6, padding: 16,
                fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.9,
                background: "var(--muted)",
                color: "var(--foreground)",
              }}>
                <SummaryRow k="EXAM TYPE" v={examType === "jee main" ? "JEE Main" : examType === "jee advanced" ? "JEE Advanced" : "—"} />
                <SummaryRow k="NAME" v={name || "—"} />
                <SummaryRow k="YEAR" v={String(year)} />
                {examType === "jee main" && (
                  <SummaryRow k="EXAM SHIFT" v={
                    shiftSession && shiftDate && shift
                      ? `${shiftSession} • ${shiftDate} • ${shift === "Morning Shift" ? "Shift 1 Morning" : shift === "Evening Shift" ? "Shift 2 Evening" : shift}`
                      : "—"
                  } />
                )}
                {examType === "jee main" && <SummaryRow k="PERCENTILE" v={percentile || "—"} />}

                <SummaryRow k="MARKS" v={marks || "—"} />
                <SummaryRow k="CRL RANK" v={crl || "—"} />
                <SummaryRow k="RESULT OUT" v={resultOut === null ? "—" : resultOut ? "Yes" : "No"} />
                <SummaryRow k="CATEGORIES" v={
                  resultOut
                    ? (catRanks.length ? catRanks.map(c => `${c.cat} → ${c.rank}`).join(" | ") : "—")
                    : (catOnly || "—")
                } />
                <SummaryRow k="GENDER" v={gender === "GENDER NEUTRAL" ? "Gender Neutral" : gender === "FEMALE" ? "Female" : "—"} />
                {needsState && <SummaryRow k="STATE" v={resolvedState || "—"} />}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
        }}>
          {step > 1 ? (
            <button
              onClick={() => goStep(step - 1)}
              style={{
                background: "transparent", border: "1px solid var(--border-strong)",
                padding: "10px 16px", borderRadius: 4, cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1px",
                color: "var(--foreground)",
              }}
            >← {step === 3 ? "EDIT" : "BACK"}</button>
          ) : <span />}

          {step < 3 ? (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              style={{
                background: nextDisabled ? "var(--muted)" : "var(--accent)",
                color: nextDisabled ? "var(--muted-foreground)" : "var(--background)",
                border: "none", padding: "10px 22px", borderRadius: 4,
                cursor: nextDisabled ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1.5px",
              }}
            >NEXT →</button>
          ) : (
            <button
              onClick={onPredict}
              style={{
                background: "var(--accent)", color: "var(--background)",
                border: "none", padding: "10px 22px", borderRadius: 4, cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1.5px",
              }}
            >PREDICT NOW →</button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <span style={{ color: "var(--muted-foreground)", minWidth: 110 }}>{k.padEnd(11)}</span>
      <span>: {v}</span>
    </div>
  );
}
