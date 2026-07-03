import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FlightDetailsPanel } from "@/components/FlightDetailsPanel";
import { RecoveryOptionsPanel } from "@/components/RecoveryOptionsPanel";
import { ChatWidget } from "@/components/ChatWidget";
import { getBooking } from "@/api/bookings";
import { useTripSession } from "@/context/TripSessionContext";
import type { Booking, Flight } from "@/types";
import { ApiRequestError } from "@/api/client";
import { Plane, MessageCircle, ArrowRight } from "lucide-react";

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
      <div className="mx-auto max-w-lg px-4 py-12">
        <ErrorBanner message={error} />
      </div>
    );
  }
  if (!booking || !flight || !id) return null;

  return (
    <div className="mx-auto flex min-h-[calc(100svh-56px)] max-w-2xl flex-col gap-5 px-4 py-10">
      {/* ── Route hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-5 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.95_0.05_270/15%)_0%,transparent_60%)]" />
        <div className="relative flex flex-col gap-2">
          {passengerName && (
            <p className="text-sm font-medium text-white/70">Passenger: {passengerName}</p>
          )}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold tracking-tight">{flight.origin}</span>
            <div className="flex flex-1 items-center gap-1">
              <div className="h-px flex-1 bg-white/30" />
              <Plane className="size-5 text-white/80" />
              <div className="h-px flex-1 bg-white/30" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">{flight.destination}</span>
          </div>
          <p className="text-sm text-white/70 font-medium">
            Flight {flight.flightNumber}
            {booking.pnr && (
              <> · <span className="font-mono tracking-widest">{booking.pnr}</span></>
            )}
          </p>
        </div>
      </div>

      <FlightDetailsPanel booking={booking} flight={flight} passengerName={passengerName} />

      <Card className="border-border/60 shadow-sm">
        <CardContent className="flex flex-col gap-3 pt-5">
          <RecoveryOptionsPanel bookingId={id} />

          <Button
            variant="outline"
            className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
            onClick={() => setChatOpen(true)}
          >
            <MessageCircle className="size-4" />
            Talk to an agent
            <ArrowRight className="size-3.5 ml-auto" />
          </Button>
        </CardContent>
      </Card>

      <ChatWidget bookingId={id} open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
