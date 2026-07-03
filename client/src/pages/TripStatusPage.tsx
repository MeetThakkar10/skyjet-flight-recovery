import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FlightDetailsPanel } from "@/components/FlightDetailsPanel";
import { RecoveryOptionsPanel } from "@/components/RecoveryOptionsPanel";
import { ChatWidget } from "@/components/ChatWidget";
import { getBooking } from "@/api/bookings";
import { useTripSession } from "@/context/TripSessionContext";
import type { Booking, Flight } from "@/types";
import { ApiRequestError } from "@/api/client";
import { Plane } from "lucide-react";

export function TripStatusPage() {
  const { id } = useParams<{ id: string }>();
  const { passengerName } = useTripSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBooking(id);
      setBooking(data.booking);
      setFlight(data.flight);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load your trip.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Loading your trip..." />;
  if (error) {
    return (
      <div className="flex w-full justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <ErrorBanner message={error} />
        </div>
      </div>
    );
  }
  if (!booking || !flight || !id) return null;

  return (
    <div className="w-full px-6 py-8 lg:px-16">
      {/* ── Route hero banner ── */}
      <div className="mb-6 flex flex-col gap-2 rounded-xl bg-primary px-6 py-5 text-primary-foreground">
        {passengerName && (
          <p className="text-sm font-medium text-primary-foreground/70">Passenger: {passengerName}</p>
        )}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold tracking-tight">{flight.origin}</span>
          <div className="flex flex-1 items-center gap-1">
            <div className="h-px flex-1 bg-primary-foreground/30" />
            <Plane className="size-5 text-primary-foreground/80" />
            <div className="h-px flex-1 bg-primary-foreground/30" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight">{flight.destination}</span>
        </div>
        <p className="text-sm text-primary-foreground/70 font-medium">
          Flight {flight.flightNumber}
          {booking.pnr && (
            <> · <span className="font-mono tracking-widest">{booking.pnr}</span></>
          )}
        </p>
      </div>

      {/* ── Trip details: single column on mobile, two columns on desktop ── */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
        <FlightDetailsPanel booking={booking} flight={flight} passengerName={passengerName} />
        <Card className="border-border shadow-sm lg:self-start">
          <CardContent className="pt-5">
            <RecoveryOptionsPanel bookingId={id} />
          </CardContent>
        </Card>
      </div>

      {/* ── Floating AI agent launcher, opens from bottom-right on every device ── */}
      <ChatWidget bookingId={id} open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
