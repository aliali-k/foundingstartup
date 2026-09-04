import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/connectivity")({
  head: () => ({
    meta: [
      { title: "One-to-One Connectivity - JoSAA Predictor" },
      { name: "description", content: "Connect personally with seniors and mentors for guidance tailored to you." },
    ],
  }),
  component: ConnectivityPage,
});

function ConnectivityPage() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <a
        href="http://localhost:8084"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "14px 28px",
          borderRadius: "12px",
          background: "#3b82f6",
          color: "#fff",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Find Your Mentor
      </a>
    </div>
  );
}
