import { getAlternateFlights } from "./airlineClient.js";

// Decides whether a cancelled booking can be auto-rebooked or must be escalated
// to agent assist. Returns { canAutoRebook, alternatives, escalationReason }.
export async function evaluateRebooking(flight, booking) {
  if (flight.international) {
    return { canAutoRebook: false, alternatives: [], escalationReason: "International itinerary requires agent review" };
  }
  if (flight.fareType !== "standard") {
    return { canAutoRebook: false, alternatives: [], escalationReason: `${flight.fareType} fare requires agent review` };
  }

  const candidates = await getAlternateFlights(flight);
  const alternatives = candidates.filter(
    (alt) => alt.cabinClasses.includes(booking.cabin) && (alt.seatsAvailable.get(booking.cabin) || 0) > 0
  );

  if (alternatives.length === 0) {
    return { canAutoRebook: false, alternatives: [], escalationReason: "No matching alternate flight available" };
  }

  return { canAutoRebook: true, alternatives, escalationReason: null };
}
