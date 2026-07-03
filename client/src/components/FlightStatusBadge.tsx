import { Badge } from "@/components/ui/badge";
import type { FlightStatus } from "@/types";

const STYLES: Record<FlightStatus, string> = {
  "on-time": "bg-green-100 text-green-800 border-green-300",
  delayed: "bg-amber-100 text-amber-800 border-amber-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const LABELS: Record<FlightStatus, string> = {
  "on-time": "On Time",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

export function FlightStatusBadge({ status }: { status: FlightStatus }) {
  return (
    <Badge variant="outline" className={STYLES[status]}>
      {LABELS[status]}
    </Badge>
  );
}
