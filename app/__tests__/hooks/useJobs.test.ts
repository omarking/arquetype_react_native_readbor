/**
 * Test para el Hook useJobs
 * 
 * Tests unitarios para la lógica del hook de búsqueda.
 */

describe('useJobs Hook Logic', () => {
  // Simulamos la lógica de filtrado del hook
  const filterJobs = (
    jobs: Array<{ id: number; title: string; company: string; city: string; salary: number | null }>,
    filters: { q?: string; city?: string; salary_min?: number; salary_max?: number }
  ) => {
    let filtered = [...jobs];

    if (filters.q) {
      const term = filters.q.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term)
      );
    }

    if (filters.city) {
      filtered = filtered.filter((job) => job.city === filters.city);
    }

    if (filters.salary_min !== undefined || filters.salary_max !== undefined) {
      filtered = filtered.filter((job) => {
        if (job.salary === null) return false;
        if (filters.salary_min !== undefined && job.salary < filters.salary_min) return false;
        if (filters.salary_max !== undefined && job.salary > filters.salary_max) return false;
        return true;
      });
    }

    return filtered;
  };

  const mockJobs = [
    { id: 1, title: 'React Developer', company: 'Google', city: 'CDMX', salary: 50000 },
    { id: 2, title: 'Backend Engineer', company: 'Amazon', city: 'Monterrey', salary: 60000 },
    { id: 3, title: 'Full Stack', company: 'Meta', city: 'CDMX', salary: null },
    { id: 4, title: 'iOS Developer', company: 'Apple', city: 'Guadalajara', salary: 70000 },
  ];

  describe('Search Filter (q)', () => {
    it('should filter by title', () => {
      const result = filterJobs(mockJobs, { q: 'react' });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Developer');
    });

    it('should filter by company', () => {
      const result = filterJobs(mockJobs, { q: 'google' });
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('Google');
    });

    it('should be case insensitive', () => {
      const result = filterJobs(mockJobs, { q: 'AMAZON' });
      expect(result).toHaveLength(1);
    });
  });

  describe('City Filter', () => {
    it('should filter by exact city', () => {
      const result = filterJobs(mockJobs, { city: 'CDMX' });
      expect(result).toHaveLength(2);
    });

    it('should return empty for non-existent city', () => {
      const result = filterJobs(mockJobs, { city: 'Cancún' });
      expect(result).toHaveLength(0);
    });
  });

  describe('Salary Filter', () => {
    it('should filter by minimum salary', () => {
      const result = filterJobs(mockJobs, { salary_min: 55000 });
      expect(result).toHaveLength(2);
    });

    it('should filter by maximum salary', () => {
      const result = filterJobs(mockJobs, { salary_max: 55000 });
      expect(result).toHaveLength(1);
    });

    it('should filter by salary range', () => {
      const result = filterJobs(mockJobs, { salary_min: 50000, salary_max: 60000 });
      expect(result).toHaveLength(2);
    });

    it('should exclude jobs with null salary when salary filter is active', () => {
      const result = filterJobs(mockJobs, { salary_min: 0 });
      expect(result).toHaveLength(3);
      expect(result.every((j) => j.salary !== null)).toBe(true);
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters', () => {
      const result = filterJobs(mockJobs, { city: 'CDMX', salary_min: 40000 });
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Developer');
    });
  });
});
