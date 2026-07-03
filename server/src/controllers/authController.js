import { register, login, getUserById } from "../services/authService.js";
import { generateCaptcha } from "../services/captchaService.js";
import { COOKIE_NAME } from "../middleware/auth.js";

// Frontend (Vercel) and backend (Render) are different sites, so the auth cookie
// must be SameSite=None; Secure to be sent on cross-site fetch requests at all —
// SameSite=Lax cookies are dropped on cross-site XHR/fetch by the browser, which
// is why authenticated requests were coming back 401 in production. Secure=None
// requires HTTPS, so fall back to Lax/non-secure for plain-HTTP local dev.
const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
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
  // clearCookie must be called with the same sameSite/secure attributes used to
  // set the cookie, or the browser won't match it and won't clear it.
  res.clearCookie(COOKIE_NAME, { httpOnly: COOKIE_OPTIONS.httpOnly, sameSite: COOKIE_OPTIONS.sameSite, secure: COOKIE_OPTIONS.secure });
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
