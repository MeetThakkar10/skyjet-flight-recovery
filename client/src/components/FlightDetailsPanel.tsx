import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FlightStatusBadge } from "@/components/FlightStatusBadge";
import { JourneyProgress } from "@/components/JourneyProgress";
import { Timeline, type TimelineStep } from "@/components/Timeline";
import type { Booking, Flight } from "@/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const DISRUPTION_LABELS: Record<string, string> = {
  technical: "Technical issue",
  weather: "Weather",
  "crew-unavailable": "Crew unavailable",
  "seat-unavailable": "Seat unavailable",
  "missed-connection": "Missed connection",
};

export function FlightDetailsPanel({
  booking,
  flight,
  passengerName,
}: {
  booking: Booking;
  flight: Flight;
  passengerName: string | null;
}) {
  const steps: TimelineStep[] = [
    { label: `Scheduled departure — ${formatDateTime(flight.departureTime)}`, state: "done" },
    {
      label:
        flight.status === "cancelled"
          ? "Flight cancelled"
          : flight.status === "delayed"
          ? `Delayed ${flight.delayMinutes} min`
          : "On time",
      state: flight.status === "on-time" ? "done" : "current",
    },
    { label: `Scheduled arrival — ${formatDateTime(flight.arrivalTime)}`, state: "pending" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl">
          <span>{flight.flightNumber}</span>
          <FlightStatusBadge status={flight.status} />
        </CardTitle>
        <CardDescription>
          {flight.origin} → {flight.destination} · PNR {booking.pnr}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {passengerName && <div className="text-muted-foreground">Passenger: {passengerName}</div>}

        <JourneyProgress origin={flight.origin} destination={flight.destination} status={flight.status} />

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>Cabin: {booking.cabin}</span>
          {flight.gate && <span>Gate: {flight.gate}</span>}
          {flight.terminal && <span>Terminal: {flight.terminal}</span>}
        </div>

        {flight.disruptionType !== "none" && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-800">
              {DISRUPTION_LABELS[flight.disruptionType] ?? flight.disruptionType}
            </Badge>
            {flight.delayMinutes > 0 && (
              <span className="text-xs text-muted-foreground">Delay: {flight.delayMinutes} min</span>
            )}
          </div>
        )}
        {flight.reason && <p className="text-muted-foreground">{flight.reason}</p>}

        <Separator />
        <Timeline steps={steps} />

        {booking.rebooking.state === "auto-rebooked" && (
          <p className="font-medium text-green-700">You've been rebooked onto an alternate flight.</p>
        )}
        {booking.escalation.flagged && (
          <p className="font-medium text-amber-700">
            A request is with our agents (ref {booking.escalation.escalationRef}).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
