/**
 * Production-ready API Client using Axios
 * Includes request/response interceptors, timeout handling, and structured error responses.
 */

export interface ApiError {
  message: string;
  statusCode?: number;
  originalError?: any;
}

// Helper to get or create an axios-compatible request runner
export class ApiClient {
  private static instance: any = null;

  private static getAxios() {
    if (!ApiClient.instance) {
      try {
        const axios = require('axios');
        const instance = axios.create({
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        // Request Interceptor
        instance.interceptors.request.use(
          (config: any) => {
            // Can attach auth tokens, correlation IDs, or analytics headers here
            return config;
          },
          (error: any) => {
            return Promise.reject(error);
          },
        );

        // Response Interceptor
        instance.interceptors.response.use(
          (response: any) => {
            return response;
          },
          (error: any) => {
            const formattedError: ApiError = {
              message:
                error.response?.data?.message ||
                error.message ||
                'Network request failed. Please check your connection.',
              statusCode: error.response?.status,
              originalError: error,
            };
            return Promise.reject(formattedError);
          },
        );

        ApiClient.instance = instance;
      } catch (err) {
        // Fallback for when axios is not yet installed in node_modules
        ApiClient.instance = null;
      }
    }
    return ApiClient.instance;
  }

  public static async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const axios = ApiClient.getAxios();

    if (axios) {
      const response = await axios.get(url, { params });
      return response.data;
    }

    // Defensive fetch fallback in case node_modules is pending install
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';

    const res = await fetch(url + query, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw {
        message: `HTTP error ${res.status}: ${res.statusText}`,
        statusCode: res.status,
      } as ApiError;
    }

    return await res.json();
  }
}

export default ApiClient;
