import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import type { LoginRequest, LoginResponse, LoginError } from "@/types/auth";

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store tokens in localStorage or handle them as needed
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.customer_profile) {
        localStorage.setItem(
          "customer_profile",
          JSON.stringify(data.customer_profile),
        );
      }
    },
    onError: (error) => {
      // Parse error message if it's JSON
      try {
        const errorData: LoginError = JSON.parse(error.message);
        console.error("Login error:", errorData);
      } catch {
        console.error("Login error:", error.message);
      }
    },
  });
};
