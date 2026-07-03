import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/SectionPlaceholder";

export const Route = createFileRoute("/alternate-pathway")({
  head: () => ({
    meta: [
      { title: "Alternate Pathway Guidance · JoSAA Predictor" },
      { name: "description", content: "Discover skill-based learning paths built for your future beyond traditional colleges." },
    ],
  }),
  component: AlternatePathwayPage,
});

function AlternatePathwayPage() {
  return (
    <SectionPlaceholder
      code="03"
      title="Alternate Pathway Guidance"
      description="Discover skill-based learning paths built for your future beyond traditional colleges."
      glow="#10b981"
    />
  );
}
