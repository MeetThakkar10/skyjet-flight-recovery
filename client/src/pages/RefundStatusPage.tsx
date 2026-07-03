import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { getRefundEligibility } from "@/api/bookings";
import { requestRefund } from "@/api/recovery";
import type { RefundEligibilityResult, RefundRequestResult } from "@/types";
import { ApiRequestError } from "@/api/client";

const STATE_LABEL: Record<RefundEligibilityResult["eligibilityState"], string> = {
  eligible: "Eligible for refund",
  "not-eligible": "Not eligible for refund",
  escalated: "Needs agent review",
  "not-applicable": "Not applicable",
};

const STATE_STYLE: Record<RefundEligibilityResult["eligibilityState"], string> = {
  eligible: "bg-green-100 text-green-800 border-green-300",
  "not-eligible": "bg-muted text-muted-foreground",
  escalated: "bg-amber-100 text-amber-800 border-amber-300",
  "not-applicable": "bg-muted text-muted-foreground",
};

export function RefundStatusPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isRecoveryFlow = searchParams.get("source") === "recovery";
  const [result, setResult] = useState<RefundEligibilityResult | RefundRequestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setResult(isRecoveryFlow ? await requestRefund(id) : await getRefundEligibility(id));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not determine refund eligibility.");
    } finally {
      setLoading(false);
    }
  }, [id, isRecoveryFlow]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Checking refund eligibility..." />;

  return (
    <div className="flex min-h-svh w-full justify-center px-6 py-12">
      <div className="flex w-full max-w-lg flex-col justify-center gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Refund eligibility</CardTitle>
          <CardDescription>No payment is issued here — this is a status determination only.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && <ErrorBanner message={error} />}
          {result && (
            <>
              <Badge variant="outline" className={STATE_STYLE[result.eligibilityState]}>
                {STATE_LABEL[result.eligibilityState]}
              </Badge>
              <p className="text-sm text-muted-foreground">{result.reason}</p>
              {result.eligibilityState === "escalated" ? (
                <Button asChild>
                  <Link to={isRecoveryFlow ? `/trip/${id}/support` : `/trip/${id}/escalated`}>
                    See what happens next
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to={`/trip/${id}`}>Back to trip status</Link>
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
