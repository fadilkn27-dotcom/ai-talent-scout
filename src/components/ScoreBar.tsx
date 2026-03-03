import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  delay?: number;
  className?: string;
}

export function ScoreBar({ label, score, maxScore = 100, delay = 0, className }: ScoreBarProps) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const color = pct >= 85 ? "bg-success" : pct >= 65 ? "bg-warning" : "bg-destructive";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-card-foreground">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}
