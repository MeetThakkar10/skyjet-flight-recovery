import { Router } from "express";
import {
  listPassengersController,
  listBookingsController,
  listRecoveryRequestsController,
  listSupportTicketsController,
  updateTicketStatusController,
} from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireRole("staff"));

router.get("/passengers", listPassengersController);
router.get("/bookings", listBookingsController);
router.get("/recovery-requests", listRecoveryRequestsController);
router.get("/support-tickets", listSupportTicketsController);
router.patch("/support-tickets/:ticketId/status", updateTicketStatusController);

export default router;
