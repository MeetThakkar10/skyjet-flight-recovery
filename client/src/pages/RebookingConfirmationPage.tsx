import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { getRecoveryOptions } from "@/api/recovery";
import { ApiRequestError } from "@/api/client";
import type { RecoveryRequest } from "@/types";

export function RebookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [recoveryRequest, setRecoveryRequest] = useState<RecoveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getRecoveryOptions(id);
      setRecoveryRequest(result.recoveryRequest);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load your confirmation.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Confirming your rebooking..." />;

  return (
    <div className="flex min-h-svh w-full justify-center px-6 py-12">
      <div className="flex w-full max-w-lg flex-col justify-center gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">You're rebooked</CardTitle>
          <CardDescription>Your new flight is confirmed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {error && <ErrorBanner message={error} />}
          {recoveryRequest?.recoveryReference && (
            <p className="font-medium text-green-700">Recovery reference: {recoveryRequest.recoveryReference}</p>
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
