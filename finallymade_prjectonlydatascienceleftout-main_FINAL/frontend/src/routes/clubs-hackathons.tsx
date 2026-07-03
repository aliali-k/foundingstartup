import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/SectionPlaceholder";

export const Route = createFileRoute("/clubs-hackathons")({
  head: () => ({
    meta: [
      { title: "Club Sessions & Hackathons · JoSAA Predictor" },
      { name: "description", content: "Live sessions from college clubs and societies, plus hackathons and competitions curated for you." },
    ],
  }),
  component: ClubsHackathonsPage,
});

function ClubsHackathonsPage() {
  return (
    <SectionPlaceholder
      code="04"
      title="Club Sessions & Hackathons"
      description="Live sessions from college clubs and societies, plus hackathons and competitions curated for you."
      glow="#f59e0b"
    />
  );
}
