import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/SectionPlaceholder";

export const Route = createFileRoute("/global-pathways")({
  head: () => ({
    meta: [
      { title: "Global Pathways Explorer · JoSAA Predictor" },
      { name: "description", content: "Indian and foreign universities where your JEE score can open doors beyond the usual path." },
    ],
  }),
  component: GlobalPathwaysPage,
});

function GlobalPathwaysPage() {
  return (
    <SectionPlaceholder
      code="05"
      title="Global Pathways Explorer"
      description="Indian and foreign universities where your JEE score can open doors beyond the usual path."
      glow="#a855f7"
    />
  );
}
