import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/predict")({
  component: PredictPage,
});

export const COMMUNITY: { title: string; a: string; b: string; glow: string; images: string[] }[] = [
  {
    title: "◆ ALUMNI NETWORK",
    a: "Seniors at Amazon, Google, Microsoft & startups",
    b: "Direct LinkedIn connections · Mock interview calls · Resume reviews · Referral chains · Pre-joining guidance · Know your senior before Day 1",
    glow: "#3b82f6",
    images: ["/alumni-1.jpg", "/alumni-2.jpg", "/alumni-3.jpg", "/alumni-4.jpg", "/alumni-5.jpg"],
  },
  {
    title: "◆ COLLEGE GUIDANCE",
    a: "Branch specific real experiences from current students",
    b: "Hostel life · Faculty quality · Campus culture rated · Not what brochure says — what students actually feel · Culture · Academics · Placements · Campus life",
    glow: "#10b981",
    images: ["/college-1.jpg", "/college-2.jpg", "/college-3.jpg", "/college-4.jpg", "/college-5.jpg"],
  },
  {
    title: "◆ PLACEMENT INSIGHTS",
    a: "Real placement data per branch & per year",
    b: "Median: ₹12 LPA · Top 10%: ₹45 LPA · Dream: ₹1.2 Cr · 100K+ offer data points across 10 years · Know the number before you choose the branch",
    glow: "#f59e0b",
    images: ["/placement-1.jpg", "/placement-2.jpg", "/placement-3.jpg", "/placement-4.jpg", "/placement-5.jpg"],
  },
  {
    title: "◆ LIVE COUNSELLING",
    a: "Guidance during JoSAA form filling — live sessions",
    b: "We help you order choices by data not by popularity · Avoid the trap: CSE hype vs actual placement reality · One right session = right 4 years of your life",
    glow: "#ef4444",
    images: ["/counselling-1.jpg", "/counselling-2.jpg", "/counselling-3.jpg", "/counselling-4.jpg", "/counselling-5.jpg"],
  },
  {
    title: "◆ BRANCH SWITCH HACKS",
    a: "Got Mech but want CS? Here is your roadmap",
    b: "Dual degree · Interdisciplinary · Minor options · Branch change criteria · CG cutoffs · Success stories · Your branch is not your destiny — change it smartly",
    glow: "#a855f7",
    images: ["/branch-1.jpg", "/branch-2.jpg", "/branch-3.jpg", "/branch-4.jpg", "/branch-5.jpg"],
  },
  {
    title: "◆ INTERNSHIP PIPELINE",
    a: "Referrals into FAANG, quant & top startups",
    b: "Alumni referred 200+ students last placement season · Mock interviews · Resume reviews · Cold email templates · Your first internship decides your first job offer",
    glow: "#06b6d4",
    images: ["/internship-1.jpg", "/internship-2.jpg", "/internship-3.jpg", "/internship-4.jpg", "/internship-5.jpg"],
  },
];

function ImageRow({ images, accent, title }: { images: string[]; accent: string; title: string }) {
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`${title} image ${index + 1}`}
          width={44}
          height={44}
          loading="lazy"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: `2px solid ${accent}`,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function PredictPage() {
  // ════════════════════════════════════════════════════════
  // HIDDEN FUNCTION: Lovable ke form se isko call karna
  // ════════════════════════════════════════════════════════
  const handlePredict = async (formData: any) => {
    const payload = {
      exam_type: "JEE Main",
      year: formData.year || 2026,
      session: formData.session || "Session 1",
      shift: formData.shift || "Shift 1 — Morning",
      shift_date: formData.shift_date || "22-01-2026", 
      percentile: formData.percentile || 7, 
      category: formData.category || "OPEN", 
      gender: formData.gender || "Gender Neutral",
      state_of_education: formData.state || "",
      name: formData.name || "Student" 
    };

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.headers.get("content-type") === "application/pdf") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "JEE_Prediction_Report.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        console.error("Backend Error:", errorData.detail);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  return (
    <div className="h-full w-full grid" style={{ gridTemplateColumns: "44% 56%" }}>
      {/* LEFT */}
      <section className="px-8 py-2 flex flex-col justify-between gap-2 relative">
        <div className="mono text-[9px]" style={{ color: "var(--muted-foreground)", letterSpacing: "2px" }}>
          ◆ THE REALITY
        </div>

        <div className="flex flex-col justify-center flex-1 gap-1">
          <div style={{ fontWeight: 900, fontSize: 42, lineHeight: 1.02 }}>
            <div style={{ color: "var(--foreground)" }}>One counselling.</div>
            <div style={{ color: "var(--foreground)" }}>One chance.</div>
            <div style={{ color: "var(--accent)" }}>No going back.</div>
            <div style={{ color: "#2563eb" }}>Select the best.</div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <StatBlock value="12,00,000+" label="STUDENTS APPEAR EVERY YEAR" color="var(--accent)" />
          <StatBlock value="1" label="CHANCE TO FILL JoSAA FORM" color="#d97706" />
          <StatBlock value="0" label="RETRIES AFTER SEAT PAYMENT" color="#ef4444" />
          <StatBlock value="4 YRS" label="LOCKED IN BY ONE WRONG CHOICE" color="var(--foreground)" />
          <StatBlock value="∞" label="OPPORTUNITIES LOST WITH WRONG BRANCH" color="#7c3aed" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div
            className="mono text-[9px] px-3 py-2 rounded-md flex-1"
            style={{
              background: "rgba(217,119,6,0.08)",
              border: "1px solid var(--warn)",
              color: "var(--warn)",
              letterSpacing: "1px",
            }}
          >
            ⚠ ONE WRONG CHOICE = 4 YEARS WASTED
          </div>
          <div
            className="mono text-[8.5px] px-2 py-2 rounded-md"
            style={{
              border: "1px solid var(--border)",
              color: "var(--muted-foreground)",
              letterSpacing: "1px",
            }}
          >
            10 YR DATA · ALL 23 IITs · 31 NITs · GFTIs · IIITs
          </div>
        </div>

        <div className="absolute right-0 top-3 bottom-3" style={{ width: 1, background: "var(--border)" }} />
      </section>

      {/* RIGHT */}
      <section className="px-8 py-2 flex flex-col justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="mono text-[9px]" style={{ color: "var(--muted-foreground)", letterSpacing: "2px" }}>
            ◆ THE COMMUNITY
          </div>
          <div className="flex items-end justify-between">
            <div style={{ fontWeight: 900, fontSize: 30, lineHeight: 1.05 }}>
              <div style={{ color: "var(--foreground)" }}>You won't be</div>
              <div style={{ color: "var(--accent)" }}>alone. Ever.</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-[11px] max-w-[240px] text-right" style={{ color: "var(--muted-foreground)" }}>
                Alumni from top companies guide you before you even join the campus.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 flex-1">
          {COMMUNITY.map((c, i) => (
            <div
              key={c.title}
              className="glow-card p-3 flex flex-col gap-1 justify-start"
              style={
                {
                  background: "var(--card)",
                  border: `1px solid ${c.glow}40`,
                  borderRadius: 8,
                  "--glow-color": c.glow,
                  animationDelay: `${i * 0.4}s`,
                } as React.CSSProperties
              }
            >
              <div className="mono text-[9.5px]" style={{ color: c.glow, letterSpacing: "1px" }}>
                {c.title}
              </div>
              <div className="text-[11px] font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
                {c.a}
              </div>
              <div className="text-[10px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {c.b}
              </div>
              <ImageRow images={c.images} accent={c.glow} title={c.title.replace("◆ ", "")} />
            </div>
          ))}
        </div>

      <div
  className="flex flex-wrap items-center px-4 py-2 rounded-md gap-y-2 mb-2"
  style={{ background: "var(--stat-bar-bg)", border: "1px solid var(--border)" }}
        >
          <StatItem n="500+" l="Alumni Connected" />
          <Divider />
          <StatItem n="23" l="IITs Covered" />
          <Divider />
          <StatItem n="31" l="NITs Covered" />
          <Divider />
          <StatItem n="All" l="GFTIs & IIITs" />
        </div>
      </section>
    </div>
  );
}

function StatBlock({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 pb-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div className="mono text-[8.5px] text-right" style={{ color: "var(--muted-foreground)", letterSpacing: "1.5px" }}>
        {label}
      </div>
    </div>
  );
}

function StatItem({ n, l }: { n: string; l: string }) {
  return (
    <div className="flex items-baseline gap-1.5 flex-1 min-w-[80px] justify-center">
      <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 13 }}>{n}</span>
      <span className="mono text-[8px]" style={{ color: "var(--muted-foreground)", letterSpacing: "1px" }}>
        {l}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: "var(--border)" }} />;
}


// import { createFileRoute } from "@tanstack/react-router";

// export const Route = createFileRoute("/predict")({
//   component: PredictPage,
// });

// export const COMMUNITY: { title: string; a: string; b: string; glow: string; images: string[] }[] = [
//   {
//     title: "◆ ALUMNI NETWORK",
//     a: "Seniors at Amazon, Google, Microsoft & startups",
//     b: "Direct LinkedIn connections · Mock interview calls · Resume reviews · Referral chains · Pre-joining guidance · Know your senior before Day 1",
//     glow: "#3b82f6",
//     images: ["/alumni-1.jpg", "/alumni-2.jpg", "/alumni-3.jpg", "/alumni-4.jpg", "/alumni-5.jpg"],
//   },
//   {
//     title: "◆ COLLEGE GUIDANCE",
//     a: "Branch specific real experiences from current students",
//     b: "Hostel life · Faculty quality · Campus culture rated · Not what brochure says — what students actually feel · Culture · Academics · Placements · Campus life",
//     glow: "#10b981",
//     images: ["/college-1.jpg", "/college-2.jpg", "/college-3.jpg", "/college-4.jpg", "/college-5.jpg"],
//   },
//   {
//     title: "◆ PLACEMENT INSIGHTS",
//     a: "Real placement data per branch & per year",
//     b: "Median: ₹12 LPA · Top 10%: ₹45 LPA · Dream: ₹1.2 Cr · 100K+ offer data points across 10 years · Know the number before you choose the branch",
//     glow: "#f59e0b",
//     images: ["/placement-1.jpg", "/placement-2.jpg", "/placement-3.jpg", "/placement-4.jpg", "/placement-5.jpg"],
//   },
//   {
//     title: "◆ LIVE COUNSELLING",
//     a: "Guidance during JoSAA form filling — live sessions",
//     b: "We help you order choices by data not by popularity · Avoid the trap: CSE hype vs actual placement reality · One right session = right 4 years of your life",
//     glow: "#ef4444",
//     images: ["/counselling-1.jpg", "/counselling-2.jpg", "/counselling-3.jpg", "/counselling-4.jpg", "/counselling-5.jpg"],
//   },
//   {
//     title: "◆ BRANCH SWITCH HACKS",
//     a: "Got Mech but want CS? Here is your roadmap",
//     b: "Dual degree · Interdisciplinary · Minor options · Branch change criteria · CG cutoffs · Success stories · Your branch is not your destiny — change it smartly",
//     glow: "#a855f7",
//     images: ["/branch-1.jpg", "/branch-2.jpg", "/branch-3.jpg", "/branch-4.jpg", "/branch-5.jpg"],
//   },
//   {
//     title: "◆ INTERNSHIP PIPELINE",
//     a: "Referrals into FAANG, quant & top startups",
//     b: "Alumni referred 200+ students last placement season · Mock interviews · Resume reviews · Cold email templates · Your first internship decides your first job offer",
//     glow: "#06b6d4",
//     images: ["/internship-1.jpg", "/internship-2.jpg", "/internship-3.jpg", "/internship-4.jpg", "/internship-5.jpg"],
//   },
// ];

// function ImageRow({ images, accent, title }: { images: string[]; accent: string; title: string }) {
//   return (
//     <div className="flex items-center gap-1.5 mt-1">
//       {images.map((src, index) => (
//         <img
//           key={src}
//           src={src}
//           alt={`${title} image ${index + 1}`}
//           width={44}
//           height={44}
//           loading="lazy"
//           style={{
//             width: 44,
//             height: 44,
//             borderRadius: "50%",
//             border: `2px solid ${accent}`,
//             objectFit: "cover",
//             flexShrink: 0,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PredictPage() {
//   return (
//     <div className="h-full w-full grid" style={{ gridTemplateColumns: "44% 56%" }}>
//       {/* LEFT */}
//       <section className="px-8 py-4 flex flex-col justify-between gap-2 relative">
//         <div className="mono text-[9px]" style={{ color: "var(--muted-foreground)", letterSpacing: "2px" }}>
//           ◆ THE REALITY
//         </div>

//         <div className="flex flex-col justify-center flex-1 gap-1">
//           <div style={{ fontWeight: 900, fontSize: 42, lineHeight: 1.02 }}>
//             <div style={{ color: "var(--foreground)" }}>One counselling.</div>
//             <div style={{ color: "var(--foreground)" }}>One chance.</div>
//             <div style={{ color: "var(--accent)" }}>No going back.</div>
//             <div style={{ color: "#2563eb" }}>Select the best.</div>
//           </div>
//         </div>

//         <div className="flex flex-col gap-2">
//           <StatBlock value="12,00,000+" label="STUDENTS APPEAR EVERY YEAR" color="var(--accent)" />
//           <StatBlock value="1" label="CHANCE TO FILL JoSAA FORM" color="#d97706" />
//           <StatBlock value="0" label="RETRIES AFTER SEAT PAYMENT" color="#ef4444" />
//           <StatBlock value="4 YRS" label="LOCKED IN BY ONE WRONG CHOICE" color="var(--foreground)" />
//           <StatBlock value="∞" label="OPPORTUNITIES LOST WITH WRONG BRANCH" color="#7c3aed" />
//         </div>

//         <div className="flex items-center gap-2">
//           <div
//             className="mono text-[9px] px-3 py-2 rounded-md flex-1"
//             style={{
//               background: "rgba(217,119,6,0.08)",
//               border: "1px solid var(--warn)",
//               color: "var(--warn)",
//               letterSpacing: "1px",
//             }}
//           >
//             ⚠ ONE WRONG CHOICE = 4 YEARS WASTED
//           </div>
//           <div
//             className="mono text-[8.5px] px-2 py-2 rounded-md"
//             style={{
//               border: "1px solid var(--border)",
//               color: "var(--muted-foreground)",
//               letterSpacing: "1px",
//             }}
//           >
//             10 YR DATA · ALL 23 IITs · 31 NITs · GFTIs · IIITs
//           </div>
//         </div>

//         <div className="absolute right-0 top-3 bottom-3" style={{ width: 1, background: "var(--border)" }} />
//       </section>

//       {/* RIGHT */}
//       <section className="px-8 py-4 flex flex-col justify-between gap-2">
//         <div className="flex flex-col gap-1">
//           <div className="mono text-[9px]" style={{ color: "var(--muted-foreground)", letterSpacing: "2px" }}>
//             ◆ THE COMMUNITY
//           </div>
//           <div className="flex items-end justify-between">
//             <div style={{ fontWeight: 900, fontSize: 30, lineHeight: 1.05 }}>
//               <div style={{ color: "var(--foreground)" }}>You won't be</div>
//               <div style={{ color: "var(--accent)" }}>alone. Ever.</div>
//             </div>
//             <div className="flex flex-col items-end gap-1">
//               <p className="text-[11px] max-w-[240px] text-right" style={{ color: "var(--muted-foreground)" }}>
//                 Alumni from top companies guide you before you even join the campus.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-2 flex-1">
//           {COMMUNITY.map((c, i) => (
//             <div
//               key={c.title}
//               className="glow-card p-3 flex flex-col gap-1 justify-start"
//               style={
//                 {
//                   background: "var(--card)",
//                   border: `1px solid ${c.glow}40`,
//                   borderRadius: 8,
//                   "--glow-color": c.glow,
//                   animationDelay: `${i * 0.4}s`,
//                 } as React.CSSProperties
//               }
//             >
//               <div className="mono text-[9.5px]" style={{ color: c.glow, letterSpacing: "1px" }}>
//                 {c.title}
//               </div>
//               <div className="text-[11px] font-semibold leading-snug" style={{ color: "var(--foreground)" }}>
//                 {c.a}
//               </div>
//               <div className="text-[10px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
//                 {c.b}
//               </div>
//               <ImageRow images={c.images} accent={c.glow} title={c.title.replace("◆ ", "")} />
//             </div>
//           ))}
//         </div>

//         <div
//           className="flex items-center px-4 py-2 rounded-md"
//           style={{ background: "var(--stat-bar-bg)", border: "1px solid var(--border)" }}
//         >
//           <StatItem n="500+" l="Alumni Connected" />
//           <Divider />
//           <StatItem n="23" l="IITs Covered" />
//           <Divider />
//           <StatItem n="31" l="NITs Covered" />
//           <Divider />
//           <StatItem n="All" l="GFTIs & IIITs" />
//         </div>
//       </section>
//     </div>
//   );
// }

// function StatBlock({ value, label, color }: { value: string; label: string; color: string }) {
//   return (
//     <div className="flex items-baseline justify-between gap-3 pb-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
//       <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
//       <div className="mono text-[8.5px] text-right" style={{ color: "var(--muted-foreground)", letterSpacing: "1.5px" }}>
//         {label}
//       </div>
//     </div>
//   );
// }

// function StatItem({ n, l }: { n: string; l: string }) {
//   return (
//     <div className="flex items-baseline gap-1.5 flex-1 justify-center">
//       <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 13 }}>{n}</span>
//       <span className="mono text-[8px]" style={{ color: "var(--muted-foreground)", letterSpacing: "1px" }}>
//         {l}
//       </span>
//     </div>
//   );
// }

// function Divider() {
//   return <div style={{ width: 1, height: 16, background: "var(--border)" }} />;
// }
