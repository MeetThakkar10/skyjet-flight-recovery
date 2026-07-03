import { api } from "./client";
import type { AuthUser, CaptchaChallenge } from "@/types";

export function getCaptcha() {
  return api.get<CaptchaChallenge>("/api/auth/captcha");
}

export function register(name: string, email: string, password: string) {
  return api.post<{ user: AuthUser }>("/api/auth/register", { name, email, password });
}

export function login(email: string, password: string, captchaId: string, captchaInput: string) {
  return api.post<{ user: AuthUser }>("/api/auth/login", { email, password, captchaId, captchaInput });
}

export function logout() {
  return api.post<{ ok: true }>("/api/auth/logout");
}

export function me() {
  return api.get<{ user: AuthUser }>("/api/auth/me");
}
