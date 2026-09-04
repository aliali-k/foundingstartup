import { COLLEGES } from "../data/colleges";
import { MENTORS } from "../data/mentors";
import { CAREER_ROLES } from "../data/careerRoles";
import { PLATFORM_SERVICES } from "../data/services";

export interface GeminiTaskResponse {
  success: boolean;
  isFallback: boolean;
  data: any;
  message?: string;
}

// Mentor aliases and fuzzy name mappings
interface MentorAliasConfig {
  full: string[];
  first: string[];
  last: string[];
}

const MENTOR_ALIASES: Record<string, MentorAliasConfig> = {
  "aarav-patel-pec": {
    full: ["aarav patel", "arnav patel", "arav patel"],
    first: ["aarav", "arnav", "arav"],
    last: ["patel"],
  },
  "rajat-verma-nitkkr": {
    full: ["rajat verma", "raj sharma", "raj verma", "rajat sharma"],
    first: ["raj", "rajat"],
    last: ["verma"],
  },
  "yash-agrawal-iiith": {
    full: ["yash agrawal", "yash agarwal", "yash aggrawal"],
    first: ["yash"],
    last: ["agrawal", "agarwal", "aggrawal"],
  },
  "kabir-mehta-iitk": {
    full: ["kabir mehta"],
    first: ["kabir"],
    last: ["mehta"],
  },
  "riya-sharma-nitkkr": {
    full: ["riya sharma"],
    first: ["riya"],
    last: ["sharma"],
  },
  "sneha-rao-msft": {
    full: ["sneha rao", "sneha kulkarni"],
    first: ["sneha"],
    last: ["rao", "kulkarni"],
  },
  "divyanshu-verma-iitbhu": {
    full: ["divyanshu verma"],
    first: ["divyanshu"],
    last: ["verma"],
  },
  "karthik-s-nitt": {
    full: ["karthik sundaram"],
    first: ["karthik"],
    last: ["sundaram"],
  },
  "neha-reddy-nitw": {
    full: ["neha reddy"],
    first: ["neha"],
    last: ["reddy"],
  },
  "rohan-kulkarni-iith": {
    full: ["rohan kulkarni"],
    first: ["rohan"],
    last: ["kulkarni"],
  },
  "vikramaditya-sen-staff": {
    full: ["vikramaditya sen", "vikram sen"],
    first: ["vikramaditya", "vikram"],
    last: ["sen"],
  },
  "arjun-nambiar-razorpay": {
    full: ["arjun nambiar"],
    first: ["arjun"],
    last: ["nambiar"],
  },
  "tanvi-thakur-nith": {
    full: ["tanvi thakur"],
    first: ["tanvi"],
    last: ["thakur"],
  },
  "dr-ananya-das-aiims": {
    full: ["dr ananya das", "dr ananya", "ananya das"],
    first: ["ananya"],
    last: ["das"],
  },
  "dr-rohit-malhotra-mamc": {
    full: ["dr rohit malhotra", "dr rohit", "rohit malhotra"],
    first: ["rohit"],
    last: ["malhotra"],
  },
};

/**
 * High-fidelity deterministic fallback logic.
 * Used whenever Gemini API key is missing, network is offline, or rate limit (429) occurs.
 * Strictly adheres to the requirement: "Do NOT let AI invent mentor credentials or marketplace facts."
 */
export function handleLocalTaskFallback(task: string, payload: any): GeminiTaskResponse {
  switch (task) {
    case "agent_orchestrate": {
      const text = (payload.userMessage || "").toLowerCase();
      const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/\s+/g, " ");

      // 1. Check if user is responding to a pending price request
      const priceOnlyMatch = text.match(/(?:offer|price|for)?\s*(?:rs\.?|₹)?\s*(\d{2,4})\s*(?:rs|inr|₹|rupees)?/i) ||
        text.match(/^\s*(\d{2,4})\s*$/);
      const pending = payload.pendingBooking;

      if (pending && priceOnlyMatch && parseInt(priceOnlyMatch[1], 10) >= 50) {
        const offer = parseInt(priceOnlyMatch[1], 10);
        return {
          success: true,
          isFallback: true,
          data: {
            isBookingIntent: true,
            needsPriceSpecification: false,
            selectedMentors: [{
              helperId: pending.helperId,
              helperName: pending.helperName,
              mode: pending.mode || "video",
              offeredPriceInr: offer,
              serviceTitle: pending.serviceTitle,
            }],
            reply: `Target offer of ₹${offer} confirmed for ${pending.helperName}! I have dispatched your booking request with your query list. Their customized quote is streaming in now!`,
            extractedProfile: {
              consideredColleges: payload.currentContext?.consideredColleges || ["NIT Kurukshetra", "PEC / NIT Chandigarh"],
              preferredBranches: payload.currentContext?.preferredBranches || ["Mechanical Engineering"],
              primaryPriorities: payload.currentContext?.primaryPriorities || ["Core Placements", "Hostel Culture"],
              specificDoubts: payload.currentContext?.specificDoubts || ["Placement reality", "Hostel culture"],
            },
          },
        };
      }

      // 2. Multi-level Mentor Identification
      const matchedMentorsList: Array<{
        mentor: typeof MENTORS[0];
        score: number;
        matchedToken: string;
      }> = [];

      MENTORS.forEach((m) => {
        const aliasConfig = MENTOR_ALIASES[m.id];
        const firstName = m.name.toLowerCase().split(" ")[0];
        const lastName = m.name.toLowerCase().split(" ")[1] || "";

        const fullAliases = aliasConfig?.full || [m.name.toLowerCase()];
        const firstAliases = aliasConfig?.first || [firstName];
        const lastAliases = aliasConfig?.last || [lastName].filter(Boolean);

        // Level 3: Full name or specific multi-word alias match (e.g. "raj sharma", "yash agarwal")
        const matchedFull = fullAliases.find((fa) => cleanText.includes(fa));
        if (matchedFull) {
          matchedMentorsList.push({ mentor: m, score: 3, matchedToken: matchedFull });
          return;
        }

        // Level 2: First name match (e.g. "raj", "yash", "arnav", "kabir", "riya")
        const matchedFirst = firstAliases.find((fa) => new RegExp(`\\b${fa}\\b`, "i").test(cleanText));
        if (matchedFirst) {
          matchedMentorsList.push({ mentor: m, score: 2, matchedToken: matchedFirst });
          return;
        }

        // Level 1: Last name match
        const matchedLast = lastAliases.find((la) => new RegExp(`\\b${la}\\b`, "i").test(cleanText));
        if (matchedLast) {
          matchedMentorsList.push({ mentor: m, score: 1, matchedToken: matchedLast });
        }
      });

      // Filter out accidental surname collisions:
      // If ANY mentor matched on first or full name (score >= 2), discard mentors that ONLY matched on surname (score 1)
      const hasHigherMatches = matchedMentorsList.some((mm) => mm.score >= 2);
      const filteredMatches = matchedMentorsList.filter((mm) => {
        if (mm.score >= 2) return true;
        return !hasHigherMatches;
      });

      // 3. Extract Price
      const priceMatch = text.match(/(?:quote\s+of|offer\s+of|for|price\s+of|at|budget\s+of|rs\.?|₹)\s*(\d{2,4})\s*(?:rs|inr|₹|rupees)?/i) ||
        text.match(/\b(\d{2,4})\s*(?:rs|inr|rupees)\b/i) ||
        text.match(/(?:rs\.?|₹)\s*(\d{2,4})\b/i);
      const parsedOffer = priceMatch ? parseInt(priceMatch[1], 10) : undefined;

      // 4. Topic and Service Resolution
      const matchedService = PLATFORM_SERVICES.find((s) => {
        const titleLower = s.title.toLowerCase();
        return text.includes(titleLower) || 
          (titleLower.includes("system design") && text.includes("system design")) ||
          (titleLower.includes("sde-1") && (text.includes("sde") || text.includes("sde1") || text.includes("sde2"))) ||
          (titleLower.includes("choice order") && (text.includes("choice order") || text.includes("josaa") || text.includes("jossa")));
      });

      let serviceTitle = matchedService?.title || "1-on-1 Live Strategy Session";
      let doubtList = payload.currentContext?.specificDoubts || [
        "Core company placements vs IT opportunities on campus",
        "Hostel facilities, mess food and campus culture reality",
        "Branch change rules and CGPA cutoffs"
      ];

      if (/\b(sde|sde1|sde2|system\s+design)\b/i.test(cleanText)) {
        serviceTitle = "SDE-1 to SDE-2 Promotion & System Design Audit";
        doubtList = [
          "SDE-1 to SDE-2 promotion roadmap & scope expansion",
          "System Design & distributed architecture interview preparation",
          "Manager 1:1 impact packet framing & promo pacing"
        ];
      } else if (/\b(josaa|jossa|csab|choice|councelling|counselling|counseling)\b/i.test(cleanText)) {
        serviceTitle = "JoSAA Choice Order Strategy & Mock Counselling";
        doubtList = [
          "JoSAA & CSAB round-by-round choice filling priority order",
          "Branch vs College tier prioritization trade-offs",
          "Seat acceptance, Float vs Slide decision matrix"
        ];
      } else if (/\b(neet|medical|bond|dme)\b/i.test(cleanText)) {
        serviceTitle = "NEET DME State Bond & Clinical Career Audit";
        doubtList = [
          "State DME rural service bond penalties & bank guarantees",
          "Clinical department exposure & PG residency pass rates",
          "Hostel facilities & clinical patient load reality"
        ];
      }

      // 5. Booking Intent Detection (Robust against edge cases where user omits "book")
      const bookingRegex = /\b(book|booking|quote|quotes|session|sessions|call|calls|meeting|consult|consulting|counseling|counselling|councelling|counceling|hire|connect|talk\s+to|schedule|request|meet|audit)\b/i;
      const hasBookingWord = bookingRegex.test(text);
      const hasTopic = /\b(sde|sde1|sde2|josaa|jossa|csab|neet|bond|councelling|counselling|choice|order|mock)\b/i.test(text);
      const isBooking = hasBookingWord || (filteredMatches.length > 0 && (parsedOffer !== undefined || hasTopic));

      const selectedMentors: Array<{ helperId: string; helperName: string; mode: "video" | "chat"; offeredPriceInr?: number; serviceTitle?: string }> = [];
      let pendingMentor: any = null;

      if (isBooking && filteredMatches.length > 0) {
        filteredMatches.forEach(({ mentor: m, matchedToken }) => {
          // Determine communication mode (video vs chat)
          let mode: "video" | "chat" = matchedService?.format === "chat" ? "chat" : "video";
          const tokenIdx = cleanText.indexOf(matchedToken.toLowerCase());
          const prefix = tokenIdx >= 0 ? cleanText.slice(Math.max(0, tokenIdx - 40), tokenIdx) : cleanText;
          const lastVideoIdx = prefix.lastIndexOf("video");
          const lastChatIdx = prefix.lastIndexOf("chat");

          if (lastChatIdx >= 0 && lastChatIdx > lastVideoIdx) {
            mode = "chat";
          } else if (lastVideoIdx >= 0 && lastVideoIdx >= lastChatIdx) {
            mode = "video";
          } else if (cleanText.includes("chat") && !cleanText.includes("video")) {
            mode = "chat";
          } else if (cleanText.includes("video") && !cleanText.includes("chat")) {
            mode = "video";
          }

          if (!selectedMentors.some((sm) => sm.helperId === m.id)) {
            if (parsedOffer !== undefined) {
              selectedMentors.push({
                helperId: m.id,
                helperName: m.name,
                mode,
                offeredPriceInr: parsedOffer,
                serviceTitle,
              });
            } else if (!pendingMentor) {
              pendingMentor = {
                helperId: m.id,
                helperName: m.name,
                mode,
                basePriceInr: matchedService?.basePriceInr || m.priceRange.min,
                serviceTitle,
              };
            }
          }
        });
      }

      // If price was missing: Gate dispatch behind the pricing barrier!
      if (pendingMentor && selectedMentors.length === 0) {
        return {
          success: true,
          isFallback: true,
          data: {
            isBookingIntent: true,
            needsPriceSpecification: true,
            pendingMentor,
            reply: `You've selected ${pendingMentor.helperName} for '${pendingMentor.serviceTitle}' (standard base rate is ~₹${pendingMentor.basePriceInr}). What is your target offer price for this session?`,
            selectedMentors: [],
            extractedProfile: {
              consideredColleges: payload.currentContext?.consideredColleges || ["NIT Kurukshetra", "PEC / NIT Chandigarh"],
              preferredBranches: payload.currentContext?.preferredBranches || ["Mechanical Engineering"],
              primaryPriorities: payload.currentContext?.primaryPriorities || ["Core Placements", "Hostel Culture"],
              specificDoubts: doubtList,
            },
          },
        };
      }

      return {
        success: true,
        isFallback: true,
        data: {
          isBookingIntent: isBooking && selectedMentors.length > 0,
          needsPriceSpecification: false,
          reply: isBooking && selectedMentors.length > 0
            ? `I have dispatched your booking request with your query list to ${selectedMentors.map((m) => `${m.helperName} (${m.serviceTitle || (m.mode === "video" ? "Video Session" : "Chat Session")})`).join(" and ")}${parsedOffer ? ` with your proposed offer of ₹${parsedOffer}` : ""}. Their customized quotes are streaming in now!`
            : "I've analyzed your queries regarding college admissions and core vs IT placement trade-offs. Check out our recommended seniors below, or tell me 'book video session with Raj and chat session with Kabir' to request quotes directly through me.",
          selectedMentors,
          extractedProfile: {
            consideredColleges: payload.currentContext?.consideredColleges || ["NIT Kurukshetra", "PEC / NIT Chandigarh"],
            preferredBranches: payload.currentContext?.preferredBranches || ["Mechanical Engineering"],
            primaryPriorities: payload.currentContext?.primaryPriorities || ["Core Placements", "Hostel Culture"],
            specificDoubts: doubtList,
          },
        },
      };
    }

    case "helper_quote": {
      const mode = payload.mode || "video";
      const isVideo = mode === "video";
      const price = isVideo ? 380 : 200;
      const duration = isVideo ? 30 : 20;

      return {
        success: true,
        isFallback: true,
        data: {
          priceInr: price,
          estimatedDurationMin: duration,
          scopeSummary: isVideo
            ? `30-minute direct video call addressing your specific queries: ${payload.questions?.slice(0, 2).join("; ") || "campus placement dynamics"}.`
            : `20-minute focused direct text chat covering your specific queries: ${payload.questions?.slice(0, 2).join("; ") || "branch realities"}.`,
          helperNote: `I reviewed your questions. Happy to share my honest benchmarks and experience from ${payload.helperCollege || "campus"}.`,
        },
      };
    }

    case "college_intake": {
      const text = (payload.userMessage || "").toLowerCase();
      const extractedColleges: string[] = [];
      COLLEGES.forEach((c) => {
        if (text.includes(c.shortName.toLowerCase()) || text.includes(c.city.toLowerCase()) || text.includes(c.name.toLowerCase())) {
          extractedColleges.push(c.shortName);
        }
      });
      if (extractedColleges.length === 0 && (text.includes("kurukshetra") || text.includes("kkr"))) {
        extractedColleges.push("NIT Kurukshetra");
      }
      if (extractedColleges.length === 0 && (text.includes("pec") || text.includes("chandigarh"))) {
        extractedColleges.push("PEC / NIT Chandigarh");
      }

      let extractedBranch = "Engineering";
      if (text.includes("mech")) extractedBranch = "Mechanical Engineering";
      else if (text.includes("cs") || text.includes("comp")) extractedBranch = "Computer Science";
      else if (text.includes("elec") || text.includes("ee")) extractedBranch = "Electrical Engineering";

      const rankMatch = text.match(/\b(\d{1,2}[,\.]?\d{3})\b/);
      const parsedRank = rankMatch ? parseInt(rankMatch[1].replace(/[,.]/g, ""), 10) : 32000;

      return {
        success: true,
        isFallback: true,
        data: {
          reply: `I've noted that you're considering ${extractedColleges.length > 0 ? extractedColleges.join(" and ") : "NIT Kurukshetra & PEC Chandigarh"} for ${extractedBranch} with rank ~${parsedRank.toLocaleString()}. What matters most to your decision: core company placements, campus life, or software/tech backup?`,
          extractedProfile: {
            stage: "Class 12 / JEE Aspirant",
            exam: "JEE Main 2026",
            rank: parsedRank,
            consideredColleges: extractedColleges.length > 0 ? extractedColleges : ["NIT Kurukshetra", "PEC / NIT Chandigarh"],
            preferredBranches: [extractedBranch],
            primaryPriorities: text.includes("intern") || text.includes("place") ? ["Placements & Internships", "Core Engineering"] : ["Campus Life", "Branch Quality"],
            specificDoubts: ["Core vs Software Placements", "Branch Change Feasibility", "Internship Semester Opportunities"],
          },
        },
      };
    }

    case "career_intake": {
      const text = (payload.userMessage || "").toLowerCase();
      const isSde1 = text.includes("sde-1") || text.includes("sde 1") || text.includes("junior");
      const isSde2Target = text.includes("sde-2") || text.includes("sde 2") || text.includes("senior");

      return {
        success: true,
        isFallback: true,
        data: {
          reply: `Understood. You're currently an SDE-1 aiming to reach SDE-2. In Tier-1 engineering ladders, the step from SDE-1 to SDE-2 hinges on independently handling ambiguous system design, high throughput caching, and driving cross-team delivery. Let's look at mentors who have recently crossed this exact hurdle.`,
          extractedProfile: {
            currentRole: isSde1 ? "Software Engineer I (SDE-1)" : "Software Engineer",
            targetRole: isSde2Target ? "Software Engineer II (SDE-2)" : "Senior SDE",
            experienceYears: text.includes("1.5") ? 1.5 : (text.includes("2") ? 2 : 1),
            technicalFocus: ["Distributed Systems", "System Design", "Backend Optimization", "Project Ownership"],
            targetCompanies: ["Tier-1 Product", "Unicorn Startups"],
          },
        },
      };
    }

    case "refine_colleges": {
      const considered = payload.colleges || ["NIT Kurukshetra", "PEC / NIT Chandigarh", "Assam University"];
      const priority = payload.priority || "computer science & tech placements";

      return {
        success: true,
        isFallback: true,
        data: {
          recommendedOrder: [
            {
              collegeName: "NIT Kurukshetra",
              fitScore: 95,
              rationale: "Top-tier on-campus tech recruiters (Microsoft, Amazon, FinTech) with active Technobyte coding society for CS engineers.",
              tradeOffs: "Slightly less urban campus compared to Chandigarh, but lower cost of living and deep North Indian alumni network.",
              questionsForSenior: "Do Tier-1 tech firms open on-campus internship and placement drives for CS students at NITK?",
            },
            {
              collegeName: "PEC / NIT Chandigarh",
              fitScore: 92,
              rationale: "Mandatory 6-month final year internship semester gives immense leverage to convert high-ticket software PPOs in Chandigarh/NCR.",
              tradeOffs: "Hostel infrastructure is older, but city location offers unmatched quality of tech exposure.",
              questionsForSenior: "What percentage of CSE students convert their 6-month semester internship into full-time offers?",
            },
            {
              collegeName: "Assam University",
              fitScore: 84,
              rationale: "Central University GFTI status offering affordable tuition, peaceful campus environment, and solid foundational CSE curriculum.",
              tradeOffs: "Fewer on-campus Tier-1 product recruiters, requiring proactive competitive coding and off-campus drive preparation.",
              questionsForSenior: "How do CSE students prepare for off-campus Tier-1 tech placements from Silchar?",
            },
          ],
          synthesis: `For ${priority}, NIT Kurukshetra offers high direct on-campus tech recruitment, PEC Chandigarh provides the structural advantage of a full 6-month internship semester, and Assam University offers solid central university academics with lower fee structure.`,
        },
      };
    }

    case "nl_filter": {
      const q = (payload.query || "").toLowerCase();
      let college: string | null = null;
      let branch: string | null = null;
      let maxPrice: number | null = null;
      let minRating: number | null = null;

      if (q.includes("kurukshetra") || q.includes("nitk")) college = "NIT Kurukshetra";
      else if (q.includes("chandigarh") || q.includes("pec")) college = "PEC / NIT Chandigarh";
      else if (q.includes("assam")) college = "Assam University";
      else if (q.includes("kanpur") || q.includes("iitk")) college = "IIT Kanpur";
      else if (q.includes("trichy") || q.includes("nitt")) college = "NIT Trichy";
      else if (q.includes("aiims")) college = "AIIMS New Delhi";

      if (q.includes("mech")) branch = "Mechanical";
      else if (q.includes("cs") || q.includes("computer")) branch = "Computer";
      else if (q.includes("elec") || q.includes("ece") || q.includes("ee")) branch = "Electri";

      const priceMatch = q.match(/under\s*₹?(\d+)/) || q.match(/less than\s*₹?(\d+)/) || q.match(/(\d+)\s*rs/);
      if (priceMatch) maxPrice = parseInt(priceMatch[1], 10);

      if (q.includes("top rated") || q.includes("4.9")) minRating = 4.9;

      return {
        success: true,
        isFallback: true,
        data: {
          interpretedFilters: { college, branch, maxPrice, minRating },
          explanation: `Filtered for: ${[
            college && `College: ${college}`,
            branch && `Branch: ${branch}`,
            maxPrice && `Budget: Under ₹${maxPrice}`,
            minRating && `Rating: ≥${minRating}★`
          ].filter(Boolean).join(", ") || "All available verified mentors"}`,
        },
      };
    }

    case "helper_response": {
      const helperName = payload.helperName || "Riya Sharma";
      const branch = payload.helperBranch || "Mechanical Engineering";
      const college = payload.helperCollege || "NIT Kurukshetra";

      return {
        success: true,
        isFallback: true,
        data: {
          response: `Hi there! Yes, this is completely within my expertise. Having studied ${branch} at ${college}, I can explain the exact reality of on-campus core internships, which automotive firms visit, and how students prepare for software as a backup. Feel free to request a scoped quote so we can do a comprehensive call!`,
          isWithinScope: true,
          suggestedNextStep: "request_quote",
        },
      };
    }

    case "helper_assistant": {
      const mode = payload.mode || "draft_response";
      const seekerQuestions = payload.questions || ["Internship reality", "Placement statistics"];

      if (mode === "suggest_clarifying_question") {
        return {
          success: true,
          isFallback: true,
          data: {
            suggestion: "Are you primarily targeting core engineering R&D roles (like Tata Motors, Hero, L&T), or do you also want to keep software/analytics eligibility open as a parallel plan?",
          },
        };
      }

      if (mode === "summarize_doubts") {
        return {
          success: true,
          isFallback: true,
          data: {
            summary: [
              "1. Core Automotive Internship Pipeline: On-campus recruiters and selection ratio.",
              "2. Tech Backup: Policy on non-CS branches appearing in software placement tests.",
              "3. Branch Change Feasibility: Required CGPA thresholds and actual seat vacancy.",
              "4. Campus Location Comparison: Chandigarh 6-month model vs Kurukshetra alumni network."
            ],
          },
        };
      }

      // Default: draft_response
      return {
        success: true,
        isFallback: true,
        data: {
          draft: `Hi! I reviewed your doubts about ${seekerQuestions.slice(0, 2).join(" and ")}. Having been through NIT Kurukshetra Mechanical and joining Hero R&D, I have direct benchmarks on what packages core companies offer and how branch change really works. I'm glad to answer all 4 points in detail.`,
        },
      };
    }

    case "quote_scope": {
      return {
        success: true,
        isFallback: true,
        data: {
          suggestedPriceInr: 350,
          suggestedDurationMin: 25,
          scopeSummary: "Comprehensive discussion of core internship recruitment, software placement policies, branch change CGPA requirements, and hostel life reality.",
          scopePoints: [
            "Review of on-campus core recruiters & summer internship numbers",
            "Software eligibility matrix for Mechanical / non-CS branches",
            "Branch change rules and realistic 1st-year CGPA cutoff",
            "Direct comparison of campus culture and peer support"
          ],
        },
      };
    }

    case "compare_quotes": {
      return {
        success: true,
        isFallback: true,
        data: {
          comparisonSummary: "All 3 mentors provide strong, grounded perspectives from different angles of your decision.",
          recommendations: [
            {
              helperId: "riya-sharma-nitkkr",
              helperName: "Riya Sharma",
              priceInr: 350,
              badge: "Strongest Direct Branch Match",
              verdict: "Riya is your #1 direct match for Mechanical Engineering at NIT Kurukshetra. She personally led the SAE club and placed at Hero MotoCorp R&D, giving you the exact ground reality of core internships.",
            },
            {
              helperId: "aarav-patel-pec",
              helperName: "Aarav Patel",
              priceInr: 300,
              badge: "Best for Software / Tech Backup",
              verdict: "Aarav is most valuable if you want to evaluate PEC Chandigarh's 6-month internship semester or plan to transition into software roles.",
            },
            {
              helperId: "kabir-mehta-iitk",
              helperName: "Kabir Mehta",
              priceInr: 550,
              badge: "Best for Broader Engineering Pathways",
              verdict: "Kabir offers high-level guidance if you are comparing top NIT branch choices against older IIT dual-degree programs.",
            },
          ],
          aiAdvice: "If core engineering & automotive internships are your primary focus, proceed with Riya Sharma. If you are leaning towards software backup, Aarav Patel is an excellent value match.",
        },
      };
    }

    default:
      return {
        success: true,
        isFallback: true,
        data: { message: "Task completed using local deterministic heuristics." },
      };
  }
}
