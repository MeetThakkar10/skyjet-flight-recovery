import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { EligibleAction } from "@/types";

export interface RecoveryActionConfig {
  title: string;
  description: string;
  cta: string;
}

export const ACTION_CONFIG: Record<EligibleAction, RecoveryActionConfig> = {
  "keep-current": {
    title: "Keep Current Flight",
    description: "No action needed — we'll keep you on your original flight.",
    cta: "Got it",
  },
  rebook: {
    title: "Rebook Flight",
    description: "Choose a new departure that works for you.",
    cta: "Find alternate flights",
  },
  refund: {
    title: "Request Refund",
    description: "Check eligibility and request a refund for this booking.",
    cta: "Check refund",
  },
  voucher: {
    title: "Travel Voucher",
    description: "Receive a travel voucher for a future booking.",
    cta: "Claim voucher",
  },
  "contact-support": {
    title: "Contact Support",
    description: "This case needs a closer look from our team.",
    cta: "Raise a ticket",
  },
};

export function RecoveryActionCard({
  action,
  onSelect,
  loading,
}: {
  action: EligibleAction;
  onSelect: () => void;
  loading?: boolean;
}) {
  const config = ACTION_CONFIG[action];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full" onClick={onSelect} disabled={loading}>
          {loading ? "Please wait..." : config.cta}
        </Button>
      </CardFooter>
    </Card>
  );
}
