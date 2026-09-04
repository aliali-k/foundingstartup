import { useState } from "react";
import { submitReview } from "@/lib/counselling-store";
import { useNavigate } from "@tanstack/react-router";

export function SessionReviewModal({
  isOpen,
  onClose,
  sessionId,
  helperId,
  helperName,
}: {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  helperId: string;
  helperName: string;
}) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [relevance, setRelevance] = useState(5);
  const [understanding, setUnderstanding] = useState(5);
  const [valueForMoney, setValueForMoney] = useState(5);
  const [comment, setComment] = useState(
    "Super direct and honest advice. Riya explained the exact Hero MotoCorp internship numbers and gave me clarity on why Kurukshetra Mechanical is the right choice for me."
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    submitReview({
      sessionId,
      helperId,
      seekerName: "Aman (Verified Candidate)",
      rating,
      relevanceScore: relevance,
      understandingScore: understanding,
      valueForMoneyScore: valueForMoney,
      comment,
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      navigate({ to: "/counselling" });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 font-mono">
        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <span className="size-12 rounded-full bg-emerald-500/20 text-emerald-500 text-2xl flex items-center justify-center mx-auto">
              ✓
            </span>
            <h3 className="text-lg font-bold text-foreground">Review Submitted!</h3>
            <p className="text-xs text-muted-foreground font-sans">
              Thank you for contributing to transparent community benchmarks. {helperName}'s rating has been updated.
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-border pb-3">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-blue-500">
                ◆ SESSION FEEDBACK
              </span>
              <h2 className="text-lg font-black tracking-tight text-foreground mt-0.5">
                How useful was your session with {helperName}?
              </h2>
            </div>

            {/* 5-Star Primary Rating */}
            <div className="text-center py-2 space-y-2">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 ${
                      star <= rating ? "text-amber-400" : "text-muted-foreground/30"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground block font-bold">
                {rating === 5 ? "Exceptional & Highly Actionable (5/5)" : `${rating}/5 Stars`}
              </span>
            </div>

            {/* Score Sliders */}
            <div className="space-y-3 text-xs bg-muted/40 p-4 rounded-xl">
              <div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Did the helper understand your problem?</span>
                  <span className="font-bold text-foreground">{understanding}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={understanding}
                  onChange={(e) => setUnderstanding(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Was the advice grounded and relevant?</span>
                  <span className="font-bold text-foreground">{relevance}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={relevance}
                  onChange={(e) => setRelevance(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Was the quote fair for the scope provided?</span>
                  <span className="font-bold text-foreground">{valueForMoney}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={valueForMoney}
                  onChange={(e) => setValueForMoney(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                Your Public Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs font-sans text-foreground outline-none focus:border-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border py-2.5 text-xs text-muted-foreground hover:text-foreground font-bold"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white transition shadow-sm"
              >
                Submit Feedback →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
