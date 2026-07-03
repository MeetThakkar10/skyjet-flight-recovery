import { verifyToken } from "../services/authService.js";
import { ApiError } from "./errorHandler.js";

const COOKIE_NAME = "skyjet_token";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw new ApiError(401, "Not authenticated");
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) return next(new ApiError(403, "Forbidden"));
    next();
  };
}

export { COOKIE_NAME };
