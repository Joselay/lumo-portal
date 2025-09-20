import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { authUtils } from "@/lib/auth";
import type { LoginRequest, LoginResponse, LoginError } from "@/types/auth";

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Use authUtils to set tokens (this will set both cookies and localStorage)
      authUtils.setTokens(data.access_token, data.refresh_token);

      // Set additional user data
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.customer_profile) {
        localStorage.setItem(
          "customer_profile",
          JSON.stringify(data.customer_profile),
        );
      }
    },
    onError: (error) => {
      try {
        const errorData: LoginError = JSON.parse(error.message);
        console.error("Login error:", errorData);
      } catch {
        console.error("Login error:", error.message);
      }
    },
  });
};
