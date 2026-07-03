

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const TYPEWRITER = [
  "Thousands of colleges. One right answer. We find it.",
  "Data doesn't lie. Your counsellor might.",
  "10 years of JoSAA data. Zero guesswork.",
  "One wrong choice costs you 4 years.",
];

type Row = [string, string, string, string?];

const IIT_RANKS: Row[] = [
  ["IIT Bombay CSE", "Open: 67", "Close: 98", "OPEN"],
  ["IIT Delhi CSE", "Open: 105", "Close: 142", "OPEN"],
  ["IIT Madras CSE", "Open: 158", "Close: 196", "OBC"],
  ["IIT Kanpur CSE", "Open: 212", "Close: 268", "OPEN"],
  ["IIT Kharagpur CSE", "Open: 279", "Close: 340", "EWS"],
  ["IIT Roorkee CSE", "Open: 388", "Close: 462", "OBC"],
  ["IIT Guwahati CSE", "Open: 510", "Close: 612", "OPEN"],
  ["IIT Hyderabad CSE", "Open: 478", "Close: 590", "OPEN"],
  ["IIT BHU CSE", "Open: 620", "Close: 780", "SC"],
  ["IIT Delhi ECE", "Open: 234", "Close: 312", "OBC"],
  ["IIT Bombay EE", "Open: 410", "Close: 502", "OPEN"],
  ["IIT Madras EE", "Open: 540", "Close: 680", "OPEN"],
  ["IIT Kanpur ME", "Open: 1820", "Close: 2240", "OPEN"],
  ["IIT Madras Mech", "Open: 892", "Close: 1240", "SC"],
  ["IIT BHU Mining", "Open: 4200", "Close: 5800", "OPEN"],
  ["IIT Roorkee Civil", "Open: 3120", "Close: 4480", "OBC"],
  ["IIT Indore CSE", "Open: 1010", "Close: 1280", "OPEN"],
  ["IIT Mandi CSE", "Open: 2240", "Close: 2780", "OPEN"],
  ["IIT Ropar CSE", "Open: 1640", "Close: 2090", "EWS"],
  ["IIT Patna CSE", "Open: 2890", "Close: 3410", "OBC"],
  ["IIT Jodhpur CSE", "Open: 2410", "Close: 2920", "OPEN"],
  ["IIT Gandhinagar CSE", "Open: 1920", "Close: 2380", "OPEN"],
  ["IIT Tirupati CSE", "Open: 3540", "Close: 4180", "ST"],
  ["IIT Palakkad CSE", "Open: 3210", "Close: 3890", "OBC"],
  ["IIT Bhilai CSE", "Open: 3680", "Close: 4520", "OPEN"],
  ["IIT Dharwad CSE", "Open: 4120", "Close: 4910", "OPEN"],
  ["IIT Goa CSE", "Open: 3820", "Close: 4480", "EWS"],
  ["IIT ISM Dhanbad CSE", "Open: 1280", "Close: 1640", "OPEN"],
  ["IIT Jammu CSE", "Open: 4290", "Close: 5180", "OBC"],
  ["IIT Bombay Aero", "Open: 1840", "Close: 2310", "OPEN"],
  ["IIT Kanpur Aero", "Open: 2410", "Close: 3120", "OPEN"],
  ["IIT Hyderabad AI", "Open: 720", "Close: 940", "OPEN"],
  ["IIT Madras DS&AI", "Open: 480", "Close: 640", "OPEN"],
];

const NIT_RANKS: Row[] = [
  ["NIT Trichy CSE", "Open: 1840", "Close: 2100"],
  ["NIT Warangal CSE", "Open: 1620", "Close: 1980"],
  ["NIT Surathkal CSE", "Open: 1940", "Close: 2800"],
  ["NIT Calicut CSE", "Open: 3120", "Close: 3680"],
  ["NIT Rourkela CSE", "Open: 2890", "Close: 3410"],
  ["NIT Allahabad CSE", "Open: 2410", "Close: 2920"],
  ["NIT Jaipur CSE", "Open: 3580", "Close: 4180"],
  ["NIT Nagpur CSE", "Open: 3940", "Close: 4620"],
  ["NIT Kurukshetra CSE", "Open: 4280", "Close: 4980"],
  ["NIT Durgapur CSE", "Open: 5120", "Close: 6240"],
  ["NIT Silchar CSE", "Open: 7820", "Close: 9410"],
  ["NIT Hamirpur CSE", "Open: 6480", "Close: 7820"],
  ["NIT Jalandhar CSE", "Open: 5840", "Close: 6920"],
  ["NIT Patna CSE", "Open: 7120", "Close: 8480"],
  ["NIT Raipur CSE", "Open: 6240", "Close: 7480"],
  ["NIT Goa CSE", "Open: 8120", "Close: 9840"],
  ["NIT Meghalaya CSE", "Open: 11200", "Close: 13400"],
  ["NIT Sikkim CSE", "Open: 12400", "Close: 14800"],
  ["NIT Trichy ECE", "Open: 2410", "Close: 2890"],
  ["NIT Warangal ECE", "Open: 3200", "Close: 4100"],
  ["NIT Surathkal ECE", "Open: 3540", "Close: 4180"],
  ["NIT Calicut ECE", "Open: 4280", "Close: 4920"],
  ["NIT Allahabad ECE", "Open: 3890", "Close: 4520"],
  ["NIT Trichy EE", "Open: 3420", "Close: 4020"],
  ["NIT Warangal EE", "Open: 4180", "Close: 4910"],
  ["NIT Warangal Mech", "Open: 5240", "Close: 6280"],
  ["NIT Trichy Mech", "Open: 4820", "Close: 5640"],
  ["NIT Surathkal Mech", "Open: 5680", "Close: 6920"],
  ["NIT Rourkela Mech", "Open: 7240", "Close: 8480"],
  ["NIT Trichy Civil", "Open: 8420", "Close: 9820"],
  ["NIT Warangal Civil", "Open: 9120", "Close: 10840"],
  ["NIT Surathkal Chem", "Open: 7820", "Close: 9210"],
  ["NIT Trichy Met", "Open: 9410", "Close: 11240"],
  ["NIT Warangal MME", "Open: 10240", "Close: 12180"],
];

const PACKAGES: Row[] = [
  ["Google", "₹1.2 Cr", "IIT Bombay CSE"],
  ["Microsoft", "₹58 LPA", "NIT Trichy CSE"],
  ["Adobe", "₹45 LPA", "IIIT Hyderabad"],
  ["Amazon", "₹52 LPA", "IIT Delhi CSE"],
  ["Meta", "₹1.4 Cr", "IIT Madras CSE"],
  ["Salesforce", "₹38 LPA", "NIT Surathkal CSE"],
  ["Uber", "₹62 LPA", "IIT Kanpur CSE"],
  ["Apple", "₹86 LPA", "IIT Hyderabad CSE"],
  ["Netflix", "₹1.1 Cr", "IIT Bombay CSE"],
  ["Goldman Sachs", "₹42 LPA", "IIT Kharagpur"],
  ["JP Morgan", "₹28 LPA", "NIT Warangal CSE"],
  ["Morgan Stanley", "₹36 LPA", "IIT Roorkee CSE"],
  ["Citadel", "₹1.6 Cr", "IIT Bombay CSE"],
  ["Jane Street", "₹2.1 Cr", "IIT Delhi CSE"],
  ["Da Vinci Derivatives", "₹1.8 Cr", "IIT Madras CSE"],
  ["Optiver", "₹1.3 Cr", "IIT Bombay Math"],
  ["Tower Research", "₹1.1 Cr", "IIT Kanpur CSE"],
  ["Nvidia", "₹68 LPA", "IIT Hyderabad AI"],
  ["Qualcomm", "₹34 LPA", "NIT Trichy ECE"],
  ["Intel", "₹32 LPA", "NIT Warangal ECE"],
  ["Texas Instruments", "₹26 LPA", "NIT Surathkal ECE"],
  ["Samsung R&D", "₹44 LPA", "IIT BHU CSE"],
  ["Atlassian", "₹54 LPA", "IIIT Hyderabad"],
  ["Oracle", "₹28 LPA", "NIT Calicut CSE"],
  ["Flipkart", "₹32 LPA", "IIT Kharagpur CSE"],
  ["Swiggy", "₹30 LPA", "NIT Trichy CSE"],
  ["Zomato", "₹26 LPA", "IIT Roorkee CSE"],
  ["Paytm", "₹24 LPA", "NIT Allahabad CSE"],
  ["PhonePe", "₹38 LPA", "IIT Madras CSE"],
  ["Sprinklr", "₹40 LPA", "BITS Pilani"],
  ["DE Shaw", "₹52 LPA", "IIT Delhi CSE"],
  ["Quadeye", "₹65 LPA", "IIT Bombay Math"],
  ["WorldQuant", "₹38 LPA", "IIT Kanpur CSE"],
  ["Rubrik", "₹48 LPA", "IIIT Hyderabad"],
];

const STARTUPS: Row[] = [
  ["Zepto", "IIT Bombay", "$1.4B"],
  ["Razorpay", "IIT Roorkee", "$7.5B"],
  ["CRED", "IIT Madras", "Kunal Shah"],
  ["Flipkart", "IIT Delhi", "$37B"],
  ["Ola", "IIT Bombay", "$5.4B"],
  ["Zomato", "IIT Delhi", "Listed"],
  ["Swiggy", "BITS Pilani", "Listed"],
  ["Meesho", "IIT Delhi", "$4.9B"],
  ["Udaan", "IIT Bombay", "$3.1B"],
  ["Unacademy", "IIT Bombay", "$3.4B"],
  ["BYJU'S", "IIM Ahmedabad", "$22B"],
  ["PhonePe", "IIT Kharagpur", "$12B"],
  ["Nykaa", "IIM Ahmedabad", "Listed"],
  ["Lenskart", "IIT Delhi", "$5B"],
  ["Dream11", "IIT Bombay", "$8B"],
  ["Cars24", "IIT Delhi", "$3.3B"],
  ["BharatPe", "IIT Delhi", "$2.85B"],
  ["Groww", "IIT Bombay", "$3B"],
  ["Upstox", "IIT Bombay", "$3.5B"],
  ["Postman", "BITS Pilani", "$5.6B"],
  ["Freshworks", "NIT Trichy", "Listed"],
  ["Zoho", "Anna Univ", "Bootstrapped"],
  ["InMobi", "IIT Kanpur", "$1B+"],
  ["Pine Labs", "IIT Delhi", "$5B"],
  ["MPL", "NIT Surathkal", "$2.3B"],
  ["Polygon", "NIT Bhopal", "$13B"],
  ["CoinDCX", "IIT Bombay", "$2.15B"],
  ["Slice", "IIT Kharagpur", "$1.5B"],
  ["Acko", "IIT Bombay", "$1.4B"],
  ["Cure.fit", "IIT Kanpur", "$1.5B"],
  ["Licious", "IIT Delhi", "$1B"],
  ["ShareChat", "IIT Kanpur", "$5B"],
  ["Glance", "IIT Roorkee", "$2.1B"],
];

const CARDS = [
  { label: "01 · IIT RANKS", rows: IIT_RANKS },
  { label: "02 · NIT RANKS", rows: NIT_RANKS },
  { label: "03 · PACKAGES", rows: PACKAGES },
  { label: "04 · STARTUPS", rows: STARTUPS },
];

function FluxCard({ label, rows, offset }: { label: string; rows: Row[]; offset: number }) {
  const [i, setI] = useState(Math.floor(Math.random() * rows.length));
  useEffect(() => {
    const t = setTimeout(() => {
      const iv = setInterval(() => setI((x) => (x + 3) % rows.length), 1400);
      return () => clearInterval(iv);
    }, offset);
    return () => clearTimeout(t);
  }, [rows.length, offset]);

  const visible = [rows[i], rows[(i + 1) % rows.length], rows[(i + 2) % rows.length]];

  return (
    <div
      className="flex flex-col justify-between p-3"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        height: 116,
      }}
    >
      <div className="mono text-[9px] flex items-center justify-between" style={{ color: "var(--accent)", letterSpacing: "1px" }}>
        <span>{label}</span>
        <span style={{ color: "var(--muted-foreground)" }}>{rows.length}+</span>
      </div>
      <div key={i} className="page-fade flex flex-col gap-1">
        {visible.map((r, idx) => (
          <div key={idx} className="flex flex-col leading-tight">
            <div className="text-[10.5px] truncate" style={{ color: "var(--foreground)", fontWeight: 500 }}>
              {r[0]}
            </div>
            <div className="mono text-[8.5px] flex gap-1.5 truncate" style={{ color: "var(--muted-foreground)" }}>
              <span>{r[1]}</span>
              <span>·</span>
              <span>{r[2]}</span>
              {r[3] && <span style={{ color: "var(--warn)" }}>· {r[3]}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function ConnectionMap() {
  const left = ["◈ Marks", "◎ Percentile", "◆ Rank", "◇ Category"];
  const center = ["⬧ IIT Bombay", "⬧ NIT Trichy", "⬧ IIIT Hyderabad", "⬧ NIT Warangal"];
  const right = ["● Google", "● ₹45 LPA", "● Microsoft", "● San Francisco", "● ₹1.2 Cr"];

  const leftYs = [40, 90, 140, 190, 240];
  const centerYs = [60, 120, 180, 240];
  const rightYs = [40, 85, 140, 195, 240];

  const linksLC: string[] = [];
  leftYs.forEach((ly) => {
    centerYs.forEach((cy) => {
      linksLC.push(`M110,${ly} C250,${ly} 260,${cy} 400,${cy}`);
    });
  });
  const linksCR: string[] = [];
  centerYs.forEach((cy) => {
    rightYs.forEach((ry) => {
      linksCR.push(`M400,${cy} C540,${cy} 550,${ry} 690,${ry}`);
    });
  });

  const dots = [
    { d: `M110,90 C250,90 260,60 400,60 C540,60 550,40 690,40`, color: "#fbbf24", delay: 0 },
    { d: `M110,140 C250,140 260,120 400,120 C540,120 550,85 690,85`, color: "#f472b6", delay: 1.2 },
    { d: `M110,190 C250,190 260,180 400,180 C540,180 550,195 690,195`, color: "#34d399", delay: 2.4 },
    { d: `M110,240 C250,240 260,240 400,240 C540,240 550,240 690,240`, color: "#60a5fa", delay: 3.6 },
  ];

  return (
    <div
      className="relative"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        height: 260,
      }}
    >
      <div className="grid grid-cols-3 px-5 pt-2.5">
        <div className="mono text-[8px]" style={{ color: "var(--muted-foreground)", letterSpacing: "1.5px" }}>YOUR DATA</div>
        <div className="mono text-[8px] text-center" style={{ color: "var(--muted-foreground)", letterSpacing: "1.5px" }}>COLLEGES</div>
        <div className="mono text-[8px] text-right" style={{ color: "var(--muted-foreground)", letterSpacing: "1.5px" }}>OUTCOMES</div>
      </div>

      <svg className="absolute inset-x-0 w-full" viewBox="0 0 800 280" preserveAspectRatio="none" style={{ height: 220, top: 18 }}>
        <defs>
          <style>{`
            .pp { fill: none; stroke: var(--path); stroke-width: 0.6; opacity: 0.55; }
            .pd { offset-rotate: 0deg; animation: dot-path 5s linear infinite; }
          `}</style>
        </defs>
        {linksLC.map((d, i) => <path key={`lc${i}`} className="pp" d={d} />)}
        {linksCR.map((d, i) => <path key={`cr${i}`} className="pp" d={d} />)}
        {dots.map((d, i) => (
          <circle
            key={`d${i}`}
            r="3.5"
            fill={d.color}
            className="pd"
            style={{ offsetPath: `path('${d.d}')`, animationDelay: `${d.delay}s` } as React.CSSProperties}
          />
        ))}
      </svg>

      <div className="absolute inset-0 grid grid-cols-3 px-5 pt-7 pb-7">
        <div className="flex flex-col justify-around items-start">
          {left.map((t) => (
            <span key={t} className="mono text-[10px] px-2 py-0.5 rounded-sm" style={{ background: "var(--node-bg)", border: "1px solid var(--node-border)", color: "var(--foreground)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-col justify-around items-center">
          {center.map((t) => (
            <span key={t} className="mono text-[10px] px-2 py-0.5 rounded-sm" style={{ background: "var(--node-bg)", border: "1px solid var(--node-border)", color: "var(--foreground)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-col justify-around items-end">
          {right.map((t) => (
            <span key={t} className="mono text-[10px]" style={{ color: "var(--foreground)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-1.5" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="mono text-[8px]" style={{ color: "var(--accent)", letterSpacing: "1.5px" }}>
          RANK → COLLEGE → DREAM
        </div>
        <div className="mono text-[8px]" style={{ color: "var(--muted-foreground)", letterSpacing: "1.5px" }}>
          ◆ LIVE DATA STREAM
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const [tw, setTw] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTw((x) => (x + 1) % TYPEWRITER.length), 2500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="h-full w-full px-10 py-5 flex flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-2">
        <div className="mono text-[10px]" style={{ color: "var(--muted-foreground)", letterSpacing: "2px" }}>
          ◆ JEE MAIN · JEE ADVANCED
        </div>
        <h1 className="text-[52px] leading-[1.02]" style={{ fontWeight: 900, color: "var(--foreground)" }}>
          Your rank doesn't define you.
        </h1>
        <h2 className="text-[52px] leading-[1.02] -mt-1" style={{ fontWeight: 900, color: "var(--accent)" }}>
          Your choice does.
        </h2>

        <div className="text-[13px] flex items-center gap-2 mt-2" style={{ color: "var(--muted-foreground)" }}>
          <span style={{ color: "var(--accent)" }}>→</span>
          <span key={tw} className="page-fade">{TYPEWRITER[tw]}</span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div
            className="mono text-[9px] px-3 py-2 rounded-sm"
            style={{
              border: "1px solid var(--warn)",
              background: "rgba(217,119,6,0.1)",
              color: "var(--warn)",
              letterSpacing: "1px",
            }}
          >
            ⚠ DATA DOESN'T LIE. YOUR COUNSELLOR MIGHT.
          </div>
          <button
            className="mono text-[10px] px-4 py-2 rounded-sm"
            style={{ border: "1px solid var(--cta-border)", color: "var(--accent)", letterSpacing: "1px" }}
          >
            TRY ON YOUR DATA →
          </button>
          <button
            className="mono text-[10px] px-4 py-2 rounded-sm"
            style={{ border: "1px solid var(--cta-muted-border)", color: "var(--muted-foreground)", letterSpacing: "1px" }}
          >
            GENERATE REPORT →
          </button>
        </div>
      </div>

      <ConnectionMap />

      <div className="grid grid-cols-4 gap-3">
        {CARDS.map((c, i) => (
          <FluxCard key={c.label} {...c} offset={i * 550} />
        ))}
      </div>
    </div>
  );
}
