import { useEffect } from "react";
import { useExamMode } from "@/lib/exam-mode-context";
import { useTheme } from "./theme-provider";

export function FirstTimeStreamModal() {
  const { showStreamChooser, chooseStream, setShowStreamChooser } = useExamMode();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!showStreamChooser) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowStreamChooser(false);
      if (e.key === "1") chooseStream("jee");
      if (e.key === "2") chooseStream("neet");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showStreamChooser, setShowStreamChooser, chooseStream]);

  if (!showStreamChooser) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: isDark ? "rgba(4, 6, 11, 0.85)" : "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fade-in 0.22s ease-out",
      }}
      onClick={() => setShowStreamChooser(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[740px] rounded-3xl border border-white/10 dark:border-white/12 bg-white/95 dark:bg-[#0c0e14]/95 text-neutral-900 dark:text-neutral-100 p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.45)] dark:shadow-[0_35px_120px_rgba(0,0,0,0.85)] flex flex-col gap-8 relative overflow-hidden"
        style={{
          animation: "scale-in 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Subtle Ambient Radial Light */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 dark:opacity-20 blur-3xl bg-blue-500/40"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-30 dark:opacity-20 blur-3xl bg-emerald-500/30"
        />

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.2 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10.5px] font-semibold tracking-[0.2em] uppercase shadow-2xs">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>National Admission Intelligence 2026</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white mt-1 font-serif">
            Select Your Target Stream
          </h2>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
            Calibrate 10-year official cutoff trajectories, seat matrices, and state quota policies tailored to your entrance examination.
          </p>
        </div>

        {/* Dual Stream Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          {/* Card 1: JEE Engineering */}
          <button
            type="button"
            onClick={() => chooseStream("jee")}
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-gradient-to-b from-neutral-50/90 to-white/70 dark:from-[#131722]/90 dark:to-[#0d1017]/80 hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-all duration-300 text-left hover:shadow-[0_12px_40px_rgba(59,130,246,0.18)] hover:-translate-y-1 cursor-pointer"
          >
            {/* Corner Keyboard Shortcut */}
            <span className="absolute top-4 right-4 font-mono text-[10px] text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-md group-hover:border-blue-500/40 transition-colors">
              Press [1]
            </span>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-xl border border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  ⚛
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Engineering Architecture
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                    JEE Main & Advanced
                  </h3>
                </div>
              </div>

              <div className="space-y-2 mt-5 text-[12.5px] text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <span className="text-blue-500 font-bold text-xs">◆</span>
                  <span>23 IITs · 32 NITs · 26 IIITs & GFTIs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-blue-500 font-bold text-xs">◆</span>
                  <span>10-Year Round 1 to 6 Closing Trends</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-blue-500 font-bold text-xs">◆</span>
                  <span>Branch Choice Order Optimization</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase">
              <span>EXPLORE JoSAA ENGINE</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Card 2: NEET Medical */}
          <button
            type="button"
            onClick={() => chooseStream("neet")}
            className="group relative flex flex-col justify-between p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-gradient-to-b from-neutral-50/90 to-white/70 dark:from-[#131722]/90 dark:to-[#0d1017]/80 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 transition-all duration-300 text-left hover:shadow-[0_12px_40px_rgba(16,185,129,0.18)] hover:-translate-y-1 cursor-pointer"
          >
            {/* Corner Keyboard Shortcut */}
            <span className="absolute top-4 right-4 font-mono text-[10px] text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-md group-hover:border-emerald-500/40 transition-colors">
              Press [2]
            </span>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center text-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  🩺
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Clinical Architecture
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                    NEET-UG Medical
                  </h3>
                </div>
              </div>

              <div className="space-y-2 mt-5 text-[12.5px] text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-500 font-bold text-xs">◆</span>
                  <span>1,08,940 MBBS · BDS · BAMS Seats</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-500 font-bold text-xs">◆</span>
                  <span>15% AIQ + 85% State DME Domicile Shield</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-500 font-bold text-xs">◆</span>
                  <span>Hospital Bed Loads & Service Bond Audit</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase">
              <span>EXPLORE MEDICAL ENGINE</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-between pt-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-white/10 relative z-10">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Switch anytime seamlessly from the navigation header
          </span>
          <button
            type="button"
            onClick={() => setShowStreamChooser(false)}
            className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors underline cursor-pointer"
          >
            Skip for now (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
