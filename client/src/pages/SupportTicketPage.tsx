import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { createSupportTicket, getOpenSupportTicket } from "@/api/recovery";
import { ApiRequestError } from "@/api/client";

export function SupportTicketPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkExisting = useCallback(async () => {
    if (!id) return;
    setCheckingExisting(true);
    try {
      const { ticket } = await getOpenSupportTicket(id);
      if (ticket) {
        navigate(`/trip/${id}/support/${ticket.ticketId}`, { replace: true });
        return;
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not check for an existing ticket.");
    } finally {
      setCheckingExisting(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    checkExisting();
  }, [checkExisting]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!id) return;
    setSubmitting(true);
    setError(null);
    try {
      const ticket = await createSupportTicket(id, reason.trim());
      navigate(`/trip/${id}/support/${ticket.ticketId}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not raise a support ticket.");
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  if (checkingExisting) return <LoadingSpinner label="Checking your support requests..." />;

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-4 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>Tell us what's going on and we'll raise a ticket for our team.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-3">
            {error && <ErrorBanner message={error} />}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reason">What do you need help with?</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the issue..."
                required
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Raise a support ticket
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to={`/trip/${id}`}>Back to trip status</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Raise a support ticket?"
        description="An agent will review this booking and follow up with you."
        confirmLabel="Raise ticket"
        onConfirm={handleConfirm}
        confirming={submitting}
      />
    </div>
  );
}
