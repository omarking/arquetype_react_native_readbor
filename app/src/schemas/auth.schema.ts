import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export const loginInputSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password requerido'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
