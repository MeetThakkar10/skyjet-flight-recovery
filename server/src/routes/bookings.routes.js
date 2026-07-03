import { Router } from "express";
import crypto from "node:crypto";
import Booking from "../models/Booking.js";
import { getFlight } from "../services/airlineClient.js";
import { evaluateRebooking } from "../services/rebookingEngine.js";
import { evaluateRefund } from "../services/refundEngine.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = Router();

function escalate(booking, reason) {
  booking.escalation = {
    flagged: true,
    reason,
    queuedAt: new Date(),
    queueStatus: "pending",
    escalationRef: `ESC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
  };
}

router.get("/:id", async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, "Booking not found");
    const flight = await getFlight(booking.flightId);
    res.json({ booking, flight });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/rebook", async (req, res, next) => {
  try {
    const { newFlightId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, "Booking not found");

    const flight = await getFlight(booking.flightId);
    if (flight.status !== "cancelled") throw new ApiError(400, "Flight is not cancelled");

    const evaluation = await evaluateRebooking(flight, booking);

    if (!evaluation.canAutoRebook) {
      escalate(booking, evaluation.escalationReason);
      booking.rebooking.state = "escalated";
      await booking.save();
      return res.json({ result: "escalated", booking });
    }

    if (!newFlightId) throw new ApiError(400, "newFlightId is required");
    const chosen = evaluation.alternatives.find((alt) => alt._id.toString() === newFlightId);
    if (!chosen) throw new ApiError(400, "newFlightId is not a valid alternative for this booking");

    booking.rebooking = {
      state: "auto-rebooked",
      newFlightId: chosen._id,
      rebookedAt: new Date(),
    };
    booking.status = "rebooked";
    await booking.save();

    res.json({ result: "confirmed", booking });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/refund-eligibility", async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, "Booking not found");
    const flight = await getFlight(booking.flightId);

    const { eligibilityState, reason } = evaluateRefund(flight, booking);
    booking.refund = { eligibilityState, reason, determinedAt: new Date() };

    if (eligibilityState === "escalated") {
      escalate(booking, reason);
    }

    await booking.save();
    res.json({ eligibilityState, reason, determinedAt: booking.refund.determinedAt });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/escalate", async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, "Booking not found");

    escalate(booking, req.body.reason || "Passenger requested agent assistance");
    await booking.save();

    res.json({
      escalationRef: booking.escalation.escalationRef,
      queuedAt: booking.escalation.queuedAt,
      queueStatus: booking.escalation.queueStatus,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
