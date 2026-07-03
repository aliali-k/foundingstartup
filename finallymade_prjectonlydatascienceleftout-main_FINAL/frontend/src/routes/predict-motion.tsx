import { createFileRoute, Link } from "@tanstack/react-router";
import { COMMUNITY } from "./predict";

export const Route = createFileRoute("/predict-motion")({
  component: PredictMotionPage,
});

function ImageMarquee({ images, accent }: { images: string[]; accent: string }) {
  // Duplicate the seeds so the translateX(-50%) loop is seamless.
  const loop = [...images, ...images];
  return (
    <div className="marquee-mask mt-1">
      <div className="marquee-track">
        {loop.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: `2px solid ${accent}`,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PredictMotionPage() {
  return (
    <div className="h-full w-full grid" style={{ gridTemplateColumns: "44% 56%" }}>
      {/* LEFT */}
      <section className="px-8 py-4 flex flex-col justify-between gap-2 relative">
        <div className="mono text-[9px]" style={{ color: "var(--muted-foreground)", letterSpacing: "2px" }}>
          ◆ THE REALITY
        </div>

        <div className="flex flex-col justify-center flex-1 gap-1">
          <div style={{ fontWeight: 900, fontSize: 42, lineHeight: 1.02 }}>
            <div style={{ color: "var(--foreground)" }}>One counselling.</div>
            <div style={{ color: "var(--foreground)" }}>One chance.</div>
            <div style={{ color: "var(--accent)" }}>No going back.</div>
            <div style={{ color: "#2563eb" }}>Select the best.</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <StatBlock value="12,00,000+" label="STUDENTS APPEAR EVERY YEAR" color="var(--accent)" />
          <StatBlock value="1" label="CHANCE TO FILL JoSAA FORM" color="#d97706" />
          <StatBlock value="0" label="RETRIES AFTER SEAT PAYMENT" color="#ef4444" />
          <StatBlock value="4 YRS" label="LOCKED IN BY ONE WRONG CHOICE" color="var(--foreground)" />
          <StatBlock value="∞" label="OPPORTUNITIES LOST WITH WRONG BRANCH" color="#7c3aed" />
        </div>

        <div className="flex items-center gap-2">
          <div
            className="mono text-[9px] px-3 py-2 rounded-md flex-1"
            style={{
              background: "rgba(217,119,6,0.08)",
              border: "1px solid var(--warn)",
              color: "var(--warn)",
              letterSpacing: "1px",
            }}
          >
            ⚠ ONE WRONG CHOICE = 4 YEARS WASTED
          </div>
          <div
            className="mono text-[8.5px] px-2 py-2 rounded-md"
            style={{
              border: "1px solid var(--border)",
              color: "var(--muted-foreground)",
              letterSpacing: "1px",
            }}
          >
            10 YR DATA · ALL 23 IITs · 31 NITs · GFTIs · IIITs
          </div>
        </div>

        <div className="absolute right-0 top-3 bottom-3" style={{ width: 1, background: "var(--border)" }} />
      </section>

      {/* RIGHT */}
      <section className="px-8 py-4 flex flex-col justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="mono text-[9px]" style={{ color: "var(--muted-foreground)", letterSpacing: "2px" }}>
            ◆ THE COMMUNITY · LIVE
          </div>
          <div className="flex items-end justify-between">
            <div style={{ fontWeight: 900, fontSize: 30, lineHeight: 1.05 }}>
              <div style={{ color: "var(--foreground)" }}>You won't be</div>
              <div style={{ color: "var(--accent)" }}>alone. Ever.</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-[11px] max-w-[240px] text-right" style={{ color: "var(--muted-foreground)" }}>
                Alumni from top companies guide you before you even join the campus.
              </p>
              <Link
                to="/predict"
                className="mono text-[9px] px-2 py-1 rounded"
                style={{
                  color: "var(--muted-foreground)",
                  border: "1px solid var(--border)",
                  letterSpacing: "1px",
                  textDecoration: "none",
                }}
              >
                ◼ VIEW STATIC VERSION
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 flex-1">
          {COMMUNITY.map((c, i) => (
            <div
              key={c.title}
              className="glow-card p-3 flex flex-col gap-1 justify-start"
              style={
                {
                  background: "var(--card)",
                  border: `1px solid ${c.glow}40`,
                  borderRadius: 8,
                  "--glow-color": c.glow,
                  animationDelay: `${i * 0.4}s`,
                } as React.CSSProperties
              }
            >
              <div className="mono text-[9.5px]" style={{ color: c.glow, letterSpacing: "1px" }}>
                {c.title}
              </div>
              <div className="text-[11px] font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                {c.a}
              </div>
              <div className="text-[10px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {c.b}
              </div>
              <ImageMarquee images={c.images} accent={c.glow} />
            </div>
          ))}
        </div>

        <div
          className="flex items-center px-4 py-2 rounded-md"
          style={{ background: "var(--stat-bar-bg)", border: "1px solid var(--border)" }}
        >
          <StatItem n="500+" l="Alumni Connected" />
          <Divider />
          <StatItem n="23" l="IITs Covered" />
          <Divider />
          <StatItem n="31" l="NITs Covered" />
          <Divider />
          <StatItem n="All" l="GFTIs & IIITs" />
        </div>
      </section>
    </div>
  );
}

function StatBlock({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 pb-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div className="mono text-[8.5px] text-right" style={{ color: "var(--muted-foreground)", letterSpacing: "1.5px" }}>
        {label}
      </div>
    </div>
  );
}

function StatItem({ n, l }: { n: string; l: string }) {
  return (
    <div className="flex items-baseline gap-1.5 flex-1 justify-center">
      <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 13 }}>{n}</span>
      <span className="mono text-[8px]" style={{ color: "var(--muted-foreground)", letterSpacing: "1px" }}>
        {l}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: "var(--border)" }} />;
}