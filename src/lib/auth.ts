export const authUtils = {
  async setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      // Set cookies for middleware access using Cookie Store API with fallback
      if ("cookieStore" in window) {
        try {
          await cookieStore.set({
            name: "access_token",
            value: accessToken,
            path: "/",
            expires: Date.now() + 86400 * 1000,
            sameSite: "lax",
          });
          await cookieStore.set({
            name: "refresh_token",
            value: refreshToken,
            path: "/",
            expires: Date.now() + 2592000 * 1000,
            sameSite: "lax",
          });
        } catch (_error) {
          // Fallback to document.cookie if Cookie Store API fails
          // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support
          document.cookie = `access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
          // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support
          document.cookie = `refresh_token=${refreshToken}; path=/; max-age=2592000; SameSite=Lax`;
        }
      } else {
        // Fallback for browsers without Cookie Store API support
        // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support
        document.cookie = `access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=2592000; SameSite=Lax`;
      }

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

  async clearAuth() {
    if (typeof window !== "undefined") {
      // Clear cookies using Cookie Store API with fallback
      if ("cookieStore" in window) {
        try {
          await cookieStore.delete("access_token");
          await cookieStore.delete("refresh_token");
        } catch (_error) {
          // Fallback to document.cookie if Cookie Store API fails
          // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support
          document.cookie =
            "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support
          document.cookie =
            "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      } else {
        // Fallback for browsers without Cookie Store API support
        // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support
        document.cookie =
          "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      // Clear localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
    }
  },

  setUserData(userData: Record<string, unknown>) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(userData));
    }
  },

  getUserData(): Record<string, unknown> | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },
};
