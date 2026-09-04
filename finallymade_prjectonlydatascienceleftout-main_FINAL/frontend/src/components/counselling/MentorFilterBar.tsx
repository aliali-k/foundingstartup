import { useState } from "react";
import { callGeminiTask } from "@/lib/gemini-client";

export interface ActiveFilters {
  college?: string;
  branch?: string;
  maxPrice?: number;
  minRating?: number;
  nlExplanation?: string;
}

export function MentorFilterBar({
  filters,
  onChange,
}: {
  filters: ActiveFilters;
  onChange: (updated: ActiveFilters) => void;
}) {
  const [nlQuery, setNlQuery] = useState("");
  const [busy, setBusy] = useState(false);

  const handleNlSearch = async (queryText?: string) => {
    const q = (queryText || nlQuery).trim();
    if (!q || busy) return;

    setBusy(true);
    try {
      const res = await callGeminiTask("nl_filter", { query: q });
      if (res.data?.interpretedFilters) {
        const interp = res.data.interpretedFilters;
        onChange({
          ...filters,
          college: interp.college || undefined,
          branch: interp.branch || undefined,
          maxPrice: interp.maxPrice || undefined,
          minRating: interp.minRating || undefined,
          nlExplanation: res.data.explanation,
        });
      }
    } catch (e) {
      console.error("NL Filter error:", e);
    } finally {
      setBusy(false);
    }
  };

  const clearFilters = () => {
    setNlQuery("");
    onChange({});
  };

  const sampleQueries = [
    "Computer Science mentors from NIT Kurukshetra",
    "SDE-2 and above under ₹600",
    "Top rated mentors from Assam University",
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
      {/* Natural Language AI Search */}
      <div>
        <label className="mono text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1.5">
          ✦ Natural-Language AI Search (Interpreted by Gemini)
        </label>
        <div className="flex gap-2">
          <input
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNlSearch()}
            placeholder="e.g. 'Show mechanical mentors from NIT Kurukshetra under 500'..."
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-blue-500"
          />
          <button
            onClick={() => handleNlSearch()}
            disabled={busy || !nlQuery.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-40"
          >
            {busy ? "Parsing…" : "AI Filter →"}
          </button>
        </div>

        {/* Quick query chips */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="mono text-[9px] text-muted-foreground mr-1">Try:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setNlQuery(sq);
                handleNlSearch(sq);
              }}
              className="mono text-[9px] px-2 py-0.5 rounded border border-border/80 bg-muted/40 hover:border-blue-500 text-muted-foreground hover:text-foreground transition"
            >
              "{sq}"
            </button>
          ))}
        </div>
      </div>

      {/* Manual Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/60 text-xs font-mono">
        {/* College Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-[10px] uppercase">College:</span>
          <select
            value={filters.college || "ALL"}
            onChange={(e) => onChange({ ...filters, college: e.target.value === "ALL" ? undefined : e.target.value })}
            className="rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none"
          >
            <option value="ALL">All Colleges</option>
            <option value="NIT Kurukshetra">NIT Kurukshetra</option>
            <option value="PEC / NIT Chandigarh">PEC / NIT Chandigarh</option>
            <option value="Assam University">Assam University</option>
            <option value="IIT Kanpur">IIT Kanpur</option>
            <option value="IIT BHU Varanasi">IIT BHU Varanasi</option>
            <option value="NIT Trichy">NIT Trichy</option>
            <option value="NIT Warangal">NIT Warangal</option>
            <option value="IIT Hyderabad">IIT Hyderabad</option>
            <option value="IIIT Hyderabad">IIIT Hyderabad</option>
            <option value="AIIMS New Delhi">AIIMS New Delhi</option>
          </select>
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-[10px] uppercase">Branch:</span>
          <select
            value={filters.branch || "ALL"}
            onChange={(e) => onChange({ ...filters, branch: e.target.value === "ALL" ? undefined : e.target.value })}
            className="rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none"
          >
            <option value="ALL">All Branches</option>
            <option value="Mechanical">Mechanical Engineering</option>
            <option value="Computer">Computer Science / IT</option>
            <option value="Electrical">Electrical / Electronics</option>
            <option value="Medicine">MBBS / Clinical</option>
          </select>
        </div>

        {/* Max Price */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-[10px] uppercase">Max Price:</span>
          <select
            value={filters.maxPrice ? String(filters.maxPrice) : "ALL"}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value === "ALL" ? undefined : parseInt(e.target.value, 10) })}
            className="rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none"
          >
            <option value="ALL">Any Budget</option>
            <option value="350">Under ₹350</option>
            <option value="500">Under ₹500</option>
            <option value="700">Under ₹700</option>
          </select>
        </div>

        {(filters.college || filters.branch || filters.maxPrice || filters.minRating || filters.nlExplanation) && (
          <button
            onClick={clearFilters}
            className="ml-auto text-[10px] text-destructive hover:underline font-bold"
          >
            ✕ Reset Filters
          </button>
        )}
      </div>

      {filters.nlExplanation && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-mono">
          ✓ {filters.nlExplanation}
        </div>
      )}
    </div>
  );
}
