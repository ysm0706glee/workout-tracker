import { TrendingUp } from "lucide-react";

interface OverloadSuggestionProps {
  weight: number;
  reps: number;
  onApply: () => void;
}

export function OverloadSuggestion({
  weight,
  reps,
  onApply,
}: OverloadSuggestionProps) {
  return (
    <div className="mb-2.5 flex items-center justify-between rounded-md border border-gold/15 bg-gold/[0.08] px-2.5 py-1.5 text-xs text-gold">
      <span>
        <TrendingUp className="mr-1 inline h-3 w-3" />
        <strong>Suggested:</strong> {weight}
        kg &times; {reps}
      </span>
      <button
        onClick={onApply}
        className="rounded px-2 py-0.5 font-medium text-gold hover:bg-gold/10"
      >
        Apply
      </button>
    </div>
  );
}
