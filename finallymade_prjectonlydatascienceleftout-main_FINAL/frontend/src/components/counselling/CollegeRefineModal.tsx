import { useState } from "react";
import { callGeminiTask } from "@/lib/gemini-client";
import { COLLEGES } from "@/data/colleges";

interface RefinedCollegeItem {
  collegeName: string;
  fitScore: number;
  rationale: string;
  tradeOffs: string;
  questionsForSenior: string;
}

export function CollegeRefineModal({
  isOpen,
  onClose,
  initialColleges = ["NIT Kurukshetra", "PEC / NIT Chandigarh", "IIT Kanpur"],
  onSelectCollege,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialColleges?: string[];
  onSelectCollege: (collegeName: string) => void;
}) {
  const [collegesList, setCollegesList] = useState<string[]>(initialColleges);
  const [newCollegeInput, setNewCollegeInput] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("core engineering & placements");
  const [customPriority, setCustomPriority] = useState("");
  const [refinedResults, setRefinedResults] = useState<RefinedCollegeItem[] | null>(null);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const PRIORITY_OPTIONS = [
    "core engineering & placements",
    "software / IT opportunities & packages",
    "internship semester model",
    "campus life & hostel infrastructure",
    "higher studies & research reputation",
    "location & city proximity",
    "branch change ease",
  ];

  const handleAddCollege = () => {
    const val = newCollegeInput.trim();
    if (val && !collegesList.includes(val)) {
      setCollegesList([...collegesList, val]);
      setNewCollegeInput("");
    }
  };

  const handleRemoveCollege = (name: string) => {
    setCollegesList(collegesList.filter((c) => c !== name));
  };

  const runRefinement = async () => {
    setBusy(true);
    const priority = customPriority.trim() || selectedPriority;

    try {
      const res = await callGeminiTask("refine_colleges", {
        colleges: collegesList,
        priority,
      });

      if (res.data?.recommendedOrder) {
        setRefinedResults(res.data.recommendedOrder);
      }
      if (res.data?.synthesis) {
        setSynthesis(res.data.synthesis);
      }
    } catch (e) {
      console.error("Refine colleges failed:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="mono text-[10px] text-blue-500 uppercase tracking-[0.22em] font-bold">
              ◆ AI COLLEGE LIST REFINEMENT
            </div>
            <h2 className="text-xl font-black tracking-tight mt-1 text-foreground">
              Trade-off Analysis & Strategic Priority Ordering
            </h2>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg border border-border text-muted-foreground hover:text-foreground flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Current Colleges List */}
        <div>
          <label className="mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2 font-bold">
            Colleges Under Comparison ({collegesList.length})
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {collegesList.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCollege(c)}
                  className="text-muted-foreground hover:text-destructive text-xs ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Quick add custom college */}
          <div className="mt-3 flex gap-2">
            <input
              value={newCollegeInput}
              onChange={(e) => setNewCollegeInput(e.target.value)}
              placeholder="Add another college (e.g. NIT Trichy, IIT BHU, IIIT Hyderabad)..."
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddCollege}
              disabled={!newCollegeInput.trim()}
              className="rounded-lg border border-border bg-muted px-3 py-2 text-xs font-bold text-foreground hover:bg-border transition disabled:opacity-40"
            >
              + Add
            </button>
          </div>
        </div>

        {/* What Matters Most Selection */}
        <div>
          <label className="mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2 font-bold">
            What Matters Most to You?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedPriority(opt)}
                className={`mono text-[10.5px] px-3 py-1.5 rounded-full border transition-all ${
                  selectedPriority === opt
                    ? "bg-blue-600 border-blue-600 text-white font-bold"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-blue-500/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-2.5">
            <input
              value={customPriority}
              onChange={(e) => setCustomPriority(e.target.value)}
              placeholder="Or write custom goal (e.g. 'I want to switch from core to data science in 3rd year')..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={runRefinement}
          disabled={busy || collegesList.length === 0}
          className="w-full rounded-xl bg-blue-600 py-3 text-xs font-black uppercase tracking-[0.18em] text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {busy ? "Analyzing Trade-offs with Gemini…" : "Refine My List With Gemini →"}
        </button>

        {/* Results Stream */}
        {refinedResults && (
          <div className="mt-6 pt-4 border-t border-border space-y-4">
            {synthesis && (
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-xs leading-relaxed font-sans text-foreground">
                <span className="mono text-[10px] font-bold text-blue-500 uppercase block mb-1">
                  ◆ AI Synthesis
                </span>
                {synthesis}
              </div>
            )}

            <div className="space-y-3">
              {refinedResults.map((item, idx) => (
                <div
                  key={item.collegeName}
                  className="rounded-xl border border-border bg-card p-4 text-xs font-mono space-y-2 hover:border-blue-500/60 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="size-6 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-foreground font-sans">
                        {item.collegeName}
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {item.fitScore}% Fit
                    </span>
                  </div>

                  <p className="text-muted-foreground font-sans text-[11px] leading-relaxed">
                    <strong className="text-foreground">Why: </strong>
                    {item.rationale}
                  </p>

                  <p className="text-amber-600 dark:text-amber-400 font-sans text-[11px]">
                    <strong>Trade-offs: </strong>
                    {item.tradeOffs}
                  </p>

                  <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      <strong>Ask a senior: </strong>
                      "{item.questionsForSenior}"
                    </span>
                    <button
                      onClick={() => {
                        onSelectCollege(item.collegeName);
                        onClose();
                      }}
                      className="mono text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      Connect with {item.collegeName} Seniors →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
