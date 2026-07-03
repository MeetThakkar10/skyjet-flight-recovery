// Decides refund eligibility for a booking. Returns { eligibilityState, reason }.
// Status/determination only — no payment is ever issued.
export function evaluateRefund(flight, booking) {
  if (flight.status !== "cancelled") {
    return { eligibilityState: "not-applicable", reason: "Flight is not cancelled" };
  }

  if (booking.rebooking.state === "auto-rebooked") {
    return { eligibilityState: "not-eligible", reason: "Passenger accepted a rebooking onto an alternate flight" };
  }

  if (flight.international || flight.fareType !== "standard") {
    return {
      eligibilityState: "escalated",
      reason: `${flight.international ? "International" : flight.fareType} itinerary requires agent review for refund rules`,
    };
  }

  return { eligibilityState: "eligible", reason: "Flight cancelled, no accepted rebooking — full refund eligible" };
}
