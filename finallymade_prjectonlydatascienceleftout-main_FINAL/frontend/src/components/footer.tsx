import { useTheme } from "./theme-provider";

export function Footer() {
  const { theme } = useTheme();
  return (
    <footer
      className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-between px-6"
      style={{ height: 32, borderTop: "1px solid var(--border)", background: "var(--nav-bg)" }}
    >
      <div className="mono text-[9px]" style={{ color: theme === "dark" ? "#fff" : "#4f46e5", letterSpacing: "1px" }}>
        A MODEL TRAINED ON 10 YEARS OF JoSAA DATA.
      </div>
      <div className="mono text-[9px]" style={{ color: "var(--muted-foreground)", letterSpacing: "1px" }}>
        ◆ JoSAA / PREDICTOR · 2026
      </div>
    </footer>
  );
}
