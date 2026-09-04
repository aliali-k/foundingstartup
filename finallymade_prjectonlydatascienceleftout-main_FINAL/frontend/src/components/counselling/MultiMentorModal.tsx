import { useState } from "react";
import { MENTORS, type MentorProfile } from "@/data/mentors";
import { broadcastRequestToMentors, type CounsellingRequest } from "@/lib/counselling-store";
import { useNavigate } from "@tanstack/react-router";

export function MultiMentorModal({
  isOpen,
  onClose,
  request,
  onBroadcastComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: CounsellingRequest;
  onBroadcastComplete?: (updatedReq: CounsellingRequest) => void;
}) {
  const navigate = useNavigate();

  // Find candidate matching mentors not already in sent list
  const suggestedMentors = MENTORS.filter(
    (m) => m.id !== request.activeHelperId && !request.sentToHelperIds.includes(m.id)
  ).slice(0, 4);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    suggestedMentors.slice(0, 3).map((m) => m.id)
  );

  if (!isOpen || !request) return null;

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSend = () => {
    if (selectedIds.length === 0) return;
    const updated = broadcastRequestToMentors(request.id, selectedIds);
    if (updated) {
      if (onBroadcastComplete) onBroadcastComplete(updated);
      onClose();
      // Navigate to comparison screen
      navigate({
        to: "/counselling/compare",
        search: { requestId: request.id },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-[0.2em]">
              ✦ AI MULTI-MENTOR BROKER
            </span>
            <h2 className="text-lg font-black tracking-tight text-foreground mt-0.5">
              Broadcast Same Request to Matching Mentors
            </h2>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg border border-border text-muted-foreground hover:text-foreground flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Reusable Request Summary */}
        <div className="rounded-xl bg-muted/40 p-3.5 space-y-1.5 text-xs">
          <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
            Reusable Normalized Request
          </span>
          <p className="font-bold text-foreground">{request.title}</p>
          <p className="text-muted-foreground text-[11px] font-sans leading-relaxed">
            {request.normalizedSummary}
          </p>
          <span className="mono text-[9px] text-purple-500 block pt-1">
            ✓ Exactly the same question set is delivered to prevent quoting discrepancies.
          </span>
        </div>

        {/* Helpers Selection List */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-2">
            Matching Helpers Ready to Quote ({suggestedMentors.length} available)
          </label>
          <div className="space-y-2">
            {suggestedMentors.map((m) => {
              const isChecked = selectedIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleSelect(m.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border bg-background hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded accent-purple-600"
                    />
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="size-8 rounded-full border border-border object-cover"
                    />
                    <div>
                      <span className="font-bold text-xs text-foreground block">
                        {m.name}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground block font-sans">
                        {m.currentRole} · {m.collegeName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground">
                      ₹{m.priceRange.min}–₹{m.priceRange.max}
                    </span>
                    <span className="text-[9px] text-muted-foreground block">
                      ★ {m.rating} ({m.sessionsCount}+)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-2.5 text-xs text-muted-foreground hover:text-foreground font-bold"
          >
            Only Keep Current Mentor
          </button>
          <button
            onClick={handleSend}
            disabled={selectedIds.length === 0}
            className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 py-2.5 text-xs font-bold text-white transition disabled:opacity-40"
          >
            Broadcast to {selectedIds.length} Helpers & Compare →
          </button>
        </div>
      </div>
    </div>
  );
}
