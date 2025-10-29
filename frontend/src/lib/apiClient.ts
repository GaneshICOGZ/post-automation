// Native fetch-based API client
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  }

  private getAuthToken(): string | null {
    // Try to get token from cookies first (primary storage)
    if (typeof window !== 'undefined') {
      let token = this.getCookie('token');

      // Also check for access_token in cookies
      if (!token) {
        token = this.getCookie('access_token');
      }

      console.log('Auth token check:', {
        cookieToken: !!this.getCookie('token'),
        accessTokenCookie: !!this.getCookie('access_token'),
        finalToken: !!token,
        tokenLength: token?.length || 0
      });

      return token ? token : null;
    }
    return null;
  }

  // Helper method to set cookie
  private setCookie(name: string, value: string, days: number = 7): void {
    if (typeof document === 'undefined') return;

    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestId = Math.random().toString(36).substr(2, 9);

    console.log(`[${requestId}] API Request:`, options.method || 'GET', url);

    // Build headers - include auth token for all requests except login/register
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists and this is not a login/register endpoint
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/signup')) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`[${requestId}] Adding auth token for endpoint:`, endpoint, 'Token length:', token.length);
      } else {
        console.warn(`[${requestId}] No auth token found for endpoint:`, endpoint);
        console.log(`[${requestId}] Available cookies:`, document.cookie);
        console.log(`[${requestId}] Available localStorage keys:`, Object.keys(localStorage));
      }
    }

    const config: RequestInit = {
      headers,
      // Add credentials to handle CORS
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log(`[${requestId}] API Response:`, response.status, url);

      if (!response.ok) {
        let errorData = {};
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const responseText = await response.text();
          if (responseText.trim()) {
            errorData = JSON.parse(responseText);
            errorMessage = (errorData as any)?.detail || (errorData as any)?.message || errorMessage;
          }
        } catch (parseError) {
          // If we can't parse the response as JSON, use the status text
          console.warn('Could not parse error response as JSON:', parseError);
        }

        throw {
          response: {
            status: response.status,
            data: errorData,
          },
          message: errorMessage,
        };
      }

      return await response.json();
    } catch (error: any) {
      // Only log network errors, not authentication errors
      if (error.message?.includes('fetch')) {
        console.warn('Network connectivity issue:', error.message);
        throw {
          code: 'NETWORK_ERROR',
          message: 'Network Error',
          originalError: error,
        };
      }

      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

export default apiClient;
