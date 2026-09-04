import { type MentorProfile } from "@/data/mentors";

export function MentorCard({
  index,
  mentor,
  matchPercentage = 92,
  reasons = [],
  onAskForFree,
  onViewProfile,
}: {
  index: number;
  mentor: MentorProfile;
  matchPercentage?: number;
  reasons?: string[];
  onAskForFree: (mentor: MentorProfile) => void;
  onViewProfile: (mentor: MentorProfile) => void;
}) {
  const displayReasons = reasons.length > 0 ? reasons.slice(0, 3) : mentor.highlightMatchReasons.slice(0, 3);

  return (
    <div
      onClick={() => onViewProfile(mentor)}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/60 shadow-xs cursor-pointer"
    >
      {/* Top Row: Index + Match Badge + Demo Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="mono text-[11px] font-bold text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {matchPercentage}% MATCH
            </span>
          </div>

          <span className="mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-semibold">
            {mentor.simulatedBadge}
          </span>
        </div>

        {/* Mentor Identity */}
        <div className="mt-3.5 flex items-start gap-3.5">
          <img
            src={mentor.avatarUrl}
            alt={mentor.name}
            className="size-12 rounded-full border-2 border-border object-cover shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-blue-500 transition-colors">
              {mentor.name}
            </h3>
            <p className="text-xs text-muted-foreground font-sans truncate">
              {mentor.currentRole}
            </p>
            <p className="mono text-[10px] text-muted-foreground/80 mt-0.5">
              {mentor.collegeName} · {mentor.branch}
            </p>
          </div>
        </div>

        {/* Why This Match */}
        <div className="mt-3.5 rounded-xl bg-muted/40 p-3 space-y-1 text-[11px] font-sans">
          <span className="mono text-[9px] uppercase tracking-wider text-muted-foreground block font-bold mb-1">
            Why This Match:
          </span>
          {displayReasons.map((r, i) => (
            <div key={i} className="text-foreground/90 flex items-start gap-1.5 leading-snug">
              <span className="text-emerald-500 text-xs">✓</span>
              <span>{r.replace(/^✓\s*/, "")}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
          {mentor.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="mono text-[9px] px-2 py-0.5 rounded bg-background border border-border text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="mt-4 pt-3.5 border-t border-border/60">
        <div className="flex items-center justify-between text-xs font-mono mb-3">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <span>★ {mentor.rating.toFixed(2)}</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              ({mentor.sessionsCount} helped)
            </span>
          </div>

          <div className="text-right">
            <span className="font-black text-foreground text-xs">
              ₹{mentor.priceRange.min}–₹{mentor.priceRange.max}
            </span>
            <span className="text-[9px] text-muted-foreground block">
              ~{mentor.avgResponseMinutes}m reply time
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAskForFree(mentor);
            }}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-mono text-[11px] font-bold py-2 text-center transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Ask Free</span>
            <span>→</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile(mentor);
            }}
            className="rounded-lg border border-border/90 hover:border-neutral-400 dark:hover:border-neutral-600 bg-background text-foreground font-mono text-[10.5px] font-bold py-2 text-center transition hover:bg-muted/40 cursor-pointer"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
