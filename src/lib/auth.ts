export const authUtils = {
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      // Set cookies for middleware access
      document.cookie = `access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=2592000; SameSite=Lax`;

      // Also keep localStorage for client-side access
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    }
  },

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refresh_token");
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  clearAuth() {
    if (typeof window !== "undefined") {
      // Clear cookies
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Clear localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
    }
  },

  setUserData(userData: any) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(userData));
    }
  },

  getUserData(): any | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },
};
