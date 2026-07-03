import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/SectionPlaceholder";

export const Route = createFileRoute("/connectivity")({
  head: () => ({
    meta: [
      { title: "One-to-One Connectivity · JoSAA Predictor" },
      { name: "description", content: "Connect personally with seniors and mentors for guidance tailored to you." },
    ],
  }),
  component: ConnectivityPage,
});

function ConnectivityPage() {
  return (
    <SectionPlaceholder
      code="02"
      title="One-to-One Connectivity"
      description="Connect personally with seniors and mentors for guidance tailored to you."
      glow="#3b82f6"
    />
  );
}
