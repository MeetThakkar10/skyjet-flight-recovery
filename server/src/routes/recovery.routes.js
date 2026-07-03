import { Router } from "express";
import { getRecoveryOptionsController } from "../controllers/recoveryController.js";

const router = Router();

router.get("/:bookingId", getRecoveryOptionsController);

export default router;
