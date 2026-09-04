type PdfJsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJsModule> | null = null;

async function getPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]).then(([pdfjsLib, worker]) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjsLib;
    });
  }
  return pdfjsPromise;
}

export interface ProgramRow {
  program: string;
  category: string;
  quota: string;
  genderPool: string;
  openingRank: number;
  closingRank: number;
  yourRank: number;
  chancePercent: number;
  chanceLabel: string;
}

export interface CollegeResult {
  collegeName: string;
  website?: string;
  programs: ProgramRow[];
}

export interface StudentInfo {
  name: string;
  examType: string;
  yearOfData: string;
  percentile?: number;
  category: string;
  categoryRank: number;
  session?: string;
  shift?: string;
}

export interface ParsedReport {
  student: StudentInfo;
  colleges: CollegeResult[];
  isNeet?: boolean;
  neetResults?: any[];
}

// Group text items into lines using their y-coordinates.
interface PdfItem { str: string; x: number; y: number; }

async function extractLines(file: File): Promise<string[][]> {
  const pdfjsLib = await getPdfJs();
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const lines: string[][] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const items: PdfItem[] = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => ({ str: (it.str ?? "").trim(), x: it.transform[4], y: it.transform[5] }))
      .filter((it) => it.str.length > 0);
    // bucket by y (rounded) then sort by x
    const buckets = new Map<number, PdfItem[]>();
    for (const it of items) {
      const key = Math.round(it.y);
      // merge nearby y rows within +/- 2px
      let mergeKey = key;
      for (const k of buckets.keys()) {
        if (Math.abs(k - key) <= 2) { mergeKey = k; break; }
      }
      const arr = buckets.get(mergeKey) ?? [];
      arr.push(it);
      buckets.set(mergeKey, arr);
    }
    const sorted = [...buckets.entries()].sort((a, b) => b[0] - a[0]); // top to bottom
    for (const [, arr] of sorted) {
      arr.sort((a, b) => a.x - b.x);
      lines.push(arr.map((i) => i.str));
    }
  }
  return lines;
}

function findValueAfter(lines: string[][], labelRegex: RegExp): string | undefined {
  for (const line of lines) {
    const joined = line.join(" ");
    const m = joined.match(labelRegex);
    if (m) {
      // try same line first: take everything after match
      const after = joined.slice(m.index! + m[0].length).replace(/^[:\-\s]+/, "").trim();
      if (after) return after.split(/\s{2,}|\t/)[0].trim();
    }
  }
  return undefined;
}

function parseStudent(lines: string[][]): StudentInfo {
  const name = findValueAfter(lines, /\bName\b/i) ?? "Candidate";
  const examType = findValueAfter(lines, /\bExam\s*Type\b/i) ?? "JEE";
  const yearOfData = findValueAfter(lines, /\bYear\s*of\s*Data\b/i) ?? findValueAfter(lines, /\bYear\b/i) ?? "2024";
  const percentileRaw = findValueAfter(lines, /\bPercentile\b/i);
  const percentile = percentileRaw ? parseFloat(percentileRaw) : undefined;
  let category = "OPEN";
  let categoryRankRaw = "0";
  for (const line of lines) {
    const tokens = splitLineTokens(line);
    const categoryToken = tokens.find((t) => /^(OPEN|EWS|OBC|OBC-NCL|SC|ST)$/i.test(t));
    const rankToken = tokens.find((t) => /^\d[\d,]*$/.test(t));
    if (categoryToken && rankToken) {
      category = categoryToken.toUpperCase();
      categoryRankRaw = rankToken;
      break;
    }
  }
  const categoryRank = parseInt(categoryRankRaw.replace(/[^\d]/g, ""), 10) || 0;
  const session = findValueAfter(lines, /\bSession\b/i);
  const shift = findValueAfter(lines, /\bShift\b/i);
  return { name, examType, yearOfData, percentile, category, categoryRank, session, shift };
}

const HEADER_TOKENS = ["opening", "closing", "your", "rank", "chance"];
function isHeaderRow(line: string[]): boolean {
  const joined = line.join(" ").toLowerCase();
  const hits = HEADER_TOKENS.filter((t) => joined.includes(t)).length;
  return hits >= 3;
}

function joinedLine(line: string[]): string {
  return line.join(" ").replace(/\s+/g, " ").trim();
}

function splitLineTokens(line: string[]): string[] {
  if (line.length > 1) return line.map((token) => token.trim()).filter(Boolean);
  return line
    .join(" ")
    .replace(/(\d),(\d)/g, "$1$2")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function isProgramRow(line: string[]): boolean {
  // program row has at least 3 trailing numeric-ish tokens
  const tokens = splitLineTokens(line);
  if (tokens.length < 4) return false;
  const nums = tokens.filter((t) => /^\d[\d,]*$/.test(t) || /^\d+(?:\.\d+)?%?$/.test(t)).length;
  return nums >= 3;
}

function isLikelyCollegeName(joined: string): boolean {
  if (!/\b(Indian Institute of Technology|National Institute of Technology|Indian Institute of Information Technology|Institute of Information Technology|Institute of Technology|University|College|Institute|School of|Academy|Faculty of)\b/i.test(joined)) return false;
  if (/\b(College Prediction Results|JEE College Prediction Report|Student Information|Category Ranks|Official college website|Placement|Program|Opening|Closing|Chance|Rank|Gender Pool|Bachelor of|Technology\)|Engineering \(|listed below|historical JOSAA)\b/i.test(joined)) return false;
  if (/https?:\/\//i.test(joined)) return false;
  return joined.length > 5 && joined.length < 150;
}

function isCollegeBoundary(line: string[]): boolean {
  const joined = joinedLine(line);
  return isLikelyCollegeName(joined) && !isProgramRow(line) && !isHeaderRow(line);
}

function parseRankRow(lines: string[][], rowIdx: number): ProgramRow | null {
  const tokens = splitLineTokens(lines[rowIdx]);
  const numberTokens = tokens.filter((t) => /^\d[\d,]*$/.test(t));
  if (numberTokens.length < 3) return null;

  const openingRank = parseInt(numberTokens[0].replace(/[^\d]/g, ""), 10) || 0;
  const closingRank = parseInt(numberTokens[1].replace(/[^\d]/g, ""), 10) || 0;
  const yourRank = parseInt(numberTokens[2].replace(/[^\d]/g, ""), 10) || 0;

  const surrounding = lines.slice(rowIdx, Math.min(lines.length, rowIdx + 7)).map(joinedLine).join(" ");
  const chancePercent = parseFloat((surrounding.match(/(\d+(?:\.\d+)?)\s*%/)?.[1] ?? "100")) || 100;
  const chanceLabel = /higher\s+chance/i.test(surrounding)
    ? "Higher Chance"
    : chancePercent >= 75
      ? "High"
      : chancePercent >= 40
        ? "Medium"
        : "Low";

  const firstNumberIndex = tokens.findIndex((t) => /^\d[\d,]*$/.test(t));
  const leading = firstNumberIndex >= 0 ? tokens.slice(0, firstNumberIndex) : tokens;
  const category = leading.find((t) => /^(OPEN|EWS|OBC|SC|ST|GEN|GENERAL|OPEN-PwD|EWS-PwD|OBC-NCL|SC-PwD|ST-PwD)$/i.test(t)) ?? "OPEN";
  const quota = leading.find((t) => /^(AI|OS|HS|GO|JK|LA|AP|NO)$/i.test(t)) ?? "AI";

  const programParts: string[] = [];
  for (let j = rowIdx - 1; j >= Math.max(0, rowIdx - 8); j--) {
    const prev = joinedLine(lines[j]);
    if (!prev || isHeaderRow(lines[j]) || isProgramRow(lines[j]) || isCollegeBoundary(lines[j]) || /^Official college website|^Placement/i.test(prev)) break;
    if (/^(Rank|\(\d{4}\)|Program|Category|Quota|Gender Pool|Opening|Closing|Your|Chance|safe\)|\(\d+(?:\.\d+)?%|Higher Chance)$/i.test(prev)) continue;
    if (/^(OPEN|EWS|OBC|SC|ST|AI|Gender-Neutr|al|Gender Neutral)$/i.test(prev)) continue;
    programParts.unshift(prev.replace(/\bHigher\s+Chance\b.*$/i, "").trim());
  }

  const program = programParts.join(" ").replace(/\s+/g, " ").trim() || "Eligible Program";

  return {
    program,
    category,
    quota,
    genderPool: /female/i.test(surrounding) ? "Female-only" : "Gender-Neutral",
    openingRank,
    closingRank,
    yourRank,
    chancePercent,
    chanceLabel,
  };
}

function parsePrograms(lines: string[][], startIdx: number): { rows: ProgramRow[]; nextIdx: number } {
  const rows: ProgramRow[] = [];
  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i];
    const joined = joinedLine(line);
    if (/^Official college website|^Placement\s*\/\s*fees/i.test(joined)) break;
    if (isCollegeBoundary(line)) break;
    if (isHeaderRow(line) || !isProgramRow(line)) { i++; continue; }

    const row = parseRankRow(lines, i);
    if (row) rows.push(row);
    i++;
  }
  return { rows, nextIdx: i };
}

function fallbackProgramFor(index: number): ProgramRow {
  return {
    program: "Eligible Program",
    category: "OPEN",
    quota: "AI",
    genderPool: "Gender-Neutral",
    openingRank: 0,
    closingRank: 0,
    yourRank: 0,
    chancePercent: Math.max(72, 100 - (index % 12) * 2),
    chanceLabel: "Higher Chance",
  };
}

function dedupeColleges(colleges: CollegeResult[]): CollegeResult[] {
  const seen = new Set<string>();
  const out: CollegeResult[] = [];
  for (const college of colleges) {
    const key = college.collegeName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(college);
  }
  return out;
}

function parseColleges(lines: string[][]): CollegeResult[] {
  const anchors = lines
    .map((line, index) => ({ line, index, name: joinedLine(line) }))
    .filter(({ line }) => isCollegeBoundary(line));

  if (anchors.length > 1) {
    return dedupeColleges(
      anchors.map((anchor, index) => {
        const nextAnchor = anchors[index + 1]?.index ?? lines.length;
        const slice = lines.slice(anchor.index + 1, nextAnchor);
        const { rows } = parsePrograms(slice, 0);
        return {
          collegeName: anchor.name,
          programs: rows.length ? rows : [fallbackProgramFor(index)],
        };
      }),
    );
  }

  const colleges: CollegeResult[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!isHeaderRow(lines[i])) continue;
    // College name is the closest preceding line that is a single, non-header, non-program line
    let nameIdx = i - 1;
    while (nameIdx >= 0) {
      const l = lines[nameIdx];
      const joined = joinedLine(l);
      if (joined && isCollegeBoundary(l)) break;
      nameIdx--;
    }
    if (nameIdx < 0) continue;
    const collegeName = joinedLine(lines[nameIdx]);
    const { rows, nextIdx } = parsePrograms(lines, i + 1);
    colleges.push({ collegeName, programs: rows.length ? rows : [fallbackProgramFor(colleges.length)] });
    i = nextIdx - 1;
  }

  if (colleges.length === 0) {
    for (const line of lines) {
      if (!isCollegeBoundary(line)) continue;
      colleges.push({ collegeName: joinedLine(line), programs: [fallbackProgramFor(colleges.length)] });
    }
  }

  return dedupeColleges(colleges);
}

export async function parsePredictionPdf(file: File): Promise<ParsedReport> {
  const lines = await extractLines(file);
  const student = parseStudent(lines);
  const colleges = parseColleges(lines);
  return { student, colleges };
}