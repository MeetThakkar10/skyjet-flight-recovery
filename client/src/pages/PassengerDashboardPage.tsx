import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlightStatusBadge } from "@/components/FlightStatusBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { getMyBookings, type MyBookingEntry } from "@/api/myBookings";
import { ApiRequestError } from "@/api/client";
import { Plane, ArrowRight } from "lucide-react";

export function PassengerDashboardPage() {
  const [entries, setEntries] = useState<MyBookingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { bookings } = await getMyBookings();
      setEntries(bookings);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Loading your bookings..." />;

  return (
    <div className="mx-auto flex min-h-[calc(100svh-56px)] max-w-2xl flex-col gap-6 px-4 py-10">
      {/* ── Page hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-800 to-blue-900 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.9_0.1_290/20%)_0%,transparent_70%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Plane className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">My Bookings</h1>
            <p className="text-sm text-white/80">All your upcoming and recent trips</p>
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* ── Empty state ── */}
      {!error && entries.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card py-14 text-center">
          <div className="text-5xl">✈️</div>
          <div>
            <p className="font-semibold text-foreground">No bookings found</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Bookings only appear here if they were made under the same email address.
              You can still look up a trip as a guest using its PNR.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Look up by PNR</Link>
          </Button>
        </div>
      )}

      {/* ── Booking cards ── */}
      <div className="flex flex-col gap-3">
        {entries.map(({ booking, flight }) => (
          <Card key={booking._id} className="card-hover border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base font-semibold">
                <div className="flex items-center gap-2">
                  <Plane className="size-4 text-primary" />
                  <span>{flight?.flightNumber ?? "Flight"}</span>
                </div>
                {flight && <FlightStatusBadge status={flight.status} />}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 font-medium">
                {flight ? (
                  <>
                    <span className="text-foreground/80">{flight.origin}</span>
                    <ArrowRight className="size-3 text-primary" />
                    <span className="text-foreground/80">{flight.destination}</span>
                  </>
                ) : null}
                <span className="text-muted-foreground/60">·</span>
                <span className="font-mono text-xs tracking-widest text-muted-foreground">PNR {booking.pnr}</span>
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Button
                asChild
                variant="outline"
                className="w-full gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                <Link to={`/trip/${booking._id}`}>
                  View trip <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="text-center">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link to="/">Look up another trip by PNR</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
