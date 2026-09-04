import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useExamMode } from "@/lib/exam-mode-context";
import { PredictionModal } from "./prediction-modal";

export function Navbar() {
  const { mode, setMode, isNeet } = useExamMode();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const onStart = () => {
    const pathname = typeof window !== "undefined" ? window.location.pathname : location.pathname;
    if (pathname === "/") {
      navigate({ to: "/predict" });
      return;
    }
    setOpen(true);
  };

  const scrollTo = (id: string) => {
    if (typeof window !== "undefined") {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-[#fafafa]/90 dark:bg-[#0c0d0e]/90 backdrop-blur-md font-sans text-neutral-900 dark:text-neutral-100 transition-colors">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          
          {/* Left: Twenty Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              {/* Bespoke Geometric Admission Icon */}
              <div className="size-8 rounded-lg bg-neutral-950 dark:bg-white flex items-center justify-center text-white dark:text-neutral-950 font-bold text-sm transition-transform group-hover:scale-105">
                {isNeet ? "🩺" : "⬡"}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold tracking-tight text-base">
                  {isNeet ? "NEET-UG" : "JoSAA-JEE"}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                  / {isNeet ? "clinical-matrix" : "engineering-matrix"}
                </span>
              </div>
            </Link>

            {/* Stream Switcher Toggle (Twenty style) */}
            <div className="flex items-center rounded-md p-0.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode("jee")}
                className={`px-3 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isNeet
                    ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <span>⚛</span>
                <span>JEE Main & Adv</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("neet")}
                className={`px-3 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                  isNeet
                    ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <span>🩺</span>
                <span>NEET Medical</span>
              </button>
            </div>
          </div>

          {/* Center: Twenty Primary Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-neutral-600 dark:text-neutral-400">
            <button onClick={() => scrollTo("app-mockup")} className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer">
              Interactive Table
            </button>
            <button onClick={() => scrollTo("data-model")} className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer">
              Data Model
            </button>
            <button onClick={() => scrollTo("views")} className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer">
              Views
            </button>
            <button onClick={() => scrollTo("workflows")} className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer">
              Workflows
            </button>
          </nav>

          {/* Right: Twenty GitHub Star Badge & Action */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/twentyhq/twenty"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white font-medium transition"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>56.2K</span>
              <span className="text-[10px] text-neutral-400 font-mono">↗</span>
            </a>

            {/* Twenty Signature Buttons */}
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={onStart}
              className="text-xs font-semibold px-3.5 py-1.5 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-xs cursor-pointer"
            >
              Get started
            </button>
          </div>
        </div>
      </header>
      <PredictionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
