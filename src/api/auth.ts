import { api } from "@/lib/api";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>("/auth/login/", credentials);
  },
};