import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyCaptcha } from "./captchaService.js";
import { ApiError } from "../middleware/errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_TTL = "7d";

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

function serialize(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

// Always registers as "passenger" — staff accounts are seeded, not self-registered.
export async function register({ name, email, password }) {
  if (!name || !email || !password) throw new ApiError(400, "name, email, and password are required");
  if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters");

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase().trim(), passwordHash, role: "passenger" });

  return { user: serialize(user), token: issueToken(user) };
}

export async function login({ email, password, captchaId, captchaInput }) {
  if (!email || !password) throw new ApiError(400, "email and password are required");
  verifyCaptcha(captchaId, captchaInput);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  return { user: serialize(user), token: issueToken(user) };
}

export async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return serialize(user);
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired session");
  }
}
