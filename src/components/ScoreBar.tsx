import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  delay?: number;
  className?: string;
}

export function ScoreBar({ label, score, maxScore = 100, className }: ScoreBarProps) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const color = pct >= 85 ? "bg-success" : pct >= 65 ? "bg-warning" : "bg-destructive";

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-card-foreground">{label}</span>
        <span className="text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
