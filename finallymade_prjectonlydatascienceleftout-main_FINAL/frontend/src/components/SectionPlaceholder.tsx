import { Link } from "@tanstack/react-router";

export function SectionPlaceholder({
  code,
  title,
  description,
  glow,
}: {
  code: string;
  title: string;
  description: string;
  glow: string;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center px-6">
      <div
        className="glow-card relative flex max-w-xl flex-col items-start gap-4 rounded-2xl p-8"
        style={
          {
            background: "var(--card)",
            border: `1px solid ${glow}40`,
            "--glow-color": glow,
          } as React.CSSProperties
        }
      >
        <div className="mono text-[10px] tracking-[0.3em]" style={{ color: glow }}>
          {code} · COMING SOON
        </div>
        <h1
          className="text-3xl font-black tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {description}
        </p>
        <p className="mono text-[11px]" style={{ color: "var(--muted-foreground)", letterSpacing: "1px" }}>
          ◆ We're crafting this experience. Check back soon.
        </p>
        <Link
          to="/"
          className="mono text-[10px] rounded-sm px-4 py-2 transition-colors"
          style={{
            border: `1px solid ${glow}`,
            color: glow,
            letterSpacing: "1px",
          }}
        >
          ← BACK HOME
        </Link>
      </div>
    </div>
  );
}
