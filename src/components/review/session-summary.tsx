import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircleIcon, ClockIcon, TargetIcon } from "lucide-react";
import type { SessionSummary as SummaryData } from "@/lib/srs/review-session";

interface SessionSummaryProps {
  summary: SummaryData;
  onDone: () => void;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function SessionSummary({ summary, onDone }: SessionSummaryProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">Session Complete</h2>

      <div className="grid w-full grid-cols-3 gap-3">
        <Card>
          <CardHeader className="flex flex-col items-center pb-2">
            <CheckCircleIcon className="text-muted-foreground mb-1 h-5 w-5" />
            <CardTitle className="text-xs font-medium">Reviewed</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold font-mono">
              {summary.totalReviewed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-center pb-2">
            <TargetIcon className="text-muted-foreground mb-1 h-5 w-5" />
            <CardTitle className="text-xs font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold font-mono">
              {Math.round(summary.accuracy)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-center pb-2">
            <ClockIcon className="text-muted-foreground mb-1 h-5 w-5" />
            <CardTitle className="text-xs font-medium">Time</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold font-mono">
              {formatElapsed(summary.elapsedMs)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button size="lg" className="mt-2 w-full" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}
