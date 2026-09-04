import { createFileRoute, useSearch } from "@tanstack/react-router";
import { CounsellingHeader } from "@/components/counselling/CounsellingHeader";
import { QuoteComparisonGrid } from "@/components/counselling/QuoteComparisonGrid";
import { getRequestById, getAllRequests } from "@/lib/counselling-store";

export const Route = createFileRoute("/counselling/compare")({
  component: CompareQuotesPage,
  validateSearch: (search: Record<string, unknown>) => ({
    requestId: typeof search.requestId === "string" ? search.requestId : undefined,
  }),
});

function CompareQuotesPage() {
  const search = useSearch({ from: "/counselling/compare" });
  const allReqs = getAllRequests();
  const request = (search.requestId && getRequestById(search.requestId)) || allReqs[0];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <CounsellingHeader activeSection="seeker" />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-8">
        {/* Title */}
        <div className="border-b border-border pb-4">
          <div className="mono text-[10.5px] uppercase font-bold tracking-[0.22em] text-purple-600 dark:text-purple-400">
            ◆ MULTI-MENTOR RESPONSE & QUOTE COMPARISON
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-1 text-foreground">
            Compare Quotes with AI Scope Guidance
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            The same normalized request was evaluated by matching mentors. Compare pricing, scope depth, and AI trade-off analysis before committing.
          </p>
        </div>

        {request ? (
          <QuoteComparisonGrid request={request} />
        ) : (
          <div className="rounded-2xl border border-border p-12 text-center text-muted-foreground">
            No active request found. Please create a request from the College or Career guidance pages.
          </div>
        )}
      </main>
    </div>
  );
}
