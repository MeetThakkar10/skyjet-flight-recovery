import { Router } from "express";
import Booking from "../models/Booking.js";
import { getFlight, getAlternateFlights } from "../services/airlineClient.js";
import { evaluateRebooking } from "../services/rebookingEngine.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = Router();

function serialize(f) {
  return {
    flightId: f._id,
    flightNumber: f.flightNumber,
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    cabinClasses: f.cabinClasses,
    seatsAvailable: Object.fromEntries(f.seatsAvailable),
  };
}

// bookingId is optional but, when provided, the response also reports whether
// the rebooking engine would auto-confirm a selection or escalate it — so the
// UI can tell the passenger upfront instead of surprising them after they pick.
router.get("/:id/alternatives", async (req, res, next) => {
  try {
    const flight = await getFlight(req.params.id);
    if (!flight) throw new ApiError(404, "Flight not found");

    const { bookingId } = req.query;
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) throw new ApiError(404, "Booking not found");
      const evaluation = await evaluateRebooking(flight, booking);
      return res.json({
        alternatives: evaluation.alternatives.map(serialize),
        canAutoRebook: evaluation.canAutoRebook,
        escalationReason: evaluation.escalationReason,
      });
    }

    const alternatives = await getAlternateFlights(flight);
    res.json({ alternatives: alternatives.map(serialize), canAutoRebook: null, escalationReason: null });
  } catch (err) {
    next(err);
  }
});

export default router;
