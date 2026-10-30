import { create } from 'zustand';
import type { Job } from '@/schemas/job.schema';

interface JobsState {
  selectedJob: Job | null;
  applications: Set<number>;
  favorites: Set<number>;
  setSelectedJob: (job: Job) => void;
  clearSelectedJob: () => void;
  addApplication: (jobId: number) => void;
  removeApplication: (jobId: number) => void;
  addFavorite: (jobId: number) => void;
  removeFavorite: (jobId: number) => void;
  isApplied: (jobId: number) => boolean;
  isFavorited: (jobId: number) => boolean;
  setApplications: (jobIds: number[]) => void;
  setFavorites: (jobIds: number[]) => void;
}

export const useJobsStore = create<JobsState>((set, get) => ({
  selectedJob: null,
  applications: new Set(),
  favorites: new Set(),

  setSelectedJob: (job) => set({ selectedJob: job }),
  clearSelectedJob: () => set({ selectedJob: null }),

  addApplication: (jobId) =>
    set((state) => ({
      applications: new Set([...state.applications, jobId]),
    })),

  removeApplication: (jobId) =>
    set((state) => {
      const newSet = new Set(state.applications);
      newSet.delete(jobId);
      return { applications: newSet };
    }),

  addFavorite: (jobId) =>
    set((state) => ({
      favorites: new Set([...state.favorites, jobId]),
    })),

  removeFavorite: (jobId) =>
    set((state) => {
      const newSet = new Set(state.favorites);
      newSet.delete(jobId);
      return { favorites: newSet };
    }),

  isApplied: (jobId) => get().applications.has(jobId),
  isFavorited: (jobId) => get().favorites.has(jobId),

  setApplications: (jobIds) => set({ applications: new Set(jobIds) }),
  setFavorites: (jobIds) => set({ favorites: new Set(jobIds) }),
}));
