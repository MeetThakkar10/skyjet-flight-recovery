import { Router } from "express";
import Flight from "../../models/Flight.js";
import { ApiError } from "../../middleware/errorHandler.js";

const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) throw new ApiError(404, "Flight not found");
    res.json(flight);
  } catch (err) {
    next(err);
  }
});

// Candidate alternates: same route, not cancelled, within +/- 48h of the original departure.
router.get("/:id/alternatives", async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) throw new ApiError(404, "Flight not found");

    const windowMs = 48 * 60 * 60 * 1000;
    const alternatives = await Flight.find({
      _id: { $ne: flight._id },
      origin: flight.origin,
      destination: flight.destination,
      status: { $ne: "cancelled" },
      departureTime: {
        $gte: new Date(flight.departureTime.getTime() - windowMs),
        $lte: new Date(flight.departureTime.getTime() + windowMs),
      },
    });

    res.json(alternatives);
  } catch (err) {
    next(err);
  }
});

export default router;
