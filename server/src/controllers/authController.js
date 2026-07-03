import { register, login, getUserById } from "../services/authService.js";
import { generateCaptcha } from "../services/captchaService.js";
import { COOKIE_NAME } from "../middleware/auth.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export function getCaptchaController(req, res, next) {
  try {
    const { captchaId, svg } = generateCaptcha();
    res.json({ captchaId, svg });
  } catch (err) {
    next(err);
  }
}

export async function registerController(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await register({ name, email, password });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function loginController(req, res, next) {
  try {
    const { email, password, captchaId, captchaInput } = req.body;
    const { user, token } = await login({ email, password, captchaId, captchaInput });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export function logoutController(req, res) {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
}

export async function meController(req, res, next) {
  try {
    const user = await getUserById(req.user.sub);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
