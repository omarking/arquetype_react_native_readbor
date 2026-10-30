import { jobs } from './seed';
import type { Job } from '../schemas/job.schema';

interface ApplicationRecord {
  jobId: number;
  userId: number;
  appliedAt: string;
}

interface FavoriteRecord {
  jobId: number;
  userId: number;
  favoritedAt: string;
}

class InMemoryStore {
  private jobs: Job[] = [...jobs];
  private applications: ApplicationRecord[] = [];
  private favorites: FavoriteRecord[] = [];
  private blacklistedTokens: Set<string> = new Set();

  getJobs(): Job[] {
    return this.jobs;
  }

  getJobById(id: number): Job | undefined {
    return this.jobs.find((job) => job.id === id);
  }

  hasApplied(userId: number, jobId: number): boolean {
    return this.applications.some(
      (app) => app.userId === userId && app.jobId === jobId
    );
  }

  addApplication(userId: number, jobId: number): ApplicationRecord {
    const record: ApplicationRecord = {
      jobId,
      userId,
      appliedAt: new Date().toISOString(),
    };
    this.applications.push(record);
    return record;
  }

  removeApplication(userId: number, jobId: number): boolean {
    const index = this.applications.findIndex(
      (app) => app.userId === userId && app.jobId === jobId
    );
    if (index === -1) return false;
    this.applications.splice(index, 1);
    return true;
  }

  getApplications(userId: number): Job[] {
    const userApps = this.applications.filter((app) => app.userId === userId);
    return userApps
      .map((app) => this.getJobById(app.jobId))
      .filter((job): job is Job => job !== undefined);
  }

  hasFavorited(userId: number, jobId: number): boolean {
    return this.favorites.some(
      (fav) => fav.userId === userId && fav.jobId === jobId
    );
  }

  addFavorite(userId: number, jobId: number): FavoriteRecord {
    const record: FavoriteRecord = {
      jobId,
      userId,
      favoritedAt: new Date().toISOString(),
    };
    this.favorites.push(record);
    return record;
  }

  removeFavorite(userId: number, jobId: number): boolean {
    const index = this.favorites.findIndex(
      (fav) => fav.userId === userId && fav.jobId === jobId
    );
    if (index === -1) return false;
    this.favorites.splice(index, 1);
    return true;
  }

  getFavorites(userId: number): Job[] {
    const userFavs = this.favorites.filter((fav) => fav.userId === userId);
    return userFavs
      .map((fav) => this.getJobById(fav.jobId))
      .filter((job): job is Job => job !== undefined);
  }

  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
}

export const store = new InMemoryStore();
