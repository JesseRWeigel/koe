import type { SessionProgress as ProgressData } from "@/lib/srs/review-session";

interface SessionProgressProps {
  progress: ProgressData;
}

export function SessionProgress({ progress }: SessionProgressProps) {
  const percent =
    progress.total === 0 ? 0 : (progress.completed / progress.total) * 100;

  return (
    <div className="w-full max-w-lg">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-mono text-muted-foreground">
          {progress.completed} / {progress.total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
