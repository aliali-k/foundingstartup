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

export interface AgentMentorBooking {
  helperId: string;
  helperName: string;
  mode: "video" | "chat";
  offeredPriceInr?: number;
}

// ── Quote Arrival Event Bus ──
type QuoteListener = (quote: ReceivedQuote, requestId: string) => void;
const quoteListeners: Set<QuoteListener> = new Set();

export function onQuoteReceived(listener: QuoteListener) {
  quoteListeners.add(listener);
  return () => {
    quoteListeners.delete(listener);
  };
}

// ── Agent-Mediated Multi-Mentor Request Dispatch ──
export function createAgentBookingRequest({
  existingRequestId,
  seekerName = "Candidate",
  title = "JoSAA / NEET College & Branch Guidance",
  questions = [],
  mentorBookings = [],
  context = {},
}: {
  existingRequestId?: string;
  seekerName?: string;
  title?: string;
  questions: string[];
  mentorBookings: AgentMentorBooking[];
  context?: any;
}): CounsellingRequest {
  const existingReq = existingRequestId ? getRequestById(existingRequestId) : undefined;
  const targetReq: CounsellingRequest = existingReq || {
    id: `req-agent-${Date.now()}`,
    seekerId: "seeker-demo-user",
    seekerName,
    seekerType: "class_12_jee",
    title,
    category: "college_guidance",
    rawText: "",
    normalizedSummary: "",
    context: {
      consideredColleges: context.consideredColleges || ["NIT Kurukshetra", "PEC / NIT Chandigarh", "Assam University"],
      preferredBranches: context.preferredBranches || ["Computer Science"],
      primaryConcerns: questions,
      rank: context.rank || 7207,
      exam: context.exam || "JEE Main 2026",
    },
    questions: questions.length > 0 ? questions : [
      "Core company placements vs IT opportunities on campus",
      "Hostel facilities, mess food and campus culture reality",
      "Branch change rules and CGPA cutoffs"
    ],
    requestedServiceId: "college-branch-deep-dive",
    preferredFormat: mentorBookings.some((m) => m.mode === "video") ? "call" : "chat",
    sentToHelperIds: [],
    receivedQuotes: [],
    status: "open",
    createdAt: new Date().toISOString(),
  };

  // Merge questions
  if (questions.length > 0) {
    const combined = Array.from(new Set([...targetReq.questions, ...questions]));
    targetReq.questions = combined;
  }

  // Merge sentToHelperIds
  const helperIdSet = new Set(targetReq.sentToHelperIds);
  mentorBookings.forEach((b) => helperIdSet.add(b.helperId));
  targetReq.sentToHelperIds = Array.from(helperIdSet);

  // Update summary & text
  targetReq.rawText = `Agent request with ${targetReq.questions.length} queries dispatched to ${targetReq.sentToHelperIds.length} mentors.`;
  targetReq.normalizedSummary = `Doubts regarding: ${targetReq.questions.slice(0, 3).join("; ")}. Booked via AI Agent.`;

  saveRequest(targetReq);

  // Progressive simulated helper quote arrival with realistic negotiation
  // Only dispatch simulated responses for new bookings or updated offers
  mentorBookings.forEach((booking, index) => {
    const helper = MENTORS.find((m) => m.id === booking.helperId);
    if (!helper) return;

    // Check if this helper already quoted in this request
    const existingQuoteIndex = targetReq.receivedQuotes.findIndex((q) => q.helperId === booking.helperId);

    // Stagger arrival time: first new one fast, subsequent ones progressive
    const delayMs = index === 0 ? 500 : (index * 1400 + 400);

    setTimeout(() => {
      const isVideo = booking.mode === "video";
      const standardBasePrice = isVideo 
        ? Math.round(helper.priceRange.min * 1.15) 
        : Math.round(helper.priceRange.min * 0.7);

      let finalPrice = Math.max(150, Math.round(standardBasePrice / 10) * 10);
      let helperNote = `Hi ${seekerName}! I reviewed your doubts regarding ${helper.collegeName}. Ready to share verified campus data and realistic trade-offs.`;

      // If seeker offered a custom target price (e.g. ₹300 when mentor base is ₹350)
      if (booking.offeredPriceInr && booking.offeredPriceInr > 0) {
        const offer = booking.offeredPriceInr;
        if (offer >= standardBasePrice) {
          finalPrice = offer;
          helperNote = `Hi ${seekerName}! I accepted your proposed quote of ₹${offer}. Looking forward to our ${isVideo ? "video meeting" : "chat session"} to solve your doubts!`;
        } else {
          const counter = Math.round((standardBasePrice + offer) / 20) * 10;
          finalPrice = Math.max(offer, counter);
          helperNote = `Hi ${seekerName}! I saw your offered request of ₹${offer}. I can meet you at ₹${finalPrice} for a dedicated ${isVideo ? "30-min video strategy session" : "20-min direct chat"} to cover your queries.`;
        }
      }

      const durationMin = isVideo ? 30 : 20;

      const newQuote: ReceivedQuote = {
        id: `quote-${helper.id}-${Date.now()}`,
        requestId: targetReq.id,
        helperId: helper.id,
        helperName: helper.name,
        helperRole: `${helper.currentRole} (${helper.collegeName})`,
        helperCollege: helper.collegeName,
        serviceId: isVideo ? "1-on-1-video-strategy" : "focused-chat-qa",
        serviceTitle: isVideo ? "1-on-1 Video Strategy Session" : "Focused Q&A Chat Session",
        communicationMode: booking.mode,
        offeredPriceInr: booking.offeredPriceInr,
        priceInr: finalPrice,
        estimatedDurationMin: durationMin,
        scopeSummary: isVideo
          ? `30-min live video session resolving your specific queries: ${targetReq.questions.slice(0, 2).join("; ")}.`
          : `20-min focused direct text chat covering your queries: ${targetReq.questions.slice(0, 2).join("; ")}.`,
        helperNote,
        status: "sent",
        createdAt: new Date().toISOString(),
      };

      const freshReq = getRequestById(targetReq.id);
      if (freshReq) {
        if (existingQuoteIndex >= 0) {
          // Replace or update existing quote for this mentor
          freshReq.receivedQuotes[existingQuoteIndex] = newQuote;
        } else {
          // Append new quote alongside previous quotes!
          freshReq.receivedQuotes.push(newQuote);
        }
        freshReq.status = "quoted";
        saveRequest(freshReq);
      }

      // Broadcast to UI listeners
      quoteListeners.forEach((fn) => fn(newQuote, targetReq.id));
    }, delayMs);
  });

  return targetReq;
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
