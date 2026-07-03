import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AlternateFlight } from "@/types";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AlternateFlightCard({
  flight,
  cabin,
  onSelect,
  selecting,
}: {
  flight: AlternateFlight;
  cabin: string;
  onSelect: () => void;
  selecting: boolean;
}) {
  const seats = flight.seatsAvailable[cabin] ?? 0;
  const soldOut = seats <= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{flight.flightNumber}</span>
          {soldOut ? (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Sold out
            </Badge>
          ) : (
            <span className="text-sm font-normal text-muted-foreground">{seats} seats left</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Departs {formatTime(flight.departureTime)} · Arrives {formatTime(flight.arrivalTime)}
        </div>
        <Button size="sm" onClick={onSelect} disabled={selecting || soldOut}>
          {soldOut ? "Sold out" : selecting ? "Booking..." : "Select"}
        </Button>
      </CardContent>
    </Card>
  );
}
