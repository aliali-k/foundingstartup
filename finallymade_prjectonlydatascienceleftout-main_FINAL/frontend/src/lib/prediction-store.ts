import type { ParsedReport } from "./parse-prediction-pdf";

let current: ParsedReport | null = null;

const KEY = "josaa.report";

export function setReport(report: ParsedReport) {
  current = report;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(report));
  } catch {
    // ignore
  }
}

export function getReport(): ParsedReport | null {
  if (current) return current;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      current = JSON.parse(raw) as ParsedReport;
      return current;
    }
  } catch {
    // ignore
  }
  return null;
}

export function clearReport() {
  current = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

const PENDING_KEY = "josaa.pendingPredict";

export function setPendingPredictPayload(data: unknown) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getPendingPredictPayload(): unknown | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function clearPendingPredictPayload() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
}

// ── Generated report PDF (for the dashboard "Download PDF Report" box) ──
// The Blob is kept in memory for the current session (survives client-side
// navigation to the dashboard). A pdfId, when available, is persisted so the
// exact same file can be re-fetched from the backend's /get-pdf/{pdf_id}.
let currentPdf: Blob | null = null;
const PDF_ID_KEY = "josaa.pdfId";

export function setReportPdf(blob: Blob) {
  currentPdf = blob;
}

export function getReportPdf(): Blob | null {
  return currentPdf;
}

export function setReportPdfId(id: string) {
  try {
    sessionStorage.setItem(PDF_ID_KEY, id);
  } catch {
    // ignore
  }
}

export function getReportPdfId(): string | null {
  try {
    return sessionStorage.getItem(PDF_ID_KEY);
  } catch {
    return null;
  }
}
