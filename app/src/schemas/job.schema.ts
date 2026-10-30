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

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>;

export const paginatedJobsSchema = z.object({
  jobs: z.array(jobSchema),
  pagination: paginationSchema,
});

export type PaginatedJobs = z.infer<typeof paginatedJobsSchema>;

export interface JobFilters {
  q?: string;
  city?: string;
  salary_min?: number;
  salary_max?: number;
  sort?: 'date_desc' | 'date_asc' | 'salary_desc' | 'salary_asc' | 'relevance';
  page?: number;
  limit?: number;
}
