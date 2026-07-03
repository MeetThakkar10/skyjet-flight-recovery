import { Router } from "express";
import {
  getCaptchaController,
  registerController,
  loginController,
  logoutController,
  meController,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/captcha", getCaptchaController);
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);

export default router;
