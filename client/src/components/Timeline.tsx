import { cn } from "@/lib/utils";

export interface TimelineStep {
  label: string;
  timestamp?: string;
  state: "done" | "current" | "pending";
}

const DOT_STYLES: Record<TimelineStep["state"], string> = {
  done: "bg-primary",
  current: "bg-amber-500",
  pending: "bg-muted-foreground/30",
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className={cn("mt-1 size-2.5 shrink-0 rounded-full", DOT_STYLES[step.state])} />
          <div className="flex flex-col">
            <span className={cn("text-sm", step.state === "pending" ? "text-muted-foreground" : "text-foreground")}>
              {step.label}
            </span>
            {step.timestamp && <span className="text-xs text-muted-foreground">{step.timestamp}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
