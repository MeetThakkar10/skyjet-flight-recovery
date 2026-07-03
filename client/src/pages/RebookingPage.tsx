import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlternateFlightCard } from "@/components/AlternateFlightCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { getBooking, getAlternatives, rebook, escalate } from "@/api/bookings";
import { getAlternateFlightsForBooking } from "@/api/alternateFlights";
import { rebookViaRecovery } from "@/api/recovery";
import type { AlternateFlight, AlternateFlightCardData, Booking } from "@/types";
import { ApiRequestError } from "@/api/client";
import { CheckCircle2, ArrowLeft, Plane } from "lucide-react";

function toAlternateFlightProp(data: AlternateFlightCardData): AlternateFlight {
  return {
    flightId: data.flightId,
    flightNumber: data.flightNumber,
    departureTime: data.departureTime,
    arrivalTime: data.arrivalTime,
    cabinClasses: [data.cabin],
    seatsAvailable: { [data.cabin]: data.availableSeats },
  };
}

export function RebookingPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isRecoveryFlow = searchParams.get("source") === "recovery";
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [alternatives, setAlternatives] = useState<AlternateFlight[]>([]);
  const [canAutoRebook, setCanAutoRebook] = useState<boolean | null>(null);
  const [escalationReason, setEscalationReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [escalating, setEscalating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { booking: b, flight } = await getBooking(id);
      setBooking(b);

      if (isRecoveryFlow) {
        const result = await getAlternateFlightsForBooking(id);
        setAlternatives(result.flights.map(toAlternateFlightProp));
        setCanAutoRebook(null);
        setEscalationReason(null);
      } else {
        const result = await getAlternatives(flight._id, id);
        setAlternatives(result.alternatives);
        setCanAutoRebook(result.canAutoRebook);
        setEscalationReason(result.escalationReason);
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load alternate flights.");
    } finally {
      setLoading(false);
    }
  }, [id, isRecoveryFlow]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSelect(flightId: string) {
    if (!id) return;
    setSelectingId(flightId);
    setError(null);
    try {
      if (isRecoveryFlow) {
        await rebookViaRecovery(id, flightId);
        navigate(`/trip/${id}/rebook/confirmation`);
        return;
      }

      const result = await rebook(id, flightId);
      if (result.result === "escalated") {
        navigate(`/trip/${id}/escalated`);
        return;
      }
      setConfirmed(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not complete rebooking.");
    } finally {
      setSelectingId(null);
    }
  }

  async function handleEscalate() {
    if (!id) return;
    setEscalating(true);
    setError(null);
    try {
      await escalate(id, escalationReason || "Rebooking requires agent review");
      navigate(`/trip/${id}/escalated`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not reach an agent right now.");
    } finally {
      setEscalating(false);
    }
  }

  if (loading) return <LoadingSpinner label="Finding alternate flights..." />;

  return (
    <div className="flex min-h-[calc(100svh-64px)] w-full justify-center px-6 py-10 lg:px-16">
      <div className="flex w-full max-w-2xl flex-col justify-center gap-5">
      {/* ── Success celebration banner ── */}
      {confirmed ? (
        <div className="flex flex-col items-center gap-4 rounded-xl bg-emerald-600 p-8 text-white text-center dark:bg-emerald-700">
          <div className="flex size-16 items-center justify-center rounded-full bg-white/20">
            <CheckCircle2 className="size-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">You're all set!</h2>
            <p className="mt-1 text-white/80">You're confirmed on your new flight.</p>
          </div>
          <Button
            asChild
            className="bg-white text-emerald-700 font-semibold hover:bg-white/90 transition-colors"
          >
            <Link to={`/trip/${id}`}>Back to trip status</Link>
          </Button>
        </div>
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary">
              <Plane className="size-4 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl font-bold">Choose a new flight</CardTitle>
            <CardDescription>Same route, next available departures.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {error && <ErrorBanner message={error} />}

            {!isRecoveryFlow && canAutoRebook === false ? (
              <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {escalationReason || "This itinerary needs a closer look from one of our agents."}
                </p>
                <Button
                  onClick={handleEscalate}
                  disabled={escalating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {escalating ? "Connecting…" : "Get agent help with rebooking"}
                </Button>
              </div>
            ) : alternatives.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
                <span className="text-4xl">🛫</span>
                <p className="text-sm text-muted-foreground">No alternate flights are available right now.</p>
              </div>
            ) : (
              booking &&
              alternatives.map((alt) => (
                <AlternateFlightCard
                  key={alt.flightId}
                  flight={alt}
                  cabin={booking.cabin}
                  onSelect={() => handleSelect(alt.flightId)}
                  selecting={selectingId === alt.flightId}
                />
              ))
            )}

            <Button asChild variant="ghost" className="mt-1 gap-2 text-muted-foreground hover:text-foreground">
              <Link to={`/trip/${id}`}>
                <ArrowLeft className="size-3.5" /> Back to trip status
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
