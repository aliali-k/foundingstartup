export interface CounsellingRequest {
  id: string;
  seekerId: string;
  seekerName: string;
  seekerType: "class_12_jee" | "dropper_jee" | "neet_aspirant" | "college_student" | "working_professional";
  title: string;
  category: "college_guidance" | "career_guidance";
  rawText: string;
  normalizedSummary: string;
  context: {
    exam?: string;
    rank?: number;
    categoryQuota?: string;
    consideredColleges?: string[];
    preferredBranches?: string[];
    currentRole?: string;
    targetRole?: string;
    experienceYears?: number;
    primaryConcerns?: string[];
  };
  questions: string[];
  requestedServiceId: string;
  preferredFormat: "chat" | "call";
  sentToHelperIds: string[];
  receivedQuotes: ReceivedQuote[];
  activeHelperId?: string;
  status: "draft" | "open" | "chatting" | "quoted" | "accepted" | "scheduled" | "in_progress" | "completed" | "disputed";
  createdAt: string;
}

export interface ReceivedQuote {
  id: string;
  requestId: string;
  helperId: string;
  helperName: string;
  helperRole: string;
  helperCollege: string;
  serviceId: string;
  serviceTitle: string;
  priceInr: number;
  estimatedDurationMin: number;
  scopeSummary: string;
  helperNote: string;
  communicationMode?: "video" | "chat";
  offeredPriceInr?: number;
  status: "sent" | "accepted" | "declined";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderRole: "seeker" | "helper" | "ai_system";
  text: string;
  timestamp: string;
  isAiAssisted?: boolean;
}

export interface PlatformReview {
  id: string;
  sessionId: string;
  helperId: string;
  seekerName: string;
  rating: number; // 1 to 5
  relevanceScore: number;
  understandingScore: number;
  valueForMoneyScore: number;
  comment: string;
  createdAt: string;
}

export const SEED_REQUESTS: CounsellingRequest[] = [
  {
    id: "req-josaa-mech-demo",
    seekerId: "seeker-demo-1",
    seekerName: "Aman (Class 12 / JEE 2026)",
    seekerType: "class_12_jee",
    title: "NIT Kurukshetra Computer Science vs PEC Chandigarh CSE vs Assam University IT/CS",
    category: "college_guidance",
    rawText: "I got ~7,207 rank in JEE Main. I am evaluating Computer Science across NIT Kurukshetra, PEC Chandigarh, and Assam University. I want to compare Tier-1 software placement opportunities, coding culture, and hostel facilities.",
    normalizedSummary: "Candidate holds ~7,207 JEE Main rank deciding between NIT Kurukshetra, PEC Chandigarh, and Assam University for Computer Science. Prioritizes Tier-1 software placements, coding culture, and campus facilities.",
    context: {
      exam: "JEE Main 2026",
      rank: 7207,
      categoryQuota: "OPEN / Other State",
      consideredColleges: ["NIT Kurukshetra", "PEC / NIT Chandigarh", "Assam University"],
      preferredBranches: ["Computer Science", "Computer Engineering"],
      primaryConcerns: ["Tier-1 software placements", "Coding culture & labs", "Hostel culture", "Off-campus placement drives"],
    },
    questions: [
      "What are the Tier-1 tech (Microsoft, Amazon, FinTech) placement statistics for Computer Science?",
      "How are the coding culture, high-speed labs, and hostel internet facilities?",
      "Between Kurukshetra, PEC Chandigarh, and Assam University, what is the ROI and peer coding group like?",
      "Are students from Assam University able to crack off-campus Tier-1 product roles?"
    ],
    requestedServiceId: "college-branch-deep-dive",
    preferredFormat: "call",
    sentToHelperIds: ["riya-sharma-nitkkr", "aarav-patel-pec", "debojit-das-aus"],
    activeHelperId: "riya-sharma-nitkkr",
    status: "quoted",
    createdAt: "2026-09-04T10:30:00Z",
    receivedQuotes: [
      {
        id: "quote-riya-1",
        requestId: "req-josaa-mech-demo",
        helperId: "riya-sharma-nitkkr",
        helperName: "Riya Sharma",
        helperRole: "SDE-1 Microsoft (Ex-NIT Kurukshetra CS)",
        helperCollege: "NIT Kurukshetra",
        serviceId: "college-branch-deep-dive",
        serviceTitle: "1-on-1 College & Branch Deep Dive",
        priceInr: 350,
        estimatedDurationMin: 25,
        scopeSummary: "Comprehensive 4-point breakdown: On-campus Tier-1 product drives, coding lab culture, Technobyte club, and hostel reality at NITK.",
        helperNote: "I was in your exact shoes with a top JEE rank. I will give you the unvarnished truth of CS placements, labs, and hostel prep at NIT Kurukshetra.",
        status: "sent",
        createdAt: "2026-09-04T10:45:00Z",
      },
      {
        id: "quote-aarav-2",
        requestId: "req-josaa-mech-demo",
        helperId: "aarav-patel-pec",
        helperName: "Aarav Patel",
        helperRole: "SDE-1 FinTech (Ex-PEC Chandigarh CSE)",
        helperCollege: "PEC / NIT Chandigarh",
        serviceId: "college-branch-deep-dive",
        serviceTitle: "1-on-1 College & Branch Deep Dive",
        priceInr: 300,
        estimatedDurationMin: 20,
        scopeSummary: "Focus on PEC's 6-month internship semester advantage and why Chandigarh tech proximity helps secure top Tier-1 software PPOs.",
        helperNote: "Happy to contrast PEC CSE against Kurukshetra and Assam University, particularly how our 6-month semester helps students land top FinTech offers.",
        status: "sent",
        createdAt: "2026-09-04T10:50:00Z",
      },
      {
        id: "quote-debojit-3",
        requestId: "req-josaa-mech-demo",
        helperId: "debojit-das-aus",
        helperName: "Debojit Das",
        helperRole: "Software Engineer (Ex-Assam University CSE)",
        helperCollege: "Assam University, Silchar",
        serviceId: "college-branch-deep-dive",
        serviceTitle: "1-on-1 College & Branch Deep Dive",
        priceInr: 300,
        estimatedDurationMin: 25,
        scopeSummary: "Detailed perspective on Assam University CSE: syllabus rigor, faculty guidance, off-campus drive strategies, and North East campus facilities.",
        helperNote: "I graduated from Assam University CSE and secured a top digital engineering role. Glad to give you the honest ground reality of our department and campus life.",
        status: "sent",
        createdAt: "2026-09-04T11:00:00Z",
      },
    ],
  },
  {
    id: "req-career-sde2-demo",
    seekerId: "seeker-demo-2",
    seekerName: "Praveen (Working Professional)",
    seekerType: "working_professional",
    title: "SDE-1 to SDE-2 Backend Promotion & System Design Preparation",
    category: "career_guidance",
    rawText: "I have been working as an SDE-1 for 1.5 years at an early-stage startup. I want to transition into an SDE-2 role at a Tier-1 product company within the next 6 months. I need guidance on system design expectations and how to lead projects.",
    normalizedSummary: "SDE-1 engineer with 1.5 years backend experience aiming for SDE-2 transition. Seeks diagnostic on project scope expansion, distributed systems interview readiness (Kafka, caching, data partitioning), and manager impact framing.",
    context: {
      currentRole: "Software Engineer I (SDE-1)",
      targetRole: "Software Engineer II (SDE-2)",
      experienceYears: 1.5,
      primaryConcerns: ["System design interview preparedness", "Project ownership & ambiguity handling", "Promotion packet construction"],
    },
    questions: [
      "What concrete technical scope separates an SDE-1 from an SDE-2 in system design rounds?",
      "How do I proactively take ownership of architecture when my current startup has small features?",
      "Which distributed systems topics (caching, sharding, consensus) are actually tested in SDE-2 interviews?"
    ],
    requestedServiceId: "sde2-roadmap-review",
    preferredFormat: "call",
    sentToHelperIds: ["sneha-rao-msft", "arjun-nambiar-razorpay", "vikramaditya-sen-staff"],
    activeHelperId: "sneha-rao-msft",
    status: "open",
    createdAt: "2026-09-04T11:15:00Z",
    receivedQuotes: [],
  },
];

export const SEED_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  "req-josaa-mech-demo": [
    {
      id: "msg-1",
      requestId: "req-josaa-mech-demo",
      senderId: "seeker-demo-1",
      senderRole: "seeker",
      text: "Hi Riya, I saw you graduated from NIT Kurukshetra Mechanical. Can you help me understand whether core companies actually come for on-campus internships?",
      timestamp: "10:32 AM",
    },
    {
      id: "msg-2",
      requestId: "req-josaa-mech-demo",
      senderId: "riya-sharma-nitkkr",
      senderRole: "helper",
      text: "Hey Aman! Yes, absolutely. That is directly within my experience. Hero MotoCorp, Tata Motors, L&T, and Maruti Suzuki come every year. In my batch, 18 students got summer internships directly on campus. I can also explain how the SAE Baja club opens direct interview doors.",
      timestamp: "10:35 AM",
      isAiAssisted: true,
    },
    {
      id: "msg-3",
      requestId: "req-josaa-mech-demo",
      senderId: "seeker-demo-1",
      senderRole: "seeker",
      text: "That's super reassuring. I also wanted to compare it with PEC Chandigarh and check branch change rules.",
      timestamp: "10:37 AM",
    },
    {
      id: "msg-4",
      requestId: "req-josaa-mech-demo",
      senderId: "riya-sharma-nitkkr",
      senderRole: "helper",
      text: "Yes, we can cover both in a 20-25 min session. I know several batchmates who attempted branch change (cutoff is usually ~8.8 CGPA for Electrical and ~9.3 for CSE). I've sent you a scoped quote for ₹350 covering all four questions!",
      timestamp: "10:45 AM",
      isAiAssisted: true,
    },
  ],
};
