import Booking from "../models/Booking.js";
import RecoveryRequest from "../models/RecoveryRequest.js";
import { getFlight } from "./airlineClient.js";
import { evaluateRefund } from "./refundEngine.js";
import { generateReference } from "../utils/generateReference.js";
import { ApiError } from "../middleware/errorHandler.js";

// Reuses the existing refundEngine as the single source of eligibility truth.
// Writes its outcome to RecoveryRequest only — it does not touch Booking.refund,
// which remains the domain of the legacy GET /api/bookings/:id/refund-eligibility route.
export async function processRefundRequest(bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  const flight = await getFlight(booking.flightId);
  if (!flight) throw new ApiError(404, "Flight not found");

  const { eligibilityState, reason } = evaluateRefund(flight, booking);
  const refundEligible = eligibilityState === "eligible";
  const recoveryStatus = eligibilityState === "escalated" ? "escalated" : refundEligible ? "refunded" : "resolved";

  const recoveryRequest = await RecoveryRequest.findOneAndUpdate(
    { bookingId: booking._id },
    {
      bookingId: booking._id,
      passengerId: booking.passengerId,
      flightId: flight._id,
      disruptionType: flight.disruptionType,
      delayMinutes: flight.delayMinutes,
      selectedAction: "refund",
      refundEligible,
      recoveryStatus,
      recoveryReference: refundEligible ? generateReference("RCV") : undefined,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { eligibilityState, reason, refundEligible, recoveryRequest };
}
