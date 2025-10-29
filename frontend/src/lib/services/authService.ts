import apiClient from "../apiClient";

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Authentication utility functions
export const AuthUtils = {
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const cookieToken = document.cookie.split(';').find(row => row.trim().startsWith('token='))?.split('=')[1];
    const cookieAccessToken = document.cookie.split(';').find(row => row.trim().startsWith('access_token='))?.split('=')[1];

    return !!(token || cookieToken || cookieAccessToken);
  },

  // Get authentication token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;

    // Check localStorage first
    const localToken = localStorage.getItem('token') || localStorage.getItem('access_token');

    // Check cookies as fallback
    const cookieToken = document.cookie.split(';').find(row => row.trim().startsWith('token='))?.split('=')[1];
    const cookieAccessToken = document.cookie.split(';').find(row => row.trim().startsWith('access_token='))?.split('=')[1];

    return localToken || cookieToken || cookieAccessToken || null;
  },

  // Clear all authentication data
  clearAuthData: (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');

    // Clear auth cookies
    const authCookies = ['token', 'access_token'];
    authCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
  }
};

export const AuthService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", { email, password });
      return response;
    } catch (error: any) {
      // Don't log authentication errors to avoid console popups
      throw error;
    }
  },

  register: async (name: string, email: string, password: string, preferences: string[]): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>("/auth/signup", {
        name,
        email,
        password,
        preferences,
      });
      return response;
    } catch (error: any) {
      // Don't log authentication errors to avoid console popups
      throw error;
    }
  },
};
