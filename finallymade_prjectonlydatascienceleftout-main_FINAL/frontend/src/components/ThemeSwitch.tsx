// import { Moon, Sun } from "lucide-react";
// import { useTheme } from "./theme-provider";

// /**
//  * Global, single-source-of-truth theme toggle.
//  * Circular icon button — sun in light mode, moon in dark mode.
//  * Reads/writes the shared ThemeProvider context.
//  */
// export function ThemeSwitch({ className = "" }: { className?: string }) {
//   const { theme, toggle } = useTheme();
//   const dark = theme === "dark";

//   return (
//     <button
//       type="button"
//       role="switch"
//       aria-checked={dark}
//       aria-label="Toggle light and dark theme"
//       onClick={toggle}
//       className={`theme-orb ${dark ? "is-dark" : "is-light"} ${className}`}
//     >
//       <span className="theme-orb__icon theme-orb__icon--sun" aria-hidden>
//         <Sun size={12} strokeWidth={2.2} />
//       </span>
//       <span className="theme-orb__icon theme-orb__icon--moon" aria-hidden>
//         <Moon size={12} strokeWidth={2.2} />
//       </span>
//     </button>
//   );
// }


import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

/**
 * Global, single-source-of-truth theme toggle.
 * Circular icon button — shows the icon of the theme you'll SWITCH TO.
 * Light mode → shows moon (click to go dark). Dark mode → shows sun (click to go light).
 * Reads/writes the shared ThemeProvider context.
 */
export function ThemeSwitch({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Toggle light and dark theme"
      onClick={toggle}
      className={`theme-orb ${dark ? "is-dark" : "is-light"} ${className}`}
    >
      {dark ? (
        <Sun size={10} strokeWidth={2.2} className="theme-orb__icon" aria-hidden />
      ) : (
        <Moon size={10} strokeWidth={2.2} className="theme-orb__icon" aria-hidden />
      )}
    </button>
  );
}