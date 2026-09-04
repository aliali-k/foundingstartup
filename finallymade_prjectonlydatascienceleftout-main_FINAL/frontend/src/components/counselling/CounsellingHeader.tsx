import { Link } from "@tanstack/react-router";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { useExamMode } from "@/lib/exam-mode-context";

export function CounsellingHeader({
  activeSection = "seeker",
}: {
  activeSection?: "seeker" | "helper";
  subtitle?: string;
}) {
  const { isNeet } = useExamMode();

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md">
      {/* ── Top Header Bar ── */}
      <header className="border-b border-border/80">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Brand & Eyebrow */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <span
                className={`size-3.5 rotate-45 group-hover:scale-110 transition-transform shadow-xs ${
                  isNeet ? "bg-emerald-600" : "bg-blue-600"
                }`}
              />
              <span className="text-base font-black tracking-tight text-foreground font-mono">
                {isNeet ? "NEET-UG" : "JoSAA"}
              </span>
            </Link>
            <span className="text-border font-mono">|</span>
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 rounded border ${
                  isNeet
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20"
                }`}
              >
                {isNeet ? "✦ MEDICAL COUNSELLING" : "✦ COUNSELLING"}
              </span>
            </div>
          </div>

          {/* Center: Monospace Technical Eyebrow */}
          <div className="hidden md:block text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 font-medium">
              {isNeet
                ? "YOUR PERSONALISED CLINICAL & DOCTOR ADVISORY DESK"
                : "YOUR PERSONALISED 1-ON-1 GUIDANCE DESK"}
            </span>
          </div>

          {/* Right: Clean Theme Toggle only */}
          <div className="flex items-center gap-2.5">
            <ThemeSwitch />
          </div>
        </div>
      </header>

      {/* ── Mid Subheader: Centered Seeker / Helper Chooser ── */}
      <div className="border-b border-border/70 bg-muted/20 py-2.5 px-4">
        <div className="mx-auto max-w-7xl flex items-center justify-center">
          <div className="inline-flex items-center rounded-lg border border-border/90 bg-background p-1 text-xs font-mono shadow-2xs">
            <Link
              to="/counselling"
              className={`px-5 py-1.5 rounded-md transition-all text-xs font-bold ${
                activeSection === "seeker"
                  ? isNeet
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Seeker Flow
            </Link>
            <Link
              to="/helper"
              className={`px-5 py-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-bold ${
                activeSection === "helper"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Helper Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
