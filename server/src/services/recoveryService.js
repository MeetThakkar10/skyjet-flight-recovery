import Booking from "../models/Booking.js";
import RecoveryRequest from "../models/RecoveryRequest.js";
import { getFlight } from "./airlineClient.js";
import { evaluateRecovery } from "./recoveryDecisionEngine.js";
import { generateReference } from "../utils/generateReference.js";
import { ApiError } from "../middleware/errorHandler.js";

async function loadBookingAndFlight(bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  const flight = await getFlight(booking.flightId);
  if (!flight) throw new ApiError(404, "Flight not found");
  return { booking, flight };
}

// Idempotent: recomputes eligibility from current flight state and upserts the
// booking's single RecoveryRequest document. Safe to call repeatedly (e.g. page refresh).
export async function getRecoveryOptions(bookingId) {
  const { booking, flight } = await loadBookingAndFlight(bookingId);
  const { eligibleActions, refundEligible, recoveryStatus, disruptionType, delayMinutes } = evaluateRecovery(
    flight,
    booking
  );

  const recoveryRequest = await RecoveryRequest.findOneAndUpdate(
    { bookingId: booking._id },
    {
      bookingId: booking._id,
      passengerId: booking.passengerId,
      flightId: flight._id,
      disruptionType,
      delayMinutes,
      eligibleActions,
      refundEligible,
      recoveryStatus,
      previousFlight: flight._id,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    recoveryRequest,
    flight,
    disruptionContext: {
      disruptionType,
      delayMinutes,
      reason: flight.reason,
      gate: flight.gate,
      terminal: flight.terminal,
    },
  };
}

// New, additive rebook flow — mirrors Booking.rebooking mutation shape used by the
// legacy POST /api/bookings/:id/rebook route so both flows leave Booking consistent.
// Replays evaluateRebooking's international/fareType escalation gate against the
// booking's current flight so both rebook endpoints enforce the same business rule.
export async function rebookBooking(bookingId, newFlightId) {
  if (!newFlightId) throw new ApiError(400, "newFlightId is required");

  const { booking } = await loadBookingAndFlight(bookingId);
  const previousFlight = await getFlight(booking.flightId);
  if (previousFlight.international) {
    throw new ApiError(400, "International itinerary requires agent review");
  }
  if (previousFlight.fareType !== "standard") {
    throw new ApiError(400, `${previousFlight.fareType} fare requires agent review`);
  }

  const newFlight = await getFlight(newFlightId);
  if (!newFlight) throw new ApiError(400, "newFlightId is not a valid flight");
  if ((newFlight.seatsAvailable.get(booking.cabin) || 0) <= 0) {
    throw new ApiError(400, "Selected flight has no available seats in this cabin");
  }

  booking.rebooking = {
    state: "auto-rebooked",
    newFlightId: newFlight._id,
    rebookedAt: new Date(),
  };
  booking.status = "rebooked";
  await booking.save();

  const recoveryReference = generateReference("RCV");
  const recoveryRequest = await RecoveryRequest.findOneAndUpdate(
    { bookingId: booking._id },
    {
      bookingId: booking._id,
      passengerId: booking.passengerId,
      flightId: previousFlight._id,
      selectedAction: "rebook",
      recoveryStatus: "rebooked",
      previousFlight: previousFlight._id,
      newFlight: newFlight._id,
      recoveryReference,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { booking, recoveryRequest, recoveryReference };
}
