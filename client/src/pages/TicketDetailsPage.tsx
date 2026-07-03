import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { getSupportTicket } from "@/api/recovery";
import { ApiRequestError } from "@/api/client";
import type { SupportTicketResult, SupportTicketStatus } from "@/types";

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: "Open",
  "in-review": "In review",
  resolved: "Resolved",
};

const STATUS_STYLE: Record<SupportTicketStatus, string> = {
  open: "bg-amber-100 text-amber-800 border-amber-300",
  "in-review": "bg-blue-100 text-blue-800 border-blue-300",
  resolved: "bg-green-100 text-green-800 border-green-300",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketDetailsPage() {
  const { id, ticketId } = useParams<{ id: string; ticketId: string }>();
  const [ticket, setTicket] = useState<SupportTicketResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    try {
      setTicket(await getSupportTicket(ticketId));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load ticket details.");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Loading ticket details..." />;

  return (
    <div className="flex min-h-svh w-full justify-center px-6 py-12">
      <div className="flex w-full max-w-lg flex-col justify-center gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            <span>Ticket details</span>
            {ticket && <Badge variant="outline" className={STATUS_STYLE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>}
          </CardTitle>
          <CardDescription>Our support team will follow up using the contact details on your booking.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {error && <ErrorBanner message={error} />}
          {ticket && (
            <>
              <div className="font-medium">Reference: {ticket.ticketReference}</div>
              <div className="text-muted-foreground">Raised {formatDateTime(ticket.createdAt)}</div>
              <div className="mt-2 rounded-md border bg-muted/50 p-3 text-muted-foreground">{ticket.reason}</div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link to={`/trip/${id}`}>Back to trip status</Link>
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
