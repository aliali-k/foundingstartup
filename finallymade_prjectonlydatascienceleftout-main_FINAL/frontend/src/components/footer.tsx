import { useRouterState } from "@tanstack/react-router";
import { useTheme } from "./theme-provider";
import { useExamMode } from "@/lib/exam-mode-context";

export function Footer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme } = useTheme();
  const { isNeet } = useExamMode();

  // Home page has its own integrated Novu footer
  if (pathname === "/") return null;

  return (
    <footer className="w-full border-t border-white/10 bg-black text-xs py-8 px-6 text-neutral-400">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">
            {isNeet ? "NovuMed" : "NovuEng"}
          </span>
          <span>· Open Source Admission Infrastructure</span>
        </div>
        <div className="font-mono text-[11px] text-neutral-500">
          Calibrated on official 10-Year JoSAA & MCC Data
        </div>
      </div>
    </footer>
  );
}
