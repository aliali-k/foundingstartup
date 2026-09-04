import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CounsellingHeader } from "@/components/counselling/CounsellingHeader";
import { SimulatedSessionPanel } from "@/components/counselling/SimulatedSessionPanel";
import { SessionReviewModal } from "@/components/counselling/SessionReviewModal";
import { getSessionById, type SimulatedSession } from "@/lib/counselling-store";

export const Route = createFileRoute("/counselling/session/$id")({
  component: SessionDetailPage,
});

function SessionDetailPage() {
  const { id } = useParams({ from: "/counselling/session/$id" });
  const navigate = useNavigate();

  // Find session or fallback to mock active session
  let session = getSessionById(id);

  if (!session) {
    session = {
      id,
      requestId: "req-josaa-mech-demo",
      helperId: "riya-sharma-nitkkr",
      helperName: "Riya Sharma",
      serviceTitle: "1-on-1 College & Branch Deep Dive",
      amountPaidInr: 350,
      durationMin: 25,
      status: "active",
      startedAt: new Date().toISOString(),
      notes: [
        "Session booked for ₹350 (25 mins).",
        "Scope: Hero MotoCorp core automotive placements vs software backup at NIT Kurukshetra.",
      ],
    };
  }

  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <CounsellingHeader activeSection="seeker" />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-6">
        <SimulatedSessionPanel
          session={session}
          onOpenReview={() => setReviewOpen(true)}
        />
      </main>

      <SessionReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        sessionId={session.id}
        helperId={session.helperId}
        helperName={session.helperName}
      />
    </div>
  );
}
