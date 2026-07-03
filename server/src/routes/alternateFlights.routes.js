import { Router } from "express";
import { getAlternateFlightsController } from "../controllers/alternateFlightController.js";

const router = Router();

router.get("/:bookingId", getAlternateFlightsController);

export default router;
