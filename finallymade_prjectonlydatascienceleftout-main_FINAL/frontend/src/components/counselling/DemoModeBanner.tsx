import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function DemoModeBanner() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="border-b border-blue-500/20 bg-blue-500/5 px-4 py-2 text-xs font-mono">
      <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-blue-500 animate-ping" />
          <span className="font-bold text-blue-600 dark:text-blue-400">
            DEMO MODE LAUNCHPAD
          </span>
          <span className="text-muted-foreground hidden lg:inline">
            · Explore the 3 complete marketplace loops:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate({ to: "/counselling/college", search: { college: "NIT Kurukshetra", rank: "32450", branch: "Mechanical" } })}
            className="px-2.5 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-2xs"
          >
            1. College Flow (NITK Mech)
          </button>
          <button
            onClick={() => navigate({ to: "/counselling/career" })}
            className="px-2.5 py-1 rounded border border-blue-500/30 bg-background text-foreground hover:bg-blue-500/10 transition"
          >
            2. Career Flow (SDE-1 → SDE-2)
          </button>
          <button
            onClick={() => navigate({ to: "/counselling/compare", search: { requestId: "req-josaa-mech-demo" } })}
            className="px-2.5 py-1 rounded border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 hover:bg-purple-500/20 transition font-semibold"
          >
            ★ Multi-Quote Compare
          </button>
          <button
            onClick={() => navigate({ to: "/helper" })}
            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition shadow-2xs"
          >
            3. Helper Desk Flow
          </button>
        </div>
      </div>
    </div>
  );
}
