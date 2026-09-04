# JoSAA Predictor & Counselling Marketplace POC

> **Editorial Data Dashboard + Intelligent 1-on-1 Counselling Marketplace**  
> An end-to-end proof-of-concept combining deterministic JoSAA rank cutoffs, verified mentor profiles, and real server-side Gemini AI reasoning.

---

## 1. Product Concept & Philosophy

The product connects students and career-switchers who need guidance with seniors, alumni, and working professionals who have already navigated that exact path.

### The Core Loop
```
USER PROBLEM / DOUBT
      ↓
AI UNDERSTANDS (Gemini Conversational Intake)
      ↓
STRUCTURED SEEKER PROFILE
      ↓
DETERMINISTIC MATCHING (College / Branch / Level Gap)
      ↓
FREE PRE-SESSION CHAT (Scope & Fit Verification)
      ↓
SCOPE-BASED QUOTE
      ↓
AI MULTI-MENTOR BROKER ("Broadcast to 3 matching mentors?")
      ↓
RESPONSE & QUOTE COMPARISON (Gemini Comparative Reasoning)
      ↓
SEEKER CHOOSES & CONFIRMS SIMULATED PAYMENT
      ↓
SIMULATED 1-ON-1 SESSION (Chat, Shared Notes, Mock Video)
      ↓
REVIEW & RATINGS (Feeds helper reputation loop)
```

---

## 2. Key Features

- **Editorial UI/UX**: Matches the visual design of the existing JoSAA predictor (Inter/JetBrains Mono typography, 1px borders, subtle glows, pastel accents, and high data density).
- **Hard-Coded Deterministic Facts**: 12 premier institutions, 16 varied simulated mentors (clearly marked with `DEMO PROFILE / SIMULATED HELPER`), and 10 career progression levels. AI never invents mentor credentials or marketplace facts.
- **Server-Side Gemini Integration**:
  - Live AI intake & intent extraction
  - College list trade-off refinement
  - Natural-language search filter interpretation
  - Helper-side response drafting & question clustering
  - Multi-quote comparison and neutral recommendation synthesis
  - Zero client-side API key leakage
- **High-Fidelity Deterministic Fallback**: Automatic, graceful fallback if `GEMINI_API_KEY` is not provided, network is offline, or Gemini rate-limits (HTTP 429). The app never crashes.
- **Level-Gated Career Matching Rule**: For career switchers (e.g. SDE-1 $\to$ SDE-2), the system strictly prioritizes mentors who are higher level (Level 3 SDE-2, Level 4 Senior SDE, Level 5 Staff), deprioritizing freshers and peers.
- **Multi-Mentor Broadcast & Quote Comparison**: Reusable normalized request object sent to multiple matching helpers to compare scope, duration, and pricing side-by-side.

---

## 3. Directory Structure

```
finallymade_prjectonlydatascienceleftout-main_FINAL/
├── frontend/
│   ├── src/
│   │   ├── data/                          # Hard-coded deterministic datasets
│   │   │   ├── colleges.ts                # 12 verified colleges & culture data
│   │   │   ├── mentors.ts                 # 16 simulated mentor profiles
│   │   │   ├── careerRoles.ts             # 10 career roles with progression levels
│   │   │   ├── services.ts                # 5 structured service definitions
│   │   │   └── seedData.ts                # Demo requests, quotes, chats, reviews
│   │   ├── lib/
│   │   │   ├── gemini-client.ts           # Client abstraction with automatic fallback
│   │   │   ├── gemini-fallback.ts         # High-fidelity deterministic fallback logic
│   │   │   ├── matching-engine.ts         # Scoring engine & career progression rule
│   │   │   └── counselling-store.ts       # Reactive store for chats, quotes, sessions
│   │   ├── server/
│   │   │   ├── gemini-handler.ts          # Server-side Gemini API caller
│   │   │   └── gemini-vite-plugin.ts      # Vite middleware serving /api/counselling/gemini
│   │   ├── components/counselling/
│   │   │   ├── CounsellingHeader.tsx      # Header with role switcher & reset button
│   │   │   ├── DemoModeBanner.tsx         # 1-click test launches for demo scenarios
│   │   │   ├── SeekerIntakeChat.tsx       # Chat intake + live Understood panel
│   │   │   ├── CollegeRefineModal.tsx     # Gemini college trade-off analysis
│   │   │   ├── MentorCard.tsx             # Compact editorial mentor card
│   │   │   ├── MentorFilterBar.tsx        # NL search bar + facet filters
│   │   │   ├── FreeChatDrawer.tsx         # Free pre-session fit check drawer
│   │   │   ├── MultiMentorModal.tsx       # Reusable request broadcast modal
│   │   │   ├── QuoteComparisonGrid.tsx    # Multi-quote comparison + AI advice
│   │   │   ├── SimulatedSessionPanel.tsx  # Video/Chat/Shared Notes session view
│   │   │   ├── SessionReviewModal.tsx     # 5-star review modal updating mentor stats
│   │   │   └── HelperDeskDashboard.tsx    # Mentor Desk with AI drafting assistant
│   │   └── routes/
│   │       ├── index.tsx                  # JoSAA Predictor Landing (CTA connected)
│   │       ├── predict.tsx                # Existing form & reality counters
│   │       ├── processing.tsx             # Cinematic solar system + ResultDashboard
│   │       ├── connectivity.tsx           # Redirects to /counselling
│   │       ├── counselling.tsx            # Seeker Home (Hero, Mode cards, JoSAA strip)
│   │       ├── counselling.college.tsx    # College Guidance intake & matching
│   │       ├── counselling.career.tsx     # Career Guidance level-gap flow
│   │       ├── counselling.compare.tsx    # Multi-quote comparison view
│   │       ├── counselling.session.$id.tsx# Active simulated session
│   │       └── helper.tsx                 # Helper Advisory Desk
├── backend/                               # Python FastAPI backend (:8000)
└── DATA/                                  # JoSAA closing ranks dataset
```

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 20+ / 22+
- Python 3.10+ (for running the original prediction engine backend)

### Step 1: Frontend Installation
```bash
cd finallymade_prjectonlydatascienceleftout-main_FINAL/frontend
npm install
```

### Step 2: Configure Gemini API Key (Optional but Recommended)
Create `.env` in `finallymade_prjectonlydatascienceleftout-main_FINAL/frontend/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```
> **Note**: If `GEMINI_API_KEY` is omitted, the application automatically runs in high-fidelity **Deterministic Local Fallback Mode**. Everything works out of the box!

### Step 3: Start Frontend
```bash
npm run dev
```
The application will start on `http://localhost:5173` (or the port Vite selects).

### Step 4: Start Backend (Optional, for original JoSAA PDF generation)
```bash
cd finallymade_prjectonlydatascienceleftout-main_FINAL/backend
uvicorn main:app --reload --port 8000
```

---

## 5. Demonstration Scenarios

Use the **Demo Mode Launchpad** banner at the top of the counselling pages to run through any flow instantly:

### FLOW 1: JoSAA Report → College Mentorship
1. Navigate to `/counselling` or click **"1. College Flow (NITK Mech)"** in the top demo banner.
2. The candidate context (`Rank ~32,450`, `NIT Kurukshetra Mechanical`) is loaded.
3. Chat with the conversational assistant or click a quick prompt:
   *"I care more about Mechanical opportunities and internships than overall college ranking."*
4. Click **"Refine My College List ↗"** to see Gemini analyze trade-offs between NIT Kurukshetra, PEC Chandigarh, and IIT Kanpur.
5. Click **"Ask For Free →"** on **Riya Sharma** (NIT Kurukshetra Mechanical, Hero MotoCorp R&D).
6. Send a free preliminary doubt:
   *"Can you explain whether Mechanical students at NITK get decent core internships?"*
7. Simulated helper Riya confirms fit.
8. The AI broker prompt appears:
   *"I found 3 other mentors who match this question. Would you like to send this request to them too?"*
9. Click **"Broadcast to Matching Mentors"** to select Aarav Patel and Kabir Mehta.
10. The **Multi-Quote Comparison Grid** opens:
    - Riya Sharma: ₹350 (Strongest Direct Branch Match)
    - Aarav Patel: ₹300 (Best for Software / Tech Backup)
    - Kabir Mehta: ₹550 (Best for Broader Engineering Pathways)
11. Click **"Accept Quote"** on Riya Sharma $\to$ Confirm simulated payment.
12. The **Simulated Paid Session** opens with live timer, mock video feed, and shared notes.
13. Click **"End Session & Review"** $\to$ Submit a 5-star rating $\to$ Updates Riya's rating in local state.

### FLOW 2: Career Guidance (Level-Gated Progression)
1. Click **"2. Career Flow (SDE-1 → SDE-2)"** in the demo banner.
2. Seeker is an **SDE-1 (Level 2)** with 1.5 years experience, backend focused.
3. Notice that all matched mentors are **Level 3+ (SDE-2, Senior SDE, Staff)**:
   - **Sneha Rao** (Senior SDE at Microsoft)
   - **Arjun Nambiar** (SDE-2 at Razorpay)
   - **Vikramaditya Sen** (Staff Engineer at Swiggy)
4. Peer engineers and interns are strictly filtered out.
5. Open free chat with Sneha Rao for a system design gap audit.

### FLOW 3: Helper Desk Advisory Workbench
1. Click **"3. Helper Desk Flow"** in the top banner or navigate to `/helper`.
2. Toggle status between `AVAILABLE` and `OFFLINE`.
3. Select an incoming seeker request (e.g. Aman's Mechanical inquiry).
4. Use the **Gemini Helper-Side Assistant** buttons:
   - *"Draft Free Chat Response"*
   - *"Suggest Clarifying Question"*
   - *"Cluster Questions into 4 Bullets"*
5. Use the **Scope-Based Quote Builder** to enter price (₹350), duration (25 min), and scope note.
6. Click **"Send Scoped Quote"** $\to$ Instantly reflected in the seeker's comparison grid.

---

## 6. Trust, Safety & Ethics Notice

- All simulated profiles are clearly tagged with `"DEMO PROFILE / SIMULATED HELPER"`.
- No fictional characters are represented as verified real individuals.
- Payments, video streams, and calendars are simulated for proof-of-concept purposes.
- Free pre-session chat establishes trust and confirms fit before any paid commitment.
