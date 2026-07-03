import { Router } from "express";
import { rebookController } from "../controllers/recoveryController.js";

const router = Router();

router.post("/", rebookController);

export default router;
