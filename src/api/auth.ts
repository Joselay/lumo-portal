import { api } from "@/lib/api";
import type { LoginRequest, LoginResponse, LoginError } from "@/types/auth";

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      return await api.post<LoginResponse>("/auth/login/", credentials);
    } catch (error) {
      let errorData: LoginError = {};
      try {
        errorData = JSON.parse(error as string);
      } catch {
        errorData = { non_field_errors: [error as string] };
      }
      throw errorData;
    }
  },
};
