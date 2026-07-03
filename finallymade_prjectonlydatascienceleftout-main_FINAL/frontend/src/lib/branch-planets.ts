import cse from "@/assets/planets/cse.jpg";
import ai from "@/assets/planets/ai.jpg";
import vlsi from "@/assets/planets/vlsi.jpg";
import ece from "@/assets/planets/ece.jpg";
import ee from "@/assets/planets/ee.jpg";
import aero from "@/assets/planets/aero.jpg";
import civil from "@/assets/planets/civil.jpg";
import mech from "@/assets/planets/mech.jpg";
import chem from "@/assets/planets/chem.jpg";
import prod from "@/assets/planets/prod.jpg";
import mat from "@/assets/planets/mat.jpg";
import data from "@/assets/planets/data.jpg";
import mnc from "@/assets/planets/mnc.jpg";

export type BranchPlanet = {
  code: string;
  slug: string;
  name: string;
  short: string;
  blurb: string;
  image: string;
  /** accent glow color (hex/rgba) */
  accent: string;
  /** planet render size in px at 1000px hero width */
  size: number;
  /** ring? tilt in degrees, undefined = no ring */
  ring?: { tilt: number; color: string };
  /** orbit position: 0..1, inner (fast) → outer (slow) */
  orbitIndex: number;
};

// 13 branches, ordered inner → outer
export const BRANCH_PLANETS: BranchPlanet[] = [
  { code: "CSE",  slug: "cse",   name: "Computer Science",           short: "CSE",       blurb: "Build the systems that build everything else.",   image: cse,   accent: "#38bdf8", size: 68, orbitIndex: 0  },
  { code: "AI",   slug: "ai",    name: "Artificial Intelligence",    short: "AI",        blurb: "Teach machines to think, learn, and imagine.",    image: ai,    accent: "#e879f9", size: 84, orbitIndex: 1  },
  { code: "VLSI", slug: "vlsi",  name: "VLSI Design",                short: "VLSI",      blurb: "Etch the silicon that powers the future.",        image: vlsi,  accent: "#a3e635", size: 62, orbitIndex: 2  },
  { code: "ECE",  slug: "ece",   name: "Electronics & Comm.",        short: "ECE",       blurb: "Signals, circuits, and the language of devices.", image: ece,   accent: "#34d399", size: 76, orbitIndex: 3  },
  { code: "EE",   slug: "ee",    name: "Electrical Engineering",     short: "EE",        blurb: "Move power, light cities, spark the grid.",       image: ee,    accent: "#fb923c", size: 80, orbitIndex: 4  },
  { code: "AERO", slug: "aero",  name: "Aerospace",                  short: "AERO",      blurb: "Push metal, minds, and missions into the sky.",   image: aero,  accent: "#e5e7eb", size: 98, ring: { tilt: -18, color: "rgba(240,235,220,0.75)" }, orbitIndex: 5  },
  { code: "CIV",  slug: "civil", name: "Civil Engineering",          short: "CIVIL",     blurb: "Shape the terrain, the roads, the skyline.",      image: civil, accent: "#f97316", size: 78, orbitIndex: 6  },
  { code: "ME",   slug: "mech",  name: "Mechanical Engineering",     short: "MECH",      blurb: "Every moving thing on Earth needed one of you.",  image: mech,  accent: "#f87171", size: 86, orbitIndex: 7  },
  { code: "CHE",  slug: "chem",  name: "Chemical Engineering",       short: "CHEM",      blurb: "Turn molecules into medicine, fuel, and food.",   image: chem,  accent: "#a3e635", size: 90, ring: { tilt: 22, color: "rgba(180, 96, 232, 0.7)" }, orbitIndex: 8  },
  { code: "PROD", slug: "prod",  name: "Production Engineering",     short: "PROD",      blurb: "Scale ideas from prototype to a million units.",  image: prod,  accent: "#fb923c", size: 76, orbitIndex: 9  },
  { code: "MME",  slug: "mat",   name: "Materials & Metallurgy",     short: "MME",       blurb: "Discover the stuff that everything is made of.",  image: mat,   accent: "#fbbf24", size: 92, ring: { tilt: -8, color: "rgba(255, 155, 60, 0.85)" }, orbitIndex: 10 },
  { code: "DS",   slug: "data",  name: "Data Science",               short: "DATA",      blurb: "Find the story hiding inside the numbers.",       image: data,  accent: "#22d3ee", size: 82, orbitIndex: 11 },
  { code: "MNC",  slug: "mnc",   name: "Math & Computing",           short: "MNC",       blurb: "Prove it, compute it, then break it beautifully.", image: mnc,   accent: "#c4b5fd", size: 72, orbitIndex: 12 },
];
