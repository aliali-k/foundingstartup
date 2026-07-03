import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/SectionPlaceholder";

export const Route = createFileRoute("/verify-result")({
  head: () => ({
    meta: [
      { title: "Verify Your Result · JoSAA Predictor" },
      { name: "description", content: "Got your final seat? Tell us and help make predictions more accurate for future students." },
    ],
  }),
  component: VerifyResultPage,
});

function VerifyResultPage() {
  return (
    <SectionPlaceholder
      code="06"
      title="Verify Your Result"
      description="Got your final seat? Tell us and help make predictions more accurate for future students."
      glow="#06b6d4"
    />
  );
}
