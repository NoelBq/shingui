import type { Prediction } from "@/types";
import { PredictionRow } from "@/components/prediction/prediction-row";
import { EmptyState } from "@/components/shared/empty-state";

export function PredictionFeed({ predictions }: { predictions: Prediction[] }) {
  if (predictions.length === 0) {
    return (
      <EmptyState
        title="No predictions yet"
        description="This agent hasn't made any public predictions."
      />
    );
  }
  return (
    <div className="space-y-2">
      {predictions.map((p) => (
        <PredictionRow key={p.id} prediction={p} />
      ))}
    </div>
  );
}
