import crypto from "node:crypto";
import svgCaptcha from "svg-captcha";
import { ApiError } from "../middleware/errorHandler.js";

const TTL_MS = 5 * 60 * 1000;
const store = new Map();

function cleanup() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt < now) store.delete(id);
  }
}

export function generateCaptcha() {
  cleanup();
  const captcha = svgCaptcha.create({ size: 4, noise: 3, color: true, background: "#f4f4f5", charPreset: "0123456789" });
  const captchaId = crypto.randomBytes(12).toString("hex");
  store.set(captchaId, { text: captcha.text, expiresAt: Date.now() + TTL_MS });
  return { captchaId, svg: captcha.data };
}

export function verifyCaptcha(captchaId, input) {
  const entry = store.get(captchaId);
  store.delete(captchaId); // one-time use regardless of outcome

  if (!entry || entry.expiresAt < Date.now()) {
    throw new ApiError(400, "Captcha expired — please try again");
  }
  if (!input || entry.text !== String(input).trim()) {
    throw new ApiError(400, "Incorrect captcha");
  }
}
