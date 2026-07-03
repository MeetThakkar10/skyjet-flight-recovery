import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { RecoveryActionCard } from "@/components/RecoveryActionCard";
import { LoadingSkeletonBlock } from "@/components/LoadingSkeleton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { getRecoveryOptions } from "@/api/recovery";
import { ApiRequestError } from "@/api/client";
import type { EligibleAction, RecoveryRequest } from "@/types";

export function RecoveryOptionsPanel({ bookingId }: { bookingId: string }) {
  const [recoveryRequest, setRecoveryRequest] = useState<RecoveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRecoveryOptions(bookingId);
      setRecoveryRequest(result.recoveryRequest);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load recovery options.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSelect(action: EligibleAction) {
    switch (action) {
      case "rebook":
        navigate(`/trip/${bookingId}/rebook?source=recovery`);
        return;
      case "refund":
        navigate(`/trip/${bookingId}/refund?source=recovery`);
        return;
      case "contact-support":
        navigate(`/trip/${bookingId}/support`);
        return;
      case "voucher":
        toast.success("Travel voucher issued — check your email for details.");
        return;
      case "keep-current":
        toast.success("You're all set — no action needed.");
        return;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <CardTitle className="text-lg">Recovery Options</CardTitle>
        <CardDescription>Choose how you'd like to handle this disruption.</CardDescription>
      </div>

      {loading && <LoadingSkeletonBlock rows={3} />}
      {error && <ErrorBanner message={error} />}

      {!loading && !error && recoveryRequest && recoveryRequest.eligibleActions.length === 0 && (
        <p className="text-sm text-muted-foreground">You're all set — no action is needed right now.</p>
      )}

      {!loading &&
        !error &&
        recoveryRequest?.eligibleActions.map((action, i) => (
          <motion.div
            key={action}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.06, ease: "easeOut" }}
          >
            <RecoveryActionCard action={action} onSelect={() => handleSelect(action)} />
          </motion.div>
        ))}
    </div>
  );
}
