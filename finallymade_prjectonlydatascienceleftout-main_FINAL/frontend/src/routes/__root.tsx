import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { ThemeProvider } from "../components/theme-provider";
import { ExamModeProvider } from "../lib/exam-mode-context";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { WavyBackground } from "../components/wavy-bg";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JoSAA & NEET UG Predictor — India's Premier Counselling Platform" },
      {
        name: "description",
        content:
          "Predict your JEE Main / Advanced and NEET UG medical colleges and branches with zero guesswork.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Routes that want the full viewport for a cinematic, freely-scrolling experience
// instead of the fixed-height/overflow-hidden chrome used by the predictor form pages.
const FULLSCREEN_ROUTES = ["/processing"];

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isFullscreen = FULLSCREEN_ROUTES.includes(pathname);

  if (isFullscreen) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ExamModeProvider>
            <Outlet />
          </ExamModeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ExamModeProvider>
          <WavyBackground />
          <Navbar />
          <main className="page-fade" style={{ paddingTop: 56, minHeight: "100vh" }}>
            <Outlet />
          </main>
          <Footer />
        </ExamModeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

