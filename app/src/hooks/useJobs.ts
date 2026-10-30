import { useState, useCallback, useRef, useEffect } from 'react';
import { jobsService } from '@/services/jobs.service';
import type { Job, JobFilters, Pagination } from '@/schemas/job.schema';

interface UseJobsResult {
  jobs: Job[];
  pagination: Pagination | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

const DEBOUNCE_MS = 300;

export function useJobs(initialFilters: JobFilters = {}): UseJobsResult {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<JobFilters>(initialFilters);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const currentFiltersRef = useRef(filters);

  const fetchJobs = useCallback(async (filtersToUse: JobFilters, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    const result = await jobsService.getJobs(filtersToUse);

    if (result.ok) {
      setJobs((prev) => (append ? [...prev, ...result.data.jobs] : result.data.jobs));
      setPagination(result.data.pagination);
    } else {
      setError(result.error.message);
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  const setFilters = useCallback((newFilters: JobFilters) => {
    const mergedFilters = { ...currentFiltersRef.current, ...newFilters, page: 1 };
    currentFiltersRef.current = mergedFilters;
    setFiltersState(mergedFilters);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchJobs(mergedFilters, false);
    }, DEBOUNCE_MS);
  }, [fetchJobs]);

  const refresh = useCallback(async () => {
    const refreshFilters = { ...currentFiltersRef.current, page: 1 };
    currentFiltersRef.current = refreshFilters;
    setFiltersState(refreshFilters);
    await fetchJobs(refreshFilters, false);
  }, [fetchJobs]);

  const loadMore = useCallback(async () => {
    if (!pagination || pagination.page >= pagination.totalPages || isLoadingMore) {
      return;
    }

    const nextPage = pagination.page + 1;
    const loadMoreFilters = { ...currentFiltersRef.current, page: nextPage };
    currentFiltersRef.current = loadMoreFilters;
    setFiltersState(loadMoreFilters);
    await fetchJobs(loadMoreFilters, true);
  }, [pagination, isLoadingMore, fetchJobs]);

  useEffect(() => {
    fetchJobs(initialFilters, false);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return {
    jobs,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    filters,
    setFilters,
    refresh,
    loadMore,
    hasMore,
  };
}
