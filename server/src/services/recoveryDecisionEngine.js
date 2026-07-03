// Data-driven Recovery Decision Engine. Each rule independently contributes eligible
// actions for a disrupted flight; matched rules are unioned rather than first-match-wins,
// since a delay-based rule, a disruptionType-based rule, and the cancellation rule can all
// legitimately apply to the same flight at once. To add a new rule, append one object to
// RULES — nothing else in this file needs to change.
//
// Returns { eligibleActions, refundEligible, recoveryStatus, disruptionType, delayMinutes }.

const RULES = [
  {
    id: "delay-under-2h-inform-only",
    appliesTo: (flight) => flight.delayMinutes > 0 && flight.delayMinutes < 120 && flight.status !== "cancelled",
    actions: ["keep-current"],
  },
  {
    id: "delay-over-3h-allow-rebook",
    appliesTo: (flight) => flight.delayMinutes >= 120 && flight.status !== "cancelled",
    actions: ["keep-current", "rebook"],
  },
  {
    id: "cancelled-full-bundle",
    appliesTo: (flight) => flight.status === "cancelled",
    actions: ["refund", "rebook", "voucher"],
  },
  {
    id: "disruption-technical-rebook",
    appliesTo: (flight) => flight.disruptionType === "technical",
    actions: ["rebook"],
  },
  {
    id: "disruption-weather-inform",
    appliesTo: (flight) => flight.disruptionType === "weather",
    actions: ["keep-current"],
  },
  {
    id: "disruption-crew-unavailable-rebook",
    appliesTo: (flight) => flight.disruptionType === "crew-unavailable",
    actions: ["rebook"],
  },
  {
    id: "disruption-seat-unavailable-escalate",
    appliesTo: (flight) => flight.disruptionType === "seat-unavailable",
    actions: ["contact-support"],
    escalate: true,
  },
  {
    id: "disruption-missed-connection-next-flight",
    appliesTo: (flight) => flight.disruptionType === "missed-connection",
    actions: ["rebook"],
  },
  {
    id: "on-time-no-disruption-inform-only",
    appliesTo: (flight) => flight.status === "on-time" && flight.delayMinutes === 0 && flight.disruptionType === "none",
    actions: ["keep-current"],
  },
];

export function evaluateRecovery(flight, booking) {
  const matched = RULES.filter((rule) => rule.appliesTo(flight, booking));
  const eligibleActions = [...new Set(matched.flatMap((rule) => rule.actions))];
  const escalated = matched.some((rule) => rule.escalate);
  const refundEligible = eligibleActions.includes("refund");

  let recoveryStatus = "pending";
  if (escalated) {
    recoveryStatus = "escalated";
  } else if (eligibleActions.length === 1 && eligibleActions[0] === "keep-current") {
    recoveryStatus = "informed";
  }

  return {
    eligibleActions,
    refundEligible,
    recoveryStatus,
    disruptionType: flight.disruptionType,
    delayMinutes: flight.delayMinutes,
  };
}
