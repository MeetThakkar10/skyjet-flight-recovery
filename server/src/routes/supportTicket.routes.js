import { Router } from "express";
import {
  createSupportTicketController,
  getSupportTicketController,
  getOpenSupportTicketController,
} from "../controllers/supportTicketController.js";

const router = Router();

router.post("/", createSupportTicketController);
router.get("/", getOpenSupportTicketController);
router.get("/:ticketId", getSupportTicketController);

export default router;
