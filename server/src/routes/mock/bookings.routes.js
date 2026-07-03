import { Router } from "express";
import Booking from "../../models/Booking.js";
import { ApiError } from "../../middleware/errorHandler.js";

const router = Router();

// Used internally by /api/trips/lookup — not called by the client directly.
router.get("/pnr/:pnr", async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr.toUpperCase() });
    if (!booking) throw new ApiError(404, "Booking not found");
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

export default router;
