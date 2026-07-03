import { Router } from "express";
import Passenger from "../../models/Passenger.js";
import { ApiError } from "../../middleware/errorHandler.js";

const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.params.id);
    if (!passenger) throw new ApiError(404, "Passenger not found");
    res.json(passenger);
  } catch (err) {
    next(err);
  }
});

export default router;
