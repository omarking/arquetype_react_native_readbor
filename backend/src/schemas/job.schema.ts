import { z } from 'zod';

export const jobSchema = z.object({
  id: z.number(),
  title: z.string(),
  company: z.string(),
  city: z.string(),
  salary: z.number().nullable(),
  description: z.string(),
  publishedAt: z.string(),
  tags: z.array(z.string()),
});

export type Job = z.infer<typeof jobSchema>;

export const jobQuerySchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  salary_min: z.coerce.number().optional(),
  salary_max: z.coerce.number().optional(),
  sort: z.enum(['date_desc', 'date_asc', 'salary_desc', 'salary_asc', 'relevance']).default('date_desc'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type JobQuery = z.infer<typeof jobQuerySchema>;

export const paginatedJobsSchema = z.object({
  jobs: z.array(jobSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedJobs = z.infer<typeof paginatedJobsSchema>;
