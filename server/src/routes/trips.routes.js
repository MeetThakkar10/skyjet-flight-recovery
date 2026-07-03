import { Router } from "express";
import Booking from "../models/Booking.js";
import Passenger from "../models/Passenger.js";
import Flight from "../models/Flight.js";
import { ApiError } from "../middleware/errorHandler.js";

const router = Router();

router.post("/lookup", async (req, res, next) => {
  try {
    const { pnr, lastName } = req.body;
    if (!pnr || !lastName) throw new ApiError(400, "pnr and lastName are required");

    const booking = await Booking.findOne({ pnr: pnr.toUpperCase().trim() });
    if (!booking) throw new ApiError(404, "No matching trip found");

    const passenger = await Passenger.findById(booking.passengerId);
    if (!passenger || passenger.lastName.toLowerCase() !== lastName.toLowerCase().trim()) {
      throw new ApiError(404, "No matching trip found");
    }

    const flight = await Flight.findById(booking.flightId);

    res.json({
      bookingId: booking._id,
      pnr: booking.pnr,
      passengerName: `${passenger.firstName} ${passenger.lastName}`,
      flight,
      bookingStatus: booking.status,
      rebooking: booking.rebooking,
      refund: booking.refund,
      escalation: booking.escalation,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
