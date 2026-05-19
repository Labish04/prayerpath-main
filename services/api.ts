import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './url';

const TOKEN_KEY = 'prayer_path_jwt_token';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching auth token from AsyncStorage:', e);
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : endpoint);
    
    // Add query params if present
    if (options.params) {
      Object.keys(options.params).forEach((key) =>
        url.searchParams.append(key, options.params![key])
      );
    }

    const headers = await this.getHeaders();
    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url.toString(), config);
      
      let responseData: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      if (!response.ok) {
        const errorMessage = responseData?.message || `HTTP error! status: ${response.status}`;
        throw new ApiError(errorMessage, response.status, responseData);
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof ApiError) {
        // Suppress expected 4xx client-side errors (400, 401, 403, 404) in console
        if (error.status >= 500) {
          console.warn(`[API Server Error] ${endpoint} (${error.status}):`, error.message);
        }
      } else {
        // Real connection drops, timeouts or syntax parsing crashes
        console.warn(`[API System Failure] ${endpoint}:`, error);
      }
      throw error;
    }
  }

  public async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  public async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }
}

export const api = new ApiClient();
export { TOKEN_KEY };
