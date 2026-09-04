import { createFileRoute } from "@tanstack/react-router";
import { CounsellingHeader } from "@/components/counselling/CounsellingHeader";
import { HelperDeskDashboard } from "@/components/counselling/HelperDeskDashboard";

export const Route = createFileRoute("/helper")({
  head: () => ({
    meta: [
      { title: "Helper Advisory Desk · Mentor Dashboard" },
      { name: "description", content: "Triage seeker requests, use AI drafting tools, and submit scope-based quotes." },
    ],
  }),
  component: HelperPortalPage,
});

function HelperPortalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <CounsellingHeader activeSection="helper" />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-8">
        <HelperDeskDashboard />
      </main>
    </div>
  );
}
