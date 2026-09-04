export interface NeetCollege {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  type: "AIIMS" | "Central Govt" | "State Govt" | "Armed Forces" | "Deemed / Trust";
  nirfRank: number;
  hospitalBeds: number;
  established: number;
  annualFee: string;
  bondYears: number;
  bondPenalty: string;
  website: string;
  programs: {
    course: "MBBS" | "BDS";
    quota: "All India Quota (15%)" | "State Quota (85%)" | "Central University" | "AIIMS Open Quota" | "Deemed";
    openingRank: number;
    closingRank: {
      UR: number;
      OBC: number;
      EWS: number;
      SC: number;
      ST: number;
    };
  }[];
}

export const NEET_COLLEGES: NeetCollege[] = [
  {
    id: "aiims-delhi",
    name: "All India Institute of Medical Sciences (AIIMS)",
    shortName: "AIIMS New Delhi",
    city: "New Delhi",
    state: "Delhi",
    type: "AIIMS",
    nirfRank: 1,
    hospitalBeds: 2500,
    established: 1956,
    annualFee: "₹1,628 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://www.aiims.edu",
    programs: [
      {
        course: "MBBS",
        quota: "AIIMS Open Quota",
        openingRank: 1,
        closingRank: { UR: 57, OBC: 255, EWS: 220, SC: 860, ST: 1650 },
      },
    ],
  },
  {
    id: "mamc-delhi",
    name: "Maulana Azad Medical College (MAMC)",
    shortName: "MAMC New Delhi",
    city: "New Delhi",
    state: "Delhi",
    type: "Central Govt",
    nirfRank: 32,
    hospitalBeds: 2800,
    established: 1958,
    annualFee: "₹3,400 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://mamc.ac.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 45,
        closingRank: { UR: 105, OBC: 410, EWS: 380, SC: 1450, ST: 3200 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 110,
        closingRank: { UR: 1420, OBC: 4800, EWS: 3600, SC: 18500, ST: 34000 },
      },
    ],
  },
  {
    id: "vmmc-delhi",
    name: "Vardhman Mahavir Medical College & Safdarjung Hospital",
    shortName: "VMMC & Safdarjung",
    city: "New Delhi",
    state: "Delhi",
    type: "Central Govt",
    nirfRank: 14,
    hospitalBeds: 2900,
    established: 2001,
    annualFee: "₹33,500 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://vmmc-sjh.nic.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 60,
        closingRank: { UR: 142, OBC: 520, EWS: 450, SC: 1900, ST: 4100 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 150,
        closingRank: { UR: 1950, OBC: 6200, EWS: 4800, SC: 24000, ST: 42000 },
      },
    ],
  },
  {
    id: "jipmer-puducherry",
    name: "Jawaharlal Institute of Postgraduate Medical Education & Research",
    shortName: "JIPMER Puducherry",
    city: "Puducherry",
    state: "Puducherry",
    type: "Central Govt",
    nirfRank: 5,
    hospitalBeds: 2200,
    established: 1823,
    annualFee: "₹14,910 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://jipmer.edu.in",
    programs: [
      {
        course: "MBBS",
        quota: "AIIMS Open Quota",
        openingRank: 35,
        closingRank: { UR: 277, OBC: 940, EWS: 1200, SC: 3800, ST: 7800 },
      },
    ],
  },
  {
    id: "aiims-bhubaneswar",
    name: "All India Institute of Medical Sciences, Bhubaneswar",
    shortName: "AIIMS Bhubaneswar",
    city: "Bhubaneswar",
    state: "Odisha",
    type: "AIIMS",
    nirfRank: 15,
    hospitalBeds: 1100,
    established: 2012,
    annualFee: "₹1,628 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://aiimsbhubaneswar.nic.in",
    programs: [
      {
        course: "MBBS",
        quota: "AIIMS Open Quota",
        openingRank: 120,
        closingRank: { UR: 540, OBC: 1350, EWS: 1600, SC: 6200, ST: 14500 },
      },
    ],
  },
  {
    id: "aiims-jodhpur",
    name: "All India Institute of Medical Sciences, Jodhpur",
    shortName: "AIIMS Jodhpur",
    city: "Jodhpur",
    state: "Rajasthan",
    type: "AIIMS",
    nirfRank: 13,
    hospitalBeds: 1200,
    established: 2012,
    annualFee: "₹1,628 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://aiimsjodhpur.edu.in",
    programs: [
      {
        course: "MBBS",
        quota: "AIIMS Open Quota",
        openingRank: 105,
        closingRank: { UR: 490, OBC: 1180, EWS: 1450, SC: 5800, ST: 13200 },
      },
    ],
  },
  {
    id: "aiims-rishikesh",
    name: "All India Institute of Medical Sciences, Rishikesh",
    shortName: "AIIMS Rishikesh",
    city: "Rishikesh",
    state: "Uttarakhand",
    type: "AIIMS",
    nirfRank: 22,
    hospitalBeds: 1060,
    established: 2012,
    annualFee: "₹1,628 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://aiimsrishikesh.edu.in",
    programs: [
      {
        course: "MBBS",
        quota: "AIIMS Open Quota",
        openingRank: 150,
        closingRank: { UR: 780, OBC: 1850, EWS: 2100, SC: 8900, ST: 18400 },
      },
    ],
  },
  {
    id: "aiims-bhopal",
    name: "All India Institute of Medical Sciences, Bhopal",
    shortName: "AIIMS Bhopal",
    city: "Bhopal",
    state: "Madhya Pradesh",
    type: "AIIMS",
    nirfRank: 38,
    hospitalBeds: 1000,
    established: 2012,
    annualFee: "₹1,628 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://aiimsbhopal.edu.in",
    programs: [
      {
        course: "MBBS",
        quota: "AIIMS Open Quota",
        openingRank: 180,
        closingRank: { UR: 620, OBC: 1420, EWS: 1750, SC: 7400, ST: 16100 },
      },
    ],
  },
  {
    id: "kgmu-lucknow",
    name: "King George's Medical University (KGMU)",
    shortName: "KGMU Lucknow",
    city: "Lucknow",
    state: "Uttar Pradesh",
    type: "State Govt",
    nirfRank: 12,
    hospitalBeds: 4500,
    established: 1911,
    annualFee: "₹54,900 / year",
    bondYears: 2,
    bondPenalty: "₹10 Lakhs",
    website: "https://kgmu.org",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 320,
        closingRank: { UR: 1850, OBC: 2900, EWS: 3200, SC: 16500, ST: 32000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 650,
        closingRank: { UR: 3800, OBC: 6200, EWS: 5400, SC: 42000, ST: 85000 },
      },
      {
        course: "BDS",
        quota: "All India Quota (15%)",
        openingRank: 4200,
        closingRank: { UR: 18500, OBC: 24000, EWS: 28000, SC: 78000, ST: 120000 },
      },
    ],
  },
  {
    id: "ims-bhu",
    name: "Institute of Medical Sciences, Banaras Hindu University",
    shortName: "IMS BHU Varanasi",
    city: "Varanasi",
    state: "Uttar Pradesh",
    type: "Central Govt",
    nirfRank: 8,
    hospitalBeds: 1800,
    established: 1960,
    annualFee: "₹29,874 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://new.bhu.ac.in/Site/UnitHome/ims",
    programs: [
      {
        course: "MBBS",
        quota: "Central University",
        openingRank: 85,
        closingRank: { UR: 840, OBC: 1950, EWS: 2200, SC: 9200, ST: 19800 },
      },
      {
        course: "BDS",
        quota: "Central University",
        openingRank: 3500,
        closingRank: { UR: 14200, OBC: 19000, EWS: 22000, SC: 65000, ST: 105000 },
      },
    ],
  },
  {
    id: "cmc-vellore",
    name: "Christian Medical College (CMC)",
    shortName: "CMC Vellore",
    city: "Vellore",
    state: "Tamil Nadu",
    type: "Deemed / Trust",
    nirfRank: 3,
    hospitalBeds: 3000,
    established: 1900,
    annualFee: "₹56,330 / year",
    bondYears: 2,
    bondPenalty: "₹5 Lakhs",
    website: "https://www.cmch-vellore.edu",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 40,
        closingRank: { UR: 215, OBC: 620, EWS: 750, SC: 3100, ST: 6800 },
      },
    ],
  },
  {
    id: "seth-gs-mumbai",
    name: "Seth GS Medical College & KEM Hospital",
    shortName: "Seth GSMC Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    type: "State Govt",
    nirfRank: 26,
    hospitalBeds: 2250,
    established: 1926,
    annualFee: "₹1,24,000 / year",
    bondYears: 1,
    bondPenalty: "₹10 Lakhs",
    website: "https://kem.edu",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 120,
        closingRank: { UR: 680, OBC: 1950, EWS: 2100, SC: 9400, ST: 21000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 350,
        closingRank: { UR: 2800, OBC: 5900, EWS: 4500, SC: 28000, ST: 62000 },
      },
    ],
  },
  {
    id: "madras-medical-college",
    name: "Madras Medical College & Rajiv Gandhi Govt Hospital",
    shortName: "Madras Medical College",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "State Govt",
    nirfRank: 11,
    hospitalBeds: 2722,
    established: 1835,
    annualFee: "₹18,073 / year",
    bondYears: 5,
    bondPenalty: "₹5 Lakhs",
    website: "https://mmc.ac.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 180,
        closingRank: { UR: 790, OBC: 2200, EWS: 2400, SC: 10500, ST: 24000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 420,
        closingRank: { UR: 2400, OBC: 4800, EWS: 4100, SC: 29000, ST: 58000 },
      },
    ],
  },
  {
    id: "bmc-bangalore",
    name: "Bangalore Medical College and Research Institute",
    shortName: "BMCRI Bangalore",
    city: "Bengaluru",
    state: "Karnataka",
    type: "State Govt",
    nirfRank: 43,
    hospitalBeds: 3100,
    established: 1955,
    annualFee: "₹59,850 / year",
    bondYears: 1,
    bondPenalty: "₹10 Lakhs",
    website: "https://bmcri.edu.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 290,
        closingRank: { UR: 1450, OBC: 3400, EWS: 3800, SC: 15400, ST: 29000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 600,
        closingRank: { UR: 4200, OBC: 8500, EWS: 6900, SC: 38000, ST: 72000 },
      },
    ],
  },
  {
    id: "afmc-pune",
    name: "Armed Forces Medical College (AFMC)",
    shortName: "AFMC Pune",
    city: "Pune",
    state: "Maharashtra",
    type: "Armed Forces",
    nirfRank: 34,
    hospitalBeds: 1200,
    established: 1948,
    annualFee: "Subsidized / MoD Bond",
    bondYears: 7,
    bondPenalty: "₹65 Lakhs (Short Service)",
    website: "https://afmc.nic.in",
    programs: [
      {
        course: "MBBS",
        quota: "Central University",
        openingRank: 80,
        closingRank: { UR: 620, OBC: 1200, EWS: 1100, SC: 4500, ST: 8200 },
      },
    ],
  },
  {
    id: "lhmc-delhi",
    name: "Lady Hardinge Medical College (Women Only)",
    shortName: "LHMC New Delhi",
    city: "New Delhi",
    state: "Delhi",
    type: "Central Govt",
    nirfRank: 29,
    hospitalBeds: 1500,
    established: 1916,
    annualFee: "₹1,350 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://lhmc-hosp.gov.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 190,
        closingRank: { UR: 490, OBC: 1450, EWS: 1600, SC: 7800, ST: 16200 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 400,
        closingRank: { UR: 3200, OBC: 8800, EWS: 7400, SC: 34000, ST: 59000 },
      },
    ],
  },
  {
    id: "sms-jaipur",
    name: "Sawai Man Singh Medical College (SMS)",
    shortName: "SMS Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    type: "State Govt",
    nirfRank: 46,
    hospitalBeds: 3500,
    established: 1947,
    annualFee: "₹33,500 / year",
    bondYears: 2,
    bondPenalty: "₹5 Lakhs",
    website: "https://education.rajasthan.gov.in/smsmc",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 310,
        closingRank: { UR: 1280, OBC: 2600, EWS: 2800, SC: 13500, ST: 27000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 750,
        closingRank: { UR: 2950, OBC: 5200, EWS: 4400, SC: 26000, ST: 48000 },
      },
    ],
  },
  {
    id: "bjmc-ahmedabad",
    name: "B.J. Medical College & Civil Hospital",
    shortName: "BJMC Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    type: "State Govt",
    nirfRank: 50,
    hospitalBeds: 2800,
    established: 1871,
    annualFee: "₹25,000 / year",
    bondYears: 1,
    bondPenalty: "₹5 Lakhs",
    website: "https://bjmcabd.edu.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 410,
        closingRank: { UR: 1650, OBC: 3600, EWS: 3900, SC: 18000, ST: 36000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 820,
        closingRank: { UR: 4800, OBC: 9200, EWS: 7100, SC: 44000, ST: 89000 },
      },
    ],
  },
  {
    id: "grant-mumbai",
    name: "Grant Govt Medical College & Sir JJ Group of Hospitals",
    shortName: "Grant Medical College",
    city: "Mumbai",
    state: "Maharashtra",
    type: "State Govt",
    nirfRank: 48,
    hospitalBeds: 2848,
    established: 1845,
    annualFee: "₹1,24,000 / year",
    bondYears: 1,
    bondPenalty: "₹10 Lakhs",
    website: "https://ggmcjjh.com",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 450,
        closingRank: { UR: 2100, OBC: 4400, EWS: 4600, SC: 21000, ST: 44000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 950,
        closingRank: { UR: 5200, OBC: 9800, EWS: 7900, SC: 42000, ST: 84000 },
      },
    ],
  },
  {
    id: "aiims-patna",
    name: "All India Institute of Medical Sciences, Patna",
    shortName: "AIIMS Patna",
    city: "Patna",
    state: "Bihar",
    type: "AIIMS",
    nirfRank: 27,
    hospitalBeds: 960,
    established: 2012,
    annualFee: "₹1,628 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://aiimspatna.edu.in",
    programs: [
      {
        course: "MBBS",
        quota: "AIIMS Open Quota",
        openingRank: 320,
        closingRank: { UR: 1420, OBC: 2450, EWS: 2800, SC: 12400, ST: 25000 },
      },
    ],
  },
  {
    id: "gmc-kozhikode",
    name: "Government Medical College, Kozhikode",
    shortName: "GMC Kozhikode",
    city: "Kozhikode",
    state: "Kerala",
    type: "State Govt",
    nirfRank: 44,
    hospitalBeds: 3000,
    established: 1957,
    annualFee: "₹27,580 / year",
    bondYears: 1,
    bondPenalty: "₹5 Lakhs",
    website: "https://gmckozhikode.gov.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 380,
        closingRank: { UR: 1750, OBC: 3100, EWS: 3400, SC: 16800, ST: 31000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 550,
        closingRank: { UR: 2100, OBC: 4100, EWS: 3800, SC: 24000, ST: 49000 },
      },
    ],
  },
  {
    id: "aiims-nagpur",
    name: "All India Institute of Medical Sciences, Nagpur",
    shortName: "AIIMS Nagpur",
    city: "Nagpur",
    state: "Maharashtra",
    type: "AIIMS",
    nirfRank: 31,
    hospitalBeds: 960,
    established: 2018,
    annualFee: "₹1,628 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://aiimsnagpur.edu.in",
    programs: [
      {
        course: "MBBS",
        quota: "AIIMS Open Quota",
        openingRank: 240,
        closingRank: { UR: 1150, OBC: 2200, EWS: 2600, SC: 11800, ST: 24000 },
      },
    ],
  },
  {
    id: "gmc-chandigarh",
    name: "Government Medical College and Hospital (GMCH)",
    shortName: "GMCH Chandigarh",
    city: "Chandigarh",
    state: "Chandigarh",
    type: "State Govt",
    nirfRank: 32,
    hospitalBeds: 1000,
    established: 1991,
    annualFee: "₹24,979 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://gmch.gov.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 180,
        closingRank: { UR: 720, OBC: 1900, EWS: 2100, SC: 9800, ST: 21000 },
      },
      {
        course: "MBBS",
        quota: "State Quota (85%)",
        openingRank: 600,
        closingRank: { UR: 2900, OBC: 6200, EWS: 5100, SC: 27000, ST: 56000 },
      },
    ],
  },
  {
    id: "kasturba-manipal",
    name: "Kasturba Medical College (KMC)",
    shortName: "KMC Manipal",
    city: "Manipal",
    state: "Karnataka",
    type: "Deemed / Trust",
    nirfRank: 9,
    hospitalBeds: 2032,
    established: 1953,
    annualFee: "₹17,80,000 / year",
    bondYears: 0,
    bondPenalty: "None",
    website: "https://manipal.edu/kmc-manipal.html",
    programs: [
      {
        course: "MBBS",
        quota: "Deemed",
        openingRank: 4200,
        closingRank: { UR: 48500, OBC: 52000, EWS: 54000, SC: 145000, ST: 210000 },
      },
    ],
  },
  {
    id: "st-johns-bangalore",
    name: "St. John's Medical College",
    shortName: "St. John's Bangalore",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Deemed / Trust",
    nirfRank: 19,
    hospitalBeds: 1350,
    established: 1963,
    annualFee: "₹7,30,000 / year",
    bondYears: 2,
    bondPenalty: "₹10 Lakhs",
    website: "https://stjohns.in",
    programs: [
      {
        course: "MBBS",
        quota: "All India Quota (15%)",
        openingRank: 1200,
        closingRank: { UR: 11200, OBC: 15400, EWS: 16000, SC: 58000, ST: 92000 },
      },
    ],
  },
];

export interface NeetPredictionInput {
  name: string;
  year: number;
  marks?: number | null;
  air?: number | null;
  percentile?: number | null;
  category: "UR" | "OBC" | "EWS" | "SC" | "ST";
  isPwd?: boolean;
  domicileState?: string;
  coursePreference?: "MBBS" | "BDS" | "ALL";
  quotaPreference?: "AIQ" | "STATE" | "ALL";
}

/**
 * Calibrated NEET 2024-2025 Marks to Expected All India Rank (AIR) converter
 */
export function marksToEstimatedNeetRank(marks: number): number {
  if (marks >= 720) return 1;
  if (marks >= 715) return 20;
  if (marks >= 710) return 85;
  if (marks >= 705) return 250;
  if (marks >= 700) return 550;
  if (marks >= 690) return 1800;
  if (marks >= 680) return 4200;
  if (marks >= 670) return 7800;
  if (marks >= 660) return 12500;
  if (marks >= 650) return 18500;
  if (marks >= 640) return 26000;
  if (marks >= 630) return 34000;
  if (marks >= 620) return 44000;
  if (marks >= 600) return 68000;
  if (marks >= 580) return 96000;
  if (marks >= 550) return 145000;
  if (marks >= 500) return 220000;
  if (marks >= 450) return 310000;
  if (marks >= 400) return 410000;
  if (marks >= 300) return 650000;
  return 850000;
}

export interface PredictedNeetCollegeResult {
  college: NeetCollege;
  matchedProgram: NeetCollege["programs"][0];
  closingRank: number;
  userRank: number;
  chancePercent: number;
  chanceTier: "HIGH" | "TARGET" | "REACH";
  badgeColor: string;
}

export function predictNeetColleges(input: NeetPredictionInput): PredictedNeetCollegeResult[] {
  const catKey = input.category || "UR";
  
  // Resolve rank: user-provided AIR or calibrated from marks
  let userRank = input.air;
  if (!userRank && input.marks) {
    userRank = marksToEstimatedNeetRank(input.marks);
  }
  if (!userRank) userRank = 4500; // fallback sensible default

  const results: PredictedNeetCollegeResult[] = [];

  for (const college of NEET_COLLEGES) {
    for (const prog of college.programs) {
      if (input.coursePreference && input.coursePreference !== "ALL" && prog.course !== input.coursePreference) {
        continue;
      }

      // Check state quota applicability
      const isStateQuota = prog.quota.includes("State Quota");
      if (isStateQuota && input.domicileState) {
        if (college.state.toLowerCase() !== input.domicileState.toLowerCase()) {
          continue; // not eligible for this other state's 85% quota
        }
      }

      const closing = prog.closingRank[catKey] ?? prog.closingRank.UR;
      const ratio = closing / userRank;

      let chancePercent = Math.min(99, Math.max(8, Math.round(ratio * 75)));
      let chanceTier: "HIGH" | "TARGET" | "REACH" = "TARGET";
      let badgeColor = "#f59e0b"; // amber for target

      if (ratio >= 1.25) {
        chanceTier = "HIGH";
        badgeColor = "#10b981"; // emerald green
        chancePercent = Math.min(99, Math.round(85 + (ratio - 1) * 10));
      } else if (ratio < 0.85) {
        chanceTier = "REACH";
        badgeColor = "#ef4444"; // red
        chancePercent = Math.max(10, Math.round(ratio * 50));
      }

      results.push({
        college,
        matchedProgram: prog,
        closingRank: closing,
        userRank,
        chancePercent,
        chanceTier,
        badgeColor,
      });
    }
  }

  // Sort by highest chance first, then by NIRF rank
  return results.sort((a, b) => {
    if (b.chanceTier === "HIGH" && a.chanceTier !== "HIGH") return 1;
    if (a.chanceTier === "HIGH" && b.chanceTier !== "HIGH") return -1;
    return a.college.nirfRank - b.college.nirfRank;
  });
}
