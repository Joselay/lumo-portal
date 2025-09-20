import { api } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import type {
  LoginRequest,
  LoginResponse,
  LoginError,
  LogoutRequest,
  LogoutResponse,
} from "@/types/auth";

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

  async logout(logoutData?: LogoutRequest): Promise<LogoutResponse> {
    try {
      const refreshToken =
        logoutData?.refresh_token || authUtils.getRefreshToken();

      const response = await api.post<LogoutResponse>("/auth/logout/", {
        refresh_token: refreshToken,
      });

      authUtils.clearAuth();

      return response;
    } catch (error) {
      authUtils.clearAuth();
      throw error;
    }
  },
};
