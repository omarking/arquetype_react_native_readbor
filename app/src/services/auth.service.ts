import { z } from 'zod';
import { apiRequest } from './api';
import { authResponseSchema, userSchema, type AuthResponse, type LoginInput, type User } from '@/schemas/auth.schema';
import type { ApiResponse } from '@/schemas/api.schema';

const messageSchema = z.object({ message: z.string() });

export const authService = {
  login: async (credentials: LoginInput): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest('POST', '/auth/login', authResponseSchema, credentials);
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest('POST', '/auth/logout', messageSchema);
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return apiRequest('GET', '/auth/me', userSchema);
  },
};
