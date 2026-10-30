/**
 * Test para el módulo de API
 * 
 * Tests unitarios para validación de respuestas con Zod.
 */

import { z } from 'zod';

describe('API Response Validation', () => {
  // Schemas de prueba
  const userSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string(),
  });

  const jobSchema = z.object({
    id: z.number(),
    title: z.string(),
    company: z.string(),
    city: z.string(),
    salary: z.number().nullable(),
    description: z.string(),
    publishedAt: z.string(),
    tags: z.array(z.string()),
  });

  const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
      ok: z.literal(true),
      data: dataSchema,
    });

  const errorResponseSchema = z.object({
    ok: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }),
  });

  describe('User Schema Validation', () => {
    it('should validate correct user data', () => {
      const validUser = {
        id: 1,
        email: 'test@occ.com.mx',
        name: 'Usuario Prueba',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        id: 1,
        email: 'not-an-email',
        name: 'Usuario Prueba',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const incompleteUser = {
        id: 1,
        email: 'test@occ.com.mx',
      };

      const result = userSchema.safeParse(incompleteUser);
      expect(result.success).toBe(false);
    });
  });

  describe('Job Schema Validation', () => {
    it('should validate correct job data', () => {
      const validJob = {
        id: 1,
        title: 'React Developer',
        company: 'OCC',
        city: 'CDMX',
        salary: 50000,
        description: 'Descripción del puesto',
        publishedAt: '2024-01-15T10:00:00Z',
        tags: ['React', 'TypeScript'],
      };

      const result = jobSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it('should accept null salary', () => {
      const jobWithNullSalary = {
        id: 1,
        title: 'React Developer',
        company: 'OCC',
        city: 'CDMX',
        salary: null,
        description: 'Descripción',
        publishedAt: '2024-01-15T10:00:00Z',
        tags: [],
      };

      const result = jobSchema.safeParse(jobWithNullSalary);
      expect(result.success).toBe(true);
    });

    it('should reject job with invalid salary type', () => {
      const invalidJob = {
        id: 1,
        title: 'React Developer',
        company: 'OCC',
        city: 'CDMX',
        salary: 'fifty thousand',
        description: 'Descripción',
        publishedAt: '2024-01-15T10:00:00Z',
        tags: [],
      };

      const result = jobSchema.safeParse(invalidJob);
      expect(result.success).toBe(false);
    });
  });

  describe('Response Envelope Validation', () => {
    it('should validate success response', () => {
      const response = {
        ok: true,
        data: {
          id: 1,
          email: 'test@occ.com.mx',
          name: 'Test',
        },
      };

      const schema = successResponseSchema(userSchema);
      const result = schema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it('should validate error response', () => {
      const response = {
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Vacante no encontrada',
        },
      };

      const result = errorResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
  });
});
