import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { getBooking } from "@/api/bookings";
import type { Booking } from "@/types";
import { ApiRequestError } from "@/api/client";

export function EscalationConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { booking } = await getBooking(id);
      setBooking(booking);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load your escalation status.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Loading..." />;

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>You're in the queue</CardTitle>
          <CardDescription>An agent will contact you within 24 hours.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {error && <ErrorBanner message={error} />}
          {booking?.escalation.flagged && (
            <>
              <div className="rounded-md border bg-muted/50 p-3 text-sm">
                <div className="font-medium">Reference: {booking.escalation.escalationRef}</div>
                <div className="text-muted-foreground">{booking.escalation.reason}</div>
              </div>
              <p className="text-sm text-muted-foreground">
                No need to call — we'll reach out using the contact details on your booking.
              </p>
            </>
          )}
          <Button asChild variant="outline">
            <Link to={`/trip/${id}`}>Back to trip status</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
