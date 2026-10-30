import { z } from 'zod';
import { apiRequest } from './api';
import { jobSchema, paginatedJobsSchema, type Job, type JobFilters, type PaginatedJobs } from '@/schemas/job.schema';
import type { ApiResponse } from '@/schemas/api.schema';

const messageSchema = z.object({ message: z.string() });
const jobsArraySchema = z.array(jobSchema);

export const jobsService = {
  getJobs: async (filters: JobFilters = {}): Promise<ApiResponse<PaginatedJobs>> => {
    const params: Record<string, unknown> = {};
    
    if (filters.q) params.q = filters.q;
    if (filters.city) params.city = filters.city;
    if (filters.salary_min !== undefined) params.salary_min = filters.salary_min;
    if (filters.salary_max !== undefined) params.salary_max = filters.salary_max;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    return apiRequest('GET', '/jobs', paginatedJobsSchema, undefined, params);
  },

  getJobById: async (id: number): Promise<ApiResponse<Job>> => {
    return apiRequest('GET', `/jobs/${id}`, jobSchema);
  },

  applyToJob: async (jobId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest('POST', `/jobs/${jobId}/apply`, messageSchema);
  },

  cancelApplication: async (jobId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest('DELETE', `/jobs/${jobId}/apply`, messageSchema);
  },

  addFavorite: async (jobId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest('POST', `/jobs/${jobId}/favorite`, messageSchema);
  },

  removeFavorite: async (jobId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest('DELETE', `/jobs/${jobId}/favorite`, messageSchema);
  },

  getApplications: async (): Promise<ApiResponse<Job[]>> => {
    return apiRequest('GET', '/applications', jobsArraySchema);
  },

  getFavorites: async (): Promise<ApiResponse<Job[]>> => {
    return apiRequest('GET', '/favorites', jobsArraySchema);
  },
};
