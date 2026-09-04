export interface CareerRole {
  id: string;
  title: string;
  level: number; // 1: Intern/Fresher, 2: SDE-1/Junior, 3: SDE-2/Mid, 4: Senior/Lead, 5: Staff/Principal
  category: "Software" | "Data & AI" | "Product" | "Core Engineering" | "Consulting";
  typicalExperienceYears: string;
  coreSkills: string[];
  keyMilestones: string[];
  promotedToNextCriteria: string[];
  recommendedMentorLevels: number[];
}

export const CAREER_ROLES: CareerRole[] = [
  {
    id: "sde-intern",
    title: "Software Engineering Intern / Fresher",
    level: 1,
    category: "Software",
    typicalExperienceYears: "0–1 years",
    coreSkills: ["Data Structures & Algorithms", "Git", "Clean Code Basics", "Framework Basics (React/Node/Java)"],
    keyMilestones: ["First production PR merged", "Understanding agile sprints", "Writing comprehensive unit tests"],
    promotedToNextCriteria: ["Consistently ships bug-free user stories", "Demonstrates self-sufficiency in debugging"],
    recommendedMentorLevels: [2, 3, 4],
  },
  {
    id: "sde-1",
    title: "Software Engineer I (SDE-1)",
    level: 2,
    category: "Software",
    typicalExperienceYears: "1–3 years",
    coreSkills: ["Backend APIs / Microservices", "Database Query Optimization", "System Monitoring & Logging", "CI/CD Pipelines"],
    keyMilestones: ["Owned end-to-end small microservice or feature", "Led sprint demos", "Participated in on-call rotation"],
    promotedToNextCriteria: [
      "Translates ambiguous product requirements into technical architecture",
      "High-level system design proficiency (scalability, caching, message queues)",
      "Cross-team collaboration and code review mentorship for juniors"
    ],
    recommendedMentorLevels: [3, 4, 5], // SDE-2, Senior, Staff
  },
  {
    id: "sde-2",
    title: "Software Engineer II (SDE-2)",
    level: 3,
    category: "Software",
    typicalExperienceYears: "3–6 years",
    coreSkills: ["Distributed Systems Design", "High Throughput Caching (Redis/Kafka)", "Data Modeling & Partitioning", "Reliability Engineering"],
    keyMilestones: ["Designed resilient distributed architecture", "Optimized latency by >40%", "Mentored SDE-1s through promotions"],
    promotedToNextCriteria: [
      "Org-wide technical influence and architectural strategy",
      "Proactive identification of technical debt and business bottlenecks",
      "Executive communication and technical roadmap authoring"
    ],
    recommendedMentorLevels: [4, 5], // Senior, Staff
  },
  {
    id: "senior-sde",
    title: "Senior Software Engineer (Senior SDE / SDE-3)",
    level: 4,
    category: "Software",
    typicalExperienceYears: "6–10 years",
    coreSkills: ["System Architecture", "Multi-region Deployments", "Security & Compliance", "Team Technical Leadership"],
    keyMilestones: ["Led high-impact platform migrations", "Established engineering excellence standards", "Defined multi-year technical vision"],
    promotedToNextCriteria: ["Company-level architectural consensus", "Incubating new company initiatives"],
    recommendedMentorLevels: [5], // Staff/Principal
  },
  {
    id: "staff-engineer",
    title: "Staff / Principal Software Engineer",
    level: 5,
    category: "Software",
    typicalExperienceYears: "10+ years",
    coreSkills: ["Enterprise Architecture", "Organizational Scaling", "Strategic Tech Investments", "Executive Advisory"],
    keyMilestones: ["Architected critical systems serving tens of millions of users", "Shaped company technology philosophy"],
    promotedToNextCriteria: ["Fellow / VP Engineering trajectory"],
    recommendedMentorLevels: [5],
  },
  {
    id: "data-scientist-1",
    title: "Junior Data Scientist / ML Associate",
    level: 2,
    category: "Data & AI",
    typicalExperienceYears: "1–3 years",
    coreSkills: ["Python", "SQL & Data Warehouses", "Scikit-Learn", "Feature Engineering", "A/B Testing"],
    keyMilestones: ["Built production predictive model", "Created automated analytics pipeline"],
    promotedToNextCriteria: ["Deep understanding of causal inference & MLOps", "Translating business KPIs to ML formulations"],
    recommendedMentorLevels: [3, 4, 5],
  },
  {
    id: "senior-data-scientist",
    title: "Senior Data Scientist / ML Specialist",
    level: 4,
    category: "Data & AI",
    typicalExperienceYears: "5–8 years",
    coreSkills: ["LLM Fine-tuning", "Vector Embeddings & RAG", "Distributed Training", "MLOps & Model Serving"],
    keyMilestones: ["Deployed scalable production LLM or recommendation engine", "Direct revenue attribution to models"],
    promotedToNextCriteria: ["Leading enterprise AI roadmap and data governance"],
    recommendedMentorLevels: [5],
  },
  {
    id: "core-mech-engineer",
    title: "Design & R&D Mechanical Engineer",
    level: 3,
    category: "Core Engineering",
    typicalExperienceYears: "2–5 years",
    coreSkills: ["CAD/CAM (SolidWorks/CATIA)", "FEA / CFD Simulations (ANSYS)", "DFM / DFA Principles", "Automotive Powertrain"],
    keyMilestones: ["Delivered physical prototype into tooling production", "Optimized structural fatigue strength by 25%"],
    promotedToNextCriteria: ["Leading complete subsystem vehicle or machine design"],
    recommendedMentorLevels: [4, 5],
  },
  {
    id: "associate-pm",
    title: "Associate Product Manager (APM)",
    level: 2,
    category: "Product",
    typicalExperienceYears: "1–3 years",
    coreSkills: ["User Research", "PRD Authoring", "Wireframing", "Funnel Analytics (Amplitude/Mixpanel)"],
    keyMilestones: ["Launched first customer-facing feature", "Improved signup conversion rate"],
    promotedToNextCriteria: ["Managing entire product line roadmap and P&L metrics"],
    recommendedMentorLevels: [3, 4, 5],
  },
  {
    id: "associate-consultant",
    title: "Management / Technology Consultant",
    level: 2,
    category: "Consulting",
    typicalExperienceYears: "1–3 years",
    coreSkills: ["Structured Problem Solving (MECE)", "Financial Modeling", "Executive Storyboarding", "Client Stakeholder Management"],
    keyMilestones: ["Delivered key workstream for Fortune 500 digital transformation", "Led senior client presentations"],
    promotedToNextCriteria: ["Engagement manager readiness and commercial proposal authorship"],
    recommendedMentorLevels: [4, 5],
  },
];
