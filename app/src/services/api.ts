import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';
import { env } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';
import { ErrorCodes, type ApiResponse, type ErrorResponse } from '@/schemas/api.schema';

const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.error?.code;
      if (errorCode === ErrorCodes.TOKEN_EXPIRED || errorCode === ErrorCodes.AUTH_REQUIRED) {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  }
);

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  endpoint: string,
  schema: z.ZodType<T>,
  data?: Record<string, unknown>,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.request<{ ok: true; data: unknown }>({
      method,
      url: endpoint,
      data,
      params,
    });

    const parsed = schema.safeParse(response.data.data);
    if (!parsed.success) {
      console.error('Validation error:', parsed.error);
      return {
        ok: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Respuesta del servidor inválida',
        },
      };
    }

    return {
      ok: true,
      data: parsed.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.error) {
        return {
          ok: false,
          error: axiosError.response.data.error,
        };
      }
      return {
        ok: false,
        error: {
          code: ErrorCodes.NETWORK_ERROR,
          message: error.message || 'Error de conexión',
        },
      };
    }
    return {
      ok: false,
      error: {
        code: ErrorCodes.NETWORK_ERROR,
        message: 'Error inesperado',
      },
    };
  }
}

export { apiClient };
