import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTheme } from "./theme-provider";
import { PredictionModal } from "./prediction-modal";
import { ThemeSwitch } from "./ThemeSwitch";

export function Navbar() {
  const { theme } = useTheme();
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

  return (
    <>
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6"
        style={{
          height: 44,
          background: "var(--nav-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          to="/"
          className="mono text-[18px] tracking-wider"
          style={{ color: theme === "dark" ? "#fff" : "#4f46e5", fontWeight: 600 }}
        >
          ◆ JoSAA
        </Link>

        <div className="mono text-[13px]" style={{ letterSpacing: "2px", color: "var(--muted-foreground)" }}>
          JEE COLLEGE PREDICTION PLATFORM
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitch />
          <button
            onClick={onStart}
            className="mono text-[10px] px-3 py-1.5 rounded-sm transition-colors"
            style={{
              border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.25)" : "rgba(79,70,229,0.35)"}`,
              color: theme === "dark" ? "#fff" : "#4f46e5",
              letterSpacing: "1px",
            }}
          >
            START PREDICTION →
          </button>
        </div>
      </nav>
      <PredictionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
