import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/connectivity")({
  head: () => ({
    meta: [
      { title: "One-to-One Connectivity · JoSAA Mentorship" },
      { name: "description", content: "Connect personally with seniors and mentors for guidance tailored to your college and branch." },
    ],
  }),
  component: ConnectivityRedirect,
});

function ConnectivityRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/counselling" });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 font-mono">
      <span className="size-3 rounded-full bg-blue-500 animate-ping" />
      <span className="text-xs text-muted-foreground">Redirecting to Counselling Marketplace…</span>
    </div>
  );
}
