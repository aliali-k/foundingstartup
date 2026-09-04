import { MENTORS, type MentorProfile } from "@/data/mentors";
import { COLLEGES } from "@/data/colleges";
import { CAREER_ROLES } from "@/data/careerRoles";

export interface MatchScoreResult {
  mentor: MentorProfile;
  score: number; // 0 to 100
  matchPercentage: number;
  highlightReasons: string[];
  careerLevelFit: "higher_level" | "same_level" | "lower_level" | "college_mentor";
}

export interface CollegeMatchCriteria {
  collegeNames?: string[];
  branch?: string;
  concerns?: string[];
  serviceId?: string;
}

export interface CareerMatchCriteria {
  currentRoleTitle?: string;
  targetRoleTitle?: string;
  experienceYears?: number;
  technicalFocus?: string[];
  serviceId?: string;
}

/**
 * Deterministic scoring algorithm for College Guidance.
 * Factors:
 * - College match (up to 30 pts)
 * - Branch match (up to 20 pts)
 * - Specific doubts / topics (up to 20 pts)
 * - Experience / Alum vs Student (up to 15 pts)
 * - Supported service (5 pts)
 * - Availability (5 pts)
 * - Rating / Reputation (5 pts)
 */
export function matchMentorsForCollege(criteria: CollegeMatchCriteria): MatchScoreResult[] {
  const normColleges = (criteria.collegeNames || []).map((c) => c.toLowerCase().trim());
  const normBranch = (criteria.branch || "").toLowerCase().trim();
  const normConcerns = (criteria.concerns || []).map((t) => t.toLowerCase().trim());

  return MENTORS.map((m) => {
    let score = 30; // base score for active quality
    const reasons: string[] = [];

    // College match
    const mentorCollegeNorm = m.collegeName.toLowerCase();
    const isCollegeMatch = normColleges.some((c) => mentorCollegeNorm.includes(c) || c.includes(m.collegeId));
    if (isCollegeMatch) {
      score += 28;
      reasons.push(`✓ Alum / Senior from ${m.collegeName}`);
    } else if (normColleges.length === 0) {
      score += 15;
    }

    // Branch match
    const mentorBranchNorm = m.branch.toLowerCase();
    if (normBranch && (mentorBranchNorm.includes(normBranch) || normBranch.includes(mentorBranchNorm))) {
      score += 20;
      reasons.push(`✓ Direct branch match: ${m.branch}`);
    } else if (mentorBranchNorm.includes("computer") || mentorBranchNorm.includes("electrical")) {
      score += 8;
    }

    // Concerns / Topics match
    let topicHits = 0;
    const mentorTopics = m.topics.map((t) => t.toLowerCase()).concat(m.tags.map((tg) => tg.toLowerCase()));
    for (const concern of normConcerns) {
      if (mentorTopics.some((mt) => mt.includes(concern) || concern.includes(mt))) {
        topicHits += 1;
      }
    }
    if (topicHits > 0) {
      const topicScore = Math.min(18, topicHits * 7);
      score += topicScore;
      reasons.push(`✓ Experienced in your key topics (${topicHits} matched)`);
    }

    // Service match
    if (criteria.serviceId && m.supportedServiceIds.includes(criteria.serviceId)) {
      score += 5;
    }

    // Availability
    if (m.availability === "Available Today") {
      score += 5;
      reasons.push("✓ Available today for fast scope chat");
    } else {
      score += 2;
    }

    // Reputation
    if (m.rating >= 4.9) {
      score += 5;
      reasons.push(`✓ Rated ${m.rating.toFixed(2)} (${m.sessionsCount}+ students helped)`);
    } else {
      score += 3;
    }

    const clamped = Math.min(99, Math.max(45, Math.round(score)));

    return {
      mentor: m,
      score: clamped,
      matchPercentage: clamped,
      highlightReasons: reasons.length > 0 ? reasons : m.highlightMatchReasons,
      careerLevelFit: "college_mentor",
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * Deterministic scoring for Career Guidance.
 * Strict Rule: A helper should normally be ahead of the seeker in the target direction.
 * E.g. Seeker: SDE-1 -> Target: SDE-2.
 * Prioritize: SDE-2 (Level 3), Senior SDE (Level 4), Staff (Level 5).
 * Deprioritize: Student, Intern, Fresher, SDE-1.
 */
export function matchMentorsForCareer(criteria: CareerMatchCriteria): MatchScoreResult[] {
  // Determine seeker's level
  const currentRoleObj = CAREER_ROLES.find(
    (r) => r.title.toLowerCase().includes((criteria.currentRoleTitle || "").toLowerCase()) ||
           (criteria.currentRoleTitle || "").toLowerCase().includes(r.id)
  ) || CAREER_ROLES[1]; // default SDE-1 (level 2)

  const seekerLevel = currentRoleObj.level;

  return MENTORS.map((m) => {
    let score = 25;
    const reasons: string[] = [];
    let fitType: "higher_level" | "same_level" | "lower_level" | "college_mentor" = "college_mentor";

    // Approximate mentor's career level based on role & company
    let mentorLevel = 1;
    if (m.currentRole.toLowerCase().includes("staff") || m.currentRole.toLowerCase().includes("principal")) {
      mentorLevel = 5;
    } else if (m.currentRole.toLowerCase().includes("senior") || m.currentRole.toLowerCase().includes("sde-3") || m.experienceYears >= 5) {
      mentorLevel = 4;
    } else if (m.currentRole.toLowerCase().includes("sde-2") || m.currentRole.toLowerCase().includes("ii") || m.experienceYears >= 3) {
      mentorLevel = 3;
    } else if (m.currentRole.toLowerCase().includes("sde-1") || m.currentRole.toLowerCase().includes("engineer") || m.experienceYears >= 1) {
      mentorLevel = 2;
    }

    // Career level delta check
    if (mentorLevel > seekerLevel) {
      score += 35;
      fitType = "higher_level";
      reasons.push(`✓ Senior role: ${m.currentRole} at ${m.currentCompany || "Tier-1 Tech"}`);
      reasons.push(`✓ Directly ahead on the target career path (+${mentorLevel - seekerLevel} levels)`);
    } else if (mentorLevel === seekerLevel) {
      score += 10;
      fitType = "same_level";
      reasons.push(`= Peer level: ${m.currentRole}`);
    } else {
      score -= 20; // penalize lower level
      fitType = "lower_level";
    }

    // Technical focus / topics match
    const normFocus = (criteria.technicalFocus || []).map((f) => f.toLowerCase());
    const mentorTokens = m.topics.concat(m.tags).map((t) => t.toLowerCase());
    let techHits = 0;
    for (const f of normFocus) {
      if (mentorTokens.some((t) => t.includes(f))) techHits++;
    }
    if (techHits > 0) {
      score += Math.min(20, techHits * 10);
      reasons.push(`✓ Hands-on expertise in ${criteria.technicalFocus?.slice(0, 2).join(", ")}`);
    }

    // Company tier bonus
    if (m.companyType === "FAANG/MNC" || m.companyType === "Unicorn/Startup") {
      score += 10;
      reasons.push(`✓ Proven experience at ${m.currentCompany}`);
    }

    // Experience years
    if (m.experienceYears >= 3) {
      score += 5;
    }

    // Reputation
    if (m.rating >= 4.9) {
      score += 5;
      reasons.push(`✓ Top rated mentor (${m.rating.toFixed(2)} ★ · ${m.sessionsCount}+ sessions)`);
    }

    const clamped = Math.min(99, Math.max(30, Math.round(score)));

    return {
      mentor: m,
      score: clamped,
      matchPercentage: clamped,
      highlightReasons: reasons.length > 0 ? reasons : m.highlightMatchReasons,
      careerLevelFit: fitType,
    };
  }).sort((a, b) => b.score - a.score);
}
