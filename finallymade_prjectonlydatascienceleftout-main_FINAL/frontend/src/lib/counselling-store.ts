import { SEED_REQUESTS, SEED_CHAT_MESSAGES, type CounsellingRequest, type ReceivedQuote, type ChatMessage, type PlatformReview } from "@/data/seedData";
import { MENTORS, type MentorProfile } from "@/data/mentors";

const REQS_KEY = "josaa.counselling.requests";
const CHATS_KEY = "josaa.counselling.chats";
const REVIEWS_KEY = "josaa.counselling.reviews";
const SESSIONS_KEY = "josaa.counselling.sessions";
const HELPER_STATUS_KEY = "josaa.counselling.helperStatus";

export interface SimulatedSession {
  id: string;
  requestId: string;
  helperId: string;
  helperName: string;
  serviceTitle: string;
  amountPaidInr: number;
  durationMin: number;
  status: "active" | "completed" | "cancelled";
  startedAt: string;
  notes: string[];
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// ── Requests API ──
export function getAllRequests(): CounsellingRequest[] {
  return loadFromStorage<CounsellingRequest[]>(REQS_KEY, SEED_REQUESTS);
}

export function getRequestById(id: string): CounsellingRequest | undefined {
  const reqs = getAllRequests();
  return reqs.find((r) => r.id === id);
}

export function saveRequest(req: CounsellingRequest) {
  const reqs = getAllRequests();
  const idx = reqs.findIndex((r) => r.id === req.id);
  if (idx >= 0) {
    reqs[idx] = req;
  } else {
    reqs.unshift(req);
  }
  saveToStorage(REQS_KEY, reqs);
}

// ── Chats API ──
export function getChatMessages(requestId: string): ChatMessage[] {
  const allChats = loadFromStorage<Record<string, ChatMessage[]>>(CHATS_KEY, SEED_CHAT_MESSAGES);
  return allChats[requestId] || [];
}

export function appendChatMessage(requestId: string, msg: ChatMessage) {
  const allChats = loadFromStorage<Record<string, ChatMessage[]>>(CHATS_KEY, SEED_CHAT_MESSAGES);
  const list = allChats[requestId] || [];
  list.push(msg);
  allChats[requestId] = list;
  saveToStorage(CHATS_KEY, allChats);
}

// ── Multi-Mentor Broadcast ──
export function broadcastRequestToMentors(requestId: string, targetMentorIds: string[]): CounsellingRequest | undefined {
  const req = getRequestById(requestId);
  if (!req) return undefined;

  const currentSent = new Set(req.sentToHelperIds);
  targetMentorIds.forEach((id) => currentSent.add(id));
  req.sentToHelperIds = Array.from(currentSent);

  // Generate mock quotes for any newly added helpers that haven't quoted yet
  targetMentorIds.forEach((helperId) => {
    const existing = req.receivedQuotes.find((q) => q.helperId === helperId);
    if (!existing) {
      const helper = MENTORS.find((m) => m.id === helperId);
      if (helper) {
        const price = Math.round((helper.priceRange.min + helper.priceRange.max) / 2);
        req.receivedQuotes.push({
          id: `quote-${helperId}-${Date.now()}`,
          requestId: req.id,
          helperId: helper.id,
          helperName: helper.name,
          helperRole: `${helper.currentRole} (${helper.collegeName})`,
          helperCollege: helper.collegeName,
          serviceId: req.requestedServiceId || "college-branch-deep-dive",
          serviceTitle: "Tailored 1-on-1 Strategy Session",
          priceInr: price,
          estimatedDurationMin: 25,
          scopeSummary: `Full answers for your ${req.questions.length || 3} questions, covering ${helper.branch} realities, placement data, and internship strategies.`,
          helperNote: `I reviewed your questions. Ready to discuss trade-offs and provide direct benchmarks.`,
          status: "sent",
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  req.status = "quoted";
  saveRequest(req);
  return req;
}

// ── Quote Acceptance ──
export function acceptQuote(requestId: string, quoteId: string): { request: CounsellingRequest; session: SimulatedSession } | null {
  const req = getRequestById(requestId);
  if (!req) return null;

  const quote = req.receivedQuotes.find((q) => q.id === quoteId);
  if (!quote) return null;

  req.receivedQuotes.forEach((q) => {
    if (q.id === quoteId) q.status = "accepted";
    else q.status = "declined";
  });

  req.status = "accepted";
  req.activeHelperId = quote.helperId;
  saveRequest(req);

  // Create simulated paid session
  const session: SimulatedSession = {
    id: `sess-${Date.now()}`,
    requestId: req.id,
    helperId: quote.helperId,
    helperName: quote.helperName,
    serviceTitle: quote.serviceTitle,
    amountPaidInr: quote.priceInr,
    durationMin: quote.estimatedDurationMin,
    status: "active",
    startedAt: new Date().toISOString(),
    notes: [
      `Session booked for ₹${quote.priceInr} (${quote.estimatedDurationMin} mins).`,
      `Agreed scope: ${quote.scopeSummary}`,
      `Candidate: ${req.seekerName} · Target: ${req.title}`
    ],
  };

  const sessions = loadFromStorage<SimulatedSession[]>(SESSIONS_KEY, []);
  sessions.unshift(session);
  saveToStorage(SESSIONS_KEY, sessions);

  return { request: req, session };
}

// ── Sessions API ──
export function getSessionById(sessionId: string): SimulatedSession | undefined {
  const sessions = loadFromStorage<SimulatedSession[]>(SESSIONS_KEY, []);
  return sessions.find((s) => s.id === sessionId);
}

export function completeSession(sessionId: string) {
  const sessions = loadFromStorage<SimulatedSession[]>(SESSIONS_KEY, []);
  const sess = sessions.find((s) => s.id === sessionId);
  if (sess) {
    sess.status = "completed";
    saveToStorage(SESSIONS_KEY, sessions);

    const req = getRequestById(sess.requestId);
    if (req) {
      req.status = "completed";
      saveRequest(req);
    }
  }
}

// ── Reviews & Helper Reputation API ──
export function submitReview(review: Omit<PlatformReview, "id" | "createdAt">): PlatformReview {
  const newReview: PlatformReview = {
    ...review,
    id: `rev-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const allReviews = loadFromStorage<PlatformReview[]>(REVIEWS_KEY, []);
  allReviews.unshift(newReview);
  saveToStorage(REVIEWS_KEY, allReviews);

  // Update mentor's mock stats in memory
  const mentor = MENTORS.find((m) => m.id === review.helperId);
  if (mentor) {
    mentor.sessionsCount += 1;
    mentor.reviewCount += 1;
    mentor.rating = Number((((mentor.rating * (mentor.reviewCount - 1)) + review.rating) / mentor.reviewCount).toFixed(2));
  }

  return newReview;
}

export function getReviewsForHelper(helperId: string): PlatformReview[] {
  const allReviews = loadFromStorage<PlatformReview[]>(REVIEWS_KEY, []);
  return allReviews.filter((r) => r.helperId === helperId);
}

// ── Helper Desk Mode ──
export function getHelperStatus(): "AVAILABLE" | "OFFLINE" {
  return loadFromStorage<"AVAILABLE" | "OFFLINE">(HELPER_STATUS_KEY, "AVAILABLE");
}

export function setHelperStatus(status: "AVAILABLE" | "OFFLINE") {
  saveToStorage(HELPER_STATUS_KEY, status);
}

// ── Reset to Demo Seed ──
export function resetDemoState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REQS_KEY);
  localStorage.removeItem(CHATS_KEY);
  localStorage.removeItem(REVIEWS_KEY);
  localStorage.removeItem(SESSIONS_KEY);
  localStorage.removeItem(HELPER_STATUS_KEY);
}
