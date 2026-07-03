import { cn } from "@/lib/utils";
import type { FlightStatus } from "@/types";

interface JourneyProgressProps {
  origin: string;
  destination: string;
  status: FlightStatus;
}

const SEGMENT_STYLES: Record<FlightStatus, string> = {
  "on-time": "bg-primary",
  delayed: "bg-amber-500",
  cancelled: "bg-destructive",
};

export function JourneyProgress({ origin, destination, status }: JourneyProgressProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="size-2.5 shrink-0 rounded-full bg-primary" />
        <div className={cn("h-0.5 flex-1 rounded-full", SEGMENT_STYLES[status])} />
        <span
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            status === "cancelled" ? "bg-muted-foreground/30" : "bg-primary"
          )}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{origin}</span>
        <span>{destination}</span>
      </div>
    </div>
  );
}
