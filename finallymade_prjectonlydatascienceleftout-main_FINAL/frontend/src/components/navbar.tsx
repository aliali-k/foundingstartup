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
            <Link to="/counselling" className="hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer font-bold text-blue-600 dark:text-blue-400">
              ✦ Counselling
            </Link>
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

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
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
