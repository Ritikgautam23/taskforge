/**
 * Auth endpoints. Real wiring lands in Phase 2; the surface is defined now
 * so the rest of the app can depend on a stable contract.
 */

import { api } from "./client";
import type { AuthResponse, Role, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  displayName: string;
  role?: Role;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload).then((r) => r.data),

  signup: (payload: SignupPayload) =>
    api.post<AuthResponse>("/auth/signup", payload).then((r) => r.data),

  me: () => api.get<User>("/auth/me").then((r) => r.data),
};
