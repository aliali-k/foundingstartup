import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PredictionProcessing } from "@/components/PredictionProcessing";
import { NeetClinicalProcessing } from "@/components/NeetClinicalProcessing";
import { BranchSolarSystem } from "@/components/BranchSolarSystem";
import { ResultDashboard } from "@/components/ResultDashboard";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import {
  getReport,
  setReport,
  setReportPdf,
  getPendingPredictPayload,
  clearPendingPredictPayload,
} from "@/lib/prediction-store";
import { parsePredictionPdf, type ParsedReport } from "@/lib/parse-prediction-pdf";

const API_BASE = "http://localhost:8000";
// Keeps the cinematic solar-system screen on-screen for a sane minimum time
// even if the backend responds instantly.
const MIN_DISPLAY_MS = 4000;

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Processing · JoSAA Predictor" },
      { name: "description", content: "Live cinematic compile of your JoSAA prediction report." },
    ],
  }),
  component: Processing,
});

function Processing() {
  const navigate = useNavigate();
  const [report, setReportState] = useState<ParsedReport | null>(null);
  const [done, setDone] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [autoBusy, setAutoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Case 1: a report is already prepared (e.g. from a previous session), pick it up.
    const existing = getReport();
    if (existing) {
      setReportState(existing);
      return;
    }

    // Case 2: the predictor form (prediction-modal.tsx) just handed us a payload —
    // call the backend ourselves and parse the PDF it returns.
    const pending = getPendingPredictPayload();
    if (!pending) return;

    setAutoBusy(true);
    const startedAt = Date.now();
    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS));

    const work = fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pending),
    })
      .then((res) => {
        if (res.headers.get("content-type") !== "application/pdf") {
          throw new Error("Prediction failed");
        }
        return res.blob();
      })
      .then(async (blob) => {
        const file = new File([blob], "report.pdf", { type: "application/pdf" });
        setReportPdf(file);
        return parsePredictionPdf(file);
      });

    Promise.all([work, minDelay])
      .then(([parsed]) => {
        clearPendingPredictPayload();
        if (parsed.colleges.length === 0) {
          setUploadError("Could not detect any college blocks in the generated report.");
          setAutoBusy(false);
          return;
        }
        setReport(parsed);
        setReportState(parsed);
      })
      .catch((e) => {
        console.error("Predict failed:", e);
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
        setTimeout(() => {
          setUploadError("Could not generate your prediction report. Is the backend running on :8000?");
          setAutoBusy(false);
        }, remaining);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onUploadFile(file: File | null) {
    if (!file) return;
    setUploadError(null);
    setUploadBusy(true);
    try {
      const parsed = await parsePredictionPdf(file);
      if (parsed.colleges.length === 0) {
        setUploadError("Could not detect any college blocks in this PDF. Make sure it's a JoSAA prediction PDF.");
        return;
      }
      setReportPdf(file);
      setReport(parsed);
      setReportState(parsed);
    } catch (e) {
      console.error("Upload parse failed:", e);
      setUploadError("Couldn't read that PDF. Please upload a valid prediction report.");
    } finally {
      setUploadBusy(false);
    }
  }

  if (!report) {
    return (
      <div className="cosmic-scope min-h-screen bg-background text-foreground font-mono">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <span className="size-3 rotate-45 bg-accent" />
            <span className="text-xl font-black tracking-tight">JoSAA</span>
          </div>
          <div className="hidden text-xs uppercase tracking-[0.45em] text-muted-foreground md:block">
            Decoding your rank into possibilities
          </div>
          <ThemeSwitch />
        </header>

        <section className="relative h-[calc(100vh-3.5rem)]">
          <BranchSolarSystem />
          {autoBusy ? (
            <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
              Talking to the prediction engine…
            </div>
          ) : (
            <a
              href="#upload"
              className="pointer-events-auto absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground transition hover:text-foreground"
            >
              <span>Scroll to upload</span>
              <span className="text-lg" style={{ animation: "scroll-cue 1.6s ease-in-out infinite" }}>
                ↓
              </span>
            </a>
          )}
        </section>

        {!autoBusy && (
        <section
          id="upload"
          className="relative flex min-h-screen flex-col items-center justify-center border-t border-border px-6 py-16"
        >
          <div className="absolute inset-0 -z-10 josaa-grid opacity-40" />

          <div className="w-full max-w-2xl">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                ◆ Drop your PDF for prediction
              </div>
              <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-tight md:text-6xl">
                Drop your<br />
                prediction PDF.<br />
                <span className="text-accent">See the future.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground md:text-base">
                Upload your JoSAA prediction report. We'll parse it locally in your browser, then run a
                cinematic 8-second compile across your colleges, branches, packages and mentors.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <label
                htmlFor="pdf-input"
                className="block cursor-pointer rounded-md border-2 border-dashed border-border bg-card/60 p-8 text-center transition hover:border-accent hover:bg-card"
              >
                <div className="text-sm font-bold uppercase tracking-[0.22em] text-accent">
                  {uploadBusy ? "Reading PDF…" : "Click or drop your prediction PDF"}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  PDF only · parsed locally · never uploaded to a server
                </div>
                <input
                  ref={fileRef}
                  id="pdf-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => onUploadFile(e.target.files?.[0] ?? null)}
                />
              </label>

              {uploadError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                  {uploadError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  ◆ Local · private · no upload
                </div>
                <button
                  type="button"
                  disabled={uploadBusy}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-md bg-accent px-7 py-3 text-xs font-black uppercase tracking-[0.24em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {uploadBusy ? "Reading…" : "Predict Now →"}
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  className="mono text-[10px] rounded-sm border border-border px-4 py-2 tracking-[1px] text-muted-foreground transition hover:border-accent"
                >
                  ← BACK HOME
                </button>
              </div>
            </div>
          </div>
        </section>
        )}
      </div>
    );
  }

  const isNeetReport = report?.isNeet || report?.student?.examType?.toLowerCase().includes("neet");

  return (
    <div className="relative">
      {!done && (
        isNeetReport ? (
          <NeetClinicalProcessing parsedReport={report} onDone={() => setDone(true)} />
        ) : (
          <div className="cosmic-scope">
            <PredictionProcessing parsedReport={report} onDone={() => setDone(true)} />
          </div>
        )
      )}
      {done && <ResultDashboard parsedReport={report} onReplay={() => setDone(false)} />}
    </div>
  );
}
