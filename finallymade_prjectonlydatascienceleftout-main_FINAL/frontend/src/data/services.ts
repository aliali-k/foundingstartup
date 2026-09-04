export interface ServiceDefinition {
  id: string;
  title: string;
  shortDesc: string;
  typicalDurationMin: number;
  isFree: boolean;
  basePriceInr: number;
  recommendedMaxInr: number;
  format: "chat" | "call" | "document" | "mock_session";
  whatIsIncluded: string[];
  whatIsNotIncluded: string[];
  badgeColor: string;
}

export const PLATFORM_SERVICES: ServiceDefinition[] = [
  {
    id: "free-fit-chat",
    title: "Free Pre-Session Fit & Scope Check",
    shortDesc: "Ask 2–3 preliminary questions to confirm the mentor has the exact background you need before booking.",
    typicalDurationMin: 10,
    isFree: true,
    basePriceInr: 0,
    recommendedMaxInr: 0,
    format: "chat",
    whatIsIncluded: [
      "Verify mentor's direct experience matches your doubts",
      "Clarify scope of what can be solved in a full session",
      "Agree on topics and deliverables before requesting a quote",
      "No credit card or payment commitment required"
    ],
    whatIsNotIncluded: [
      "Comprehensive multi-page choice list ordering",
      "Detailed 45-minute live audio/video consultation",
      "Line-by-line resume rewrite"
    ],
    badgeColor: "#10b981",
  },
  {
    id: "college-branch-deep-dive",
    title: "1-on-1 College & Branch Deep Dive",
    shortDesc: "First-hand student truth on academics, labs, core vs software placements, hostels, and branch change rules.",
    typicalDurationMin: 25,
    isFree: false,
    basePriceInr: 250,
    recommendedMaxInr: 500,
    format: "call",
    whatIsIncluded: [
      "Honest assessment of branch workload and faculty reality",
      "Real internship and on-campus placement statistics",
      "Branch change probability and required first-year CGPA",
      "Hostel, mess, and peer culture breakdown"
    ],
    whatIsNotIncluded: [
      "Guaranteed seat allotment (we are counsellors, not admission agents)"
    ],
    badgeColor: "#3b82f6",
  },
  {
    id: "sde2-roadmap-review",
    title: "SDE-1 to SDE-2 Promotion & System Design Audit",
    shortDesc: "Gap analysis on your current codebase ownership, system design fundamentals, and promotion document strategy.",
    typicalDurationMin: 35,
    isFree: false,
    basePriceInr: 450,
    recommendedMaxInr: 900,
    format: "call",
    whatIsIncluded: [
      "Review of your current technical scope & project ownership",
      "System design preparation roadmap tailored to your target companies",
      "How to frame business impact in self-reviews and manager 1:1s",
      "Concrete next 90-day checklist"
    ],
    whatIsNotIncluded: [
      "Live job referrals (mentors may offer at their discretion later)"
    ],
    badgeColor: "#8b5cf6",
  },
  {
    id: "josaa-choice-order-audit",
    title: "JoSAA Choice Order Strategy Audit",
    shortDesc: "Avoid the irreversible traps: order your 50+ college & branch choices mathematically by cutoffs and career goals.",
    typicalDurationMin: 30,
    isFree: false,
    basePriceInr: 350,
    recommendedMaxInr: 750,
    format: "call",
    whatIsIncluded: [
      "Line-by-line verification of your tentative JoSAA preference list",
      "Home State vs Other State quota optimization check",
      "Balancing dream colleges vs safe fallback choices",
      "Post-session written preference sheet summary"
    ],
    whatIsNotIncluded: [
      "Filling the official JoSAA portal on your behalf"
    ],
    badgeColor: "#f59e0b",
  },
  {
    id: "resume-career-switch-review",
    title: "Resume & Non-CS Career Switch Diagnostic",
    shortDesc: "For non-CSE or junior engineers breaking into software, quant, or product management.",
    typicalDurationMin: 30,
    isFree: false,
    basePriceInr: 300,
    recommendedMaxInr: 650,
    format: "call",
    whatIsIncluded: [
      "ATS-friendly resume review with actionable bullet revisions",
      "Portfolio project ideas that impress hiring managers",
      "Cold outreach strategy for off-campus interviews"
    ],
    whatIsNotIncluded: [
      "Ghostwriting complete resumes from scratch"
    ],
    badgeColor: "#06b6d4",
  },
];
