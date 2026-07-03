import { Router } from "express";
import { sendMessageController, getChatHistoryController } from "../controllers/chatController.js";

const router = Router();

router.get("/:bookingId", getChatHistoryController);
router.post("/:bookingId", sendMessageController);

export default router;
