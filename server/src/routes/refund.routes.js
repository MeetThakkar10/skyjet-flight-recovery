import { Router } from "express";
import { requestRefundController } from "../controllers/refundController.js";

const router = Router();

router.post("/", requestRefundController);

export default router;
