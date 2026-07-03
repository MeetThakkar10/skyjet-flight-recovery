import { Router } from "express";
import { getMyBookingsController } from "../controllers/passengerDashboardController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getMyBookingsController);

export default router;
