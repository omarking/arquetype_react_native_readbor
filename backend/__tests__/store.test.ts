import { store } from '../src/data/store';

describe('InMemoryStore', () => {
  const userId = 1;
  const jobId = 1;

  describe('Jobs', () => {
    it('should return all jobs', () => {
      const jobs = store.getJobs();
      expect(jobs.length).toBeGreaterThanOrEqual(90);
    });

    it('should find job by id', () => {
      const job = store.getJobById(1);
      expect(job).toBeDefined();
      expect(job?.id).toBe(1);
    });

    it('should return undefined for non-existent job', () => {
      const job = store.getJobById(99999);
      expect(job).toBeUndefined();
    });
  });

  describe('Applications', () => {
    it('should add application', () => {
      const initiallyApplied = store.hasApplied(userId, jobId);
      
      if (!initiallyApplied) {
        store.addApplication(userId, jobId);
      }
      
      expect(store.hasApplied(userId, jobId)).toBe(true);
    });

    it('should get user applications', () => {
      const applications = store.getApplications(userId);
      expect(Array.isArray(applications)).toBe(true);
    });

    it('should remove application', () => {
      store.addApplication(userId, 2);
      expect(store.hasApplied(userId, 2)).toBe(true);
      
      store.removeApplication(userId, 2);
      expect(store.hasApplied(userId, 2)).toBe(false);
    });
  });

  describe('Favorites', () => {
    it('should add favorite', () => {
      const initiallyFavorited = store.hasFavorited(userId, jobId);
      
      if (!initiallyFavorited) {
        store.addFavorite(userId, jobId);
      }
      
      expect(store.hasFavorited(userId, jobId)).toBe(true);
    });

    it('should get user favorites', () => {
      const favorites = store.getFavorites(userId);
      expect(Array.isArray(favorites)).toBe(true);
    });

    it('should remove favorite', () => {
      store.addFavorite(userId, 3);
      expect(store.hasFavorited(userId, 3)).toBe(true);
      
      store.removeFavorite(userId, 3);
      expect(store.hasFavorited(userId, 3)).toBe(false);
    });
  });

  describe('Token Blacklist', () => {
    it('should blacklist token', () => {
      const token = 'test-token-123';
      
      expect(store.isTokenBlacklisted(token)).toBe(false);
      
      store.blacklistToken(token);
      
      expect(store.isTokenBlacklisted(token)).toBe(true);
    });
  });
});
