import { z } from 'zod';

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    ok: z.literal(true),
    data: dataSchema,
  });

export const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  ok: z.literal(false),
  error: errorSchema,
});

export type ApiError = z.infer<typeof errorSchema>;

export type SuccessResponse<T> = {
  ok: true;
  data: T;
};

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_APPLIED: 'ALREADY_APPLIED',
  ALREADY_FAVORITED: 'ALREADY_FAVORITED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
