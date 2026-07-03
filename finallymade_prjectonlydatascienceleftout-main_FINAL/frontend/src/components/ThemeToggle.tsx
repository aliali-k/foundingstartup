// Backwards-compatible alias: the whole site uses one global theme switch.
import { ThemeSwitch } from "./ThemeSwitch";

export function applyStoredTheme() {
  if (typeof document === "undefined") return;
  const stored = localStorage.getItem("josaa-theme");
  // Default to light theme for new visitors; only apply dark when explicitly chosen.
  document.documentElement.classList.toggle("dark", stored === "dark");
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  return <ThemeSwitch className={className} />;
}
